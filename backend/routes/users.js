const express = require('express');
const router = express.Router();
const User = require('../models/User');
const {profileUpload,handleCloudinaryUpload}= require("../middleware/profileimg.js")
const crypto = require('crypto');

// Encryption key (store in .env in production)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY ; // Must be 32 chars
const ENCRYPTION_IV = process.env.ENCRYPTION_IV ; // Must be 16 chars

// Encrypt GitHub token
function encryptToken(text) {
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), Buffer.from(ENCRYPTION_IV));
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return encrypted.toString('hex');
}

// Decrypt GitHub token
function decryptToken(text) {
  const encryptedText = Buffer.from(text, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), Buffer.from(ENCRYPTION_IV));
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

// Check username availability
router.get('/check-username/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username: username.toLowerCase() });
    
    if (user) {
      return res.json({ available: false, message: 'Username is already taken' });
    }
    
    res.json({ available: true, message: 'Username is available' });
  } catch (error) {
    console.error('Username check error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/',
    profileUpload,
    handleCloudinaryUpload,
    async (req, res) => {
    try {
        const jwt = require('jsonwebtoken');
        const token = req.cookies.token
        if (!token) {
            return res.status(401).json({ message: "Unauthorised user" })
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id
        // console.log("decoded",decoded   )
        const { name, username, college, branch, bio, github, linkedin, leetcode, gfg, codeforces, hackerrank, hackerearth, websites, profileImg } = req.body;
        
        // Check if username is being changed and if it's available
        if (username) {
          const existingUser = await User.findOne({ 
            username: username.toLowerCase(),
            _id: { $ne: userId }
          });
          
          if (existingUser) {
            return res.status(400).json({ message: 'Username is already taken' });
          }
        }
        
        // Check if GitHub profile link is being changed
        const currentUser = await User.findById(userId);
        const isGithubLinkChanged = github && currentUser.githubProfileLink !== github;
        
        const updateData={
            name: name,
            username: username ? username.toLowerCase() : undefined,
            profileImage: profileImg,
            collegeName: college,
            Branch: branch,
            Bio: bio,
            githubProfileLink: github,
            linkedInProfileLink: linkedin,
            leetcodeProfileLink: leetcode,
            gfgProfileLink: gfg,
            codeforcesProfileLink: codeforces,
            hackerrankProfileLink: hackerrank,
            hackerearthProfileLink: hackerearth,
            websites: websites ? JSON.parse(websites) : [],
        }
        
        // If GitHub link changed, reset deep fetch settings and delete token
        if (isGithubLinkChanged) {
            updateData.fetchPublicRepos = false;
            updateData.fetchPrivateRepos = false;
            updateData.fetchLanguages = false;
            updateData.githubToken = null;
        }
        
        if(req.body.profileImg){
            updateData.profileImage= req.body.profileImg
        }
        const updateUser = await User.findByIdAndUpdate(
            userId,
            updateData,
             { new: true,runValidators:true }).select('-password');
        if(!updateUser){
            return res.status(404).json({message:"User not found"})
        }
        res.status(200).json({
            message:"Profile updated",
            user:updateUser
        })
    }catch(error){
        console.log("profile update error")
        return res.status(500).json({message:"Profile update error"})
    }
})

// Get user settings
router.get('/settings', async (req, res) => {
  try {
    const jwt = require('jsonwebtoken');
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ message: "Unauthorised user" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('fetchPublicRepos fetchPrivateRepos fetchLanguages githubToken theme');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({
      fetchPublicRepos: user.fetchPublicRepos || false,
      fetchPrivateRepos: user.fetchPrivateRepos || false,
      fetchLanguages: user.fetchLanguages || false,
      githubToken: user.githubToken ? true : false, // Just return if token exists
      theme: user.theme || 'light',
    });
  } catch (error) {
    console.error("Get settings error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update user settings
router.put('/settings', async (req, res) => {
  try {
    const jwt = require('jsonwebtoken');
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ message: "Unauthorised user" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { fetchPublicRepos, fetchPrivateRepos, fetchLanguages, githubToken, theme } = req.body;
    if(githubToken && (typeof githubToken !== 'string' || githubToken.trim()=== '')){
        return res.status(400).json({message:"Invalid github token"})
    }
    // console.log("gtoken",githubToken)
    const updateData = {};
    
    // Only update fields that are explicitly provided
    if (fetchPublicRepos !== undefined) {
      updateData.fetchPublicRepos = fetchPublicRepos;
    }
    if (fetchPrivateRepos !== undefined) {
      updateData.fetchPrivateRepos = fetchPrivateRepos;
    }
    if (fetchLanguages !== undefined) {
      updateData.fetchLanguages = fetchLanguages;
    }
    
    // Update theme if provided
    if (theme && ['light', 'dark'].includes(theme)) {
      updateData.theme = theme;
    }
    
    // Encrypt and save GitHub token if provided
    if (githubToken && githubToken.trim()) {
      updateData.githubToken = encryptToken(githubToken);
    }
    
    // If private repos disabled, ensure token requirement
    if (fetchPrivateRepos && !githubToken) {
      const user = await User.findById(decoded.id).select('githubToken');
      if (!user || !user.githubToken) {
        return res.status(400).json({ message: "GitHub token required for private repos" });
      }
    }
    
    
    const updatedUser = await User.findByIdAndUpdate(
      decoded.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -githubToken');

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    // console.log("updatedUser",updatedUser)
    res.json({
      message: "Settings updated successfully", 
      fetchPublicRepos: updatedUser.fetchPublicRepos || false,
      fetchPrivateRepos: updatedUser.fetchPrivateRepos || false,
      fetchLanguages: updatedUser.fetchLanguages || false,
      githubToken: updatedUser.githubToken ? true : false,
      theme: updatedUser.theme || 'light',
    });
  } catch (error) {
    console.error("Update settings error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Hide a GitHub repository
router.post('/hideRepo', async (req, res) => {
  try {
    const jwt = require('jsonwebtoken');
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ message: "Unauthorised user" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { repoUrl } = req.body;
    
    if (!repoUrl) {
      return res.status(400).json({ message: "Repository URL required" });
    }
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Add to hidden repos if not already hidden
    if (!user.hiddenGithubRepos.includes(repoUrl)) {
      user.hiddenGithubRepos.push(repoUrl);
      await user.save();
    }
    
    res.json({ 
      message: "Repository hidden successfully",
      hiddenRepos: user.hiddenGithubRepos
    });
  } catch (error) {
    console.error("Hide repo error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Unhide a GitHub repository
router.post('/unhideRepo', async (req, res) => {
  try {
    const jwt = require('jsonwebtoken');
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ message: "Unauthorised user" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { repoUrl } = req.body;
    
    if (!repoUrl) {
      return res.status(400).json({ message: "Repository URL required" });
    }
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Remove from hidden repos
    user.hiddenGithubRepos = user.hiddenGithubRepos.filter(url => url !== repoUrl);
    await user.save();
    
    res.json({ 
      message: "Repository unhidden successfully",
      hiddenRepos: user.hiddenGithubRepos
    });
  } catch (error) {
    console.error("Unhide repo error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get hidden repositories
router.get('/hiddenRepos', async (req, res) => {
  try {
    const jwt = require('jsonwebtoken');
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ message: "Unauthorised user" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('hiddenGithubRepos');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ hiddenRepos: user.hiddenGithubRepos || [] });
  } catch (error) {
    console.error("Get hidden repos error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get hidden repos by username (public access for viewing user's public profile)
router.get('/hiddenRepos_from_username', async (req, res) => {
  try {
    const username = req.headers['x-user-name'];
    
    if (!username) {
      return res.status(400).json({ message: 'Username is required in x-user-name header' });
    }
    
    const user = await User.findOne({ username: username.toLowerCase() }).select('hiddenGithubRepos');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ hiddenRepos: user.hiddenGithubRepos || [] });
  } catch (error) {
    console.error("Get hidden repos error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Follow a user
router.post('/follow/:userId', async (req, res) => {
  try {
    const jwt = require('jsonwebtoken');
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ message: "Unauthorised user" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUserId = decoded.id;
    const targetUserId = req.params.userId;
    
    if (currentUserId === targetUserId) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }
    
    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);
    
    if (!currentUser || !targetUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Check if already following
    if (currentUser.following.includes(targetUserId)) {
      return res.status(400).json({ message: "Already following this user" });
    }
    
    // Add to following and followers
    currentUser.following.push(targetUserId);
    targetUser.followers.push(currentUserId);
    
    await currentUser.save();
    await targetUser.save();
    
    res.json({ 
      message: "Successfully followed user",
      following: currentUser.following.length,
      followers: currentUser.followers.length
    });
  } catch (error) {
    console.error("Follow user error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Unfollow a user
router.post('/unfollow/:userId', async (req, res) => {
  try {
    const jwt = require('jsonwebtoken');
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ message: "Unauthorised user" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUserId = decoded.id;
    const targetUserId = req.params.userId;
    
    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);
    
    if (!currentUser || !targetUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Remove from following and followers
    currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
    targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId);
    
    await currentUser.save();
    await targetUser.save();
    
    res.json({ 
      message: "Successfully unfollowed user",
      following: currentUser.following.length,
      followers: currentUser.followers.length
    });
  } catch (error) {
    console.error("Unfollow user error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get followers list
router.get('/followers', async (req, res) => {
  try {
    const jwt = require('jsonwebtoken');
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ message: "Unauthorised user" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id)
      .populate('followers', 'name profileImage email');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ followers: user.followers });
  } catch (error) {
    console.error("Get followers error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get following list
router.get('/following', async (req, res) => {
  try {
    const jwt = require('jsonwebtoken');
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ message: "Unauthorised user" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id)
      .populate('following', 'name profileImage email');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ following: user.following });
  } catch (error) {
    console.error("Get following error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get public profile by username
router.get('/profile/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const Project = require('../models/Project');
    
    // Find user by username and populate followers/following
    const user = await User.findOne({ username: username.toLowerCase() })
      .select('-password -githubToken -email') // Exclude sensitive fields
      .populate('followers', 'name profileImage username')
      .populate('following', 'name profileImage username');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Get user's projects
    const projects = await Project.find({ user: user._id }).sort({ createdAt: -1 });
    
    // Calculate GitHub stats if GitHub profile link exists
    let githubStats = {
      totalCommits: user.totalCommits || 0,
      lastCommitDate: user.lastCommitDate || null,
      totalRepos: projects.length, // ✅ Count projects
      publicRepos: projects.filter(p => p.isPublic).length,
      privateRepos: projects.filter(p => !p.isPublic).length
    };
    
    // Check if user has enabled repo fetching
    const canShowGithubRepos = user.fetchPublicRepos || user.fetchPrivateRepos;
    
    res.json({
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        profileImage: user.profileImage,
        collegeName: user.collegeName,
        Branch: user.Branch,
        Bio: user.Bio,
        githubProfileLink: user.githubProfileLink,
        linkedInProfileLink: user.linkedInProfileLink,
        leetcodeProfileLink: user.leetcodeProfileLink,
        gfgProfileLink: user.gfgProfileLink,
        codeforcesProfileLink: user.codeforcesProfileLink,
        hackerrankProfileLink: user.hackerrankProfileLink,
        hackerearthProfileLink: user.hackerearthProfileLink,
        websites: user.websites,
        followers: user.followers,
        following: user.following,
        followersCount: user.followers.length,
        followingCount: user.following.length,
        fetchPublicRepos: user.fetchPublicRepos,
        fetchPrivateRepos: user.fetchPrivateRepos,
        totalCommits: user.totalCommits,
        lastCommitDate: user.lastCommitDate,
        projectRankings: user.projectRankings ? (() => {
          const rankings = {};
          for (const [key, value] of user.projectRankings.entries()) {
            const decodedKey = key.replace(/___DOT___/g, '.');
            rankings[decodedKey] = value;
          }
          return rankings;
        })() : {},
        contributionRankings: user.contributionRankings ? (() => {
          const rankings = {};
          for (const [key, value] of user.contributionRankings.entries()) {
            const decodedKey = key.replace(/___DOT___/g, '.');
            rankings[decodedKey] = value;
          }
          return rankings;
        })() : {},
      },
      projects,
      githubStats,
      canShowGithubRepos
    });
  } catch (error) {
    console.error("Get public profile error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update GitHub stats (commits and last commit date)
router.post('/updateGithubStats', async (req, res) => {
  try {
    const jwt = require('jsonwebtoken');
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ message: "Unauthorised user" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { totalCommits, lastCommitDate } = req.body;
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    user.totalCommits = totalCommits || 0;
    user.lastCommitDate = lastCommitDate || null;
    await user.save();
    
    res.json({ 
      message: "GitHub stats updated successfully",
      totalCommits: user.totalCommits,
      lastCommitDate: user.lastCommitDate
    });
  } catch (error) {
    console.error("Update GitHub stats error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update theme preference
router.put('/theme', async (req, res) => {
  try {
    const jwt = require('jsonwebtoken');
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { theme } = req.body;

    if (!theme || !['light', 'dark'].includes(theme)) {
      return res.status(400).json({ message: 'Invalid theme value' });
    }

    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { theme },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      message: 'Theme updated successfully',
      theme: user.theme
    });
  } catch (error) {
    console.error('Theme update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get project rankings
router.get('/rankings', async (req, res) => {
  try {
    const jwt = require('jsonwebtoken');
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId || decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Convert Maps to plain objects for JSON serialization
    // And decode the keys back to original URLs
    const projectRankings = {};
    const contributionRankings = {};
    
    if (user.projectRankings) {
      for (const [key, value] of user.projectRankings.entries()) {
        const decodedKey = key.replace(/___DOT___/g, '.');
        projectRankings[decodedKey] = value;
      }
    }
    
    if (user.contributionRankings) {
      for (const [key, value] of user.contributionRankings.entries()) {
        const decodedKey = key.replace(/___DOT___/g, '.');
        contributionRankings[decodedKey] = value;
      }
    }

    res.json({ 
      projectRankings,
      contributionRankings
    });
  } catch (error) {
    console.error('Fetch rankings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update project ranking
router.post('/updateRanking', async (req, res) => {
  try {
    const jwt = require('jsonwebtoken');
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { projectId, rank, type } = req.body;

    console.log('Update ranking request:', { projectId, rank, type });
    console.log('Decoded JWT:', decoded);

    if (!projectId || rank === undefined) {
      return res.status(400).json({ message: 'Project ID and rank are required' });
    }

    const userId = decoded.userId || decoded.id;
    console.log('Looking for user with ID:', userId);
    
    const user = await User.findById(userId);

    if (!user) {
      console.log('User not found with ID:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User found:', user._id);
    console.log('Current projectRankings:', user.projectRankings);
    console.log('Current contributionRankings:', user.contributionRankings);

    // Encode the projectId to replace dots with a safe character
    const encodedProjectId = projectId.replace(/\./g, '___DOT___');
    console.log('Encoded project ID:', encodedProjectId);

    // Update the appropriate ranking map
    if (type === 'contribution') {
      if (!user.contributionRankings) {
        user.contributionRankings = new Map();
      }
      user.contributionRankings.set(encodedProjectId, rank);
      console.log('Updated contribution ranking:', encodedProjectId, rank);
      // Mark the field as modified for Mongoose
      user.markModified('contributionRankings');
    } else {
      if (!user.projectRankings) {
        user.projectRankings = new Map();
      }
      user.projectRankings.set(encodedProjectId, rank);
      console.log('Updated project ranking:', encodedProjectId, rank);
      // Mark the field as modified for Mongoose
      user.markModified('projectRankings');
    }

    await user.save();

    // Convert Maps to plain objects for JSON serialization
    // And decode the keys back to original URLs
    const projectRankings = {};
    const contributionRankings = {};
    
    if (user.projectRankings) {
      for (const [key, value] of user.projectRankings.entries()) {
        const decodedKey = key.replace(/___DOT___/g, '.');
        projectRankings[decodedKey] = value;
      }
    }
    
    if (user.contributionRankings) {
      for (const [key, value] of user.contributionRankings.entries()) {
        const decodedKey = key.replace(/___DOT___/g, '.');
        contributionRankings[decodedKey] = value;
      }
    }

    console.log('Returning rankings:', { projectRankings, contributionRankings });

    res.json({ 
      message: 'Ranking updated successfully',
      projectRankings,
      contributionRankings
    });
  } catch (error) {
    console.error('Update ranking error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message, stack: error.stack });
  }
});

module.exports = router;