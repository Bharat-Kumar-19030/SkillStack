const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Project = require('../models/Project');

// Get user from username (used by publicProjects component)
router.get('/user_from_username', async (req, res) => {
  try {
    const username = req.headers['x-user-name'];
    
    if (!username) {
      return res.status(400).json({ message: 'Username is required in x-user-name header' });
    }
    
    const user = await User.findOne({ username: username.toLowerCase() })
      .select('-password -githubToken -email');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Convert Map to plain object for proper JSON serialization
    const userData = user.toObject();
    
    // Helper function to convert escaped URLs back to normal format
    const unescapeRankings = (rankings) => {
      if (!rankings) return {};
      const unescaped = {};
      Object.entries(rankings).forEach(([key, value]) => {
        // Replace ___DOT___ with actual dots
        const normalizedKey = key.replace(/___DOT___/g, '.');
        unescaped[normalizedKey] = value;
      });
      return unescaped;
    };
    
    // Handle projectRankings conversion
    if (userData.projectRankings) {
      if (userData.projectRankings instanceof Map) {
        userData.projectRankings = Object.fromEntries(userData.projectRankings);
      } else if (typeof userData.projectRankings === 'object') {
        // Already an object, but might need flattening if it's a mongoose Map
        userData.projectRankings = JSON.parse(JSON.stringify(userData.projectRankings));
      }
      // Unescape the URLs
      userData.projectRankings = unescapeRankings(userData.projectRankings);
    }
    
    // Handle contributionRankings conversion
    if (userData.contributionRankings) {
      if (userData.contributionRankings instanceof Map) {
        userData.contributionRankings = Object.fromEntries(userData.contributionRankings);
      } else if (typeof userData.contributionRankings === 'object') {
        // Already an object, but might need flattening if it's a mongoose Map
        userData.contributionRankings = JSON.parse(JSON.stringify(userData.contributionRankings));
      }
      // Unescape the URLs
      userData.contributionRankings = unescapeRankings(userData.contributionRankings);
    }
    
    console.log('Sending user data for:', username);
    console.log('Project rankings (unescaped):', userData.projectRankings);
    console.log('Project rankings count:', userData.projectRankings ? Object.keys(userData.projectRankings).length : 0);
    console.log('Contribution rankings count:', userData.contributionRankings ? Object.keys(userData.contributionRankings).length : 0);
    
    res.json(userData);
  } catch (error) {
    console.error('Error fetching user from username:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
router.post("/user_activity",async(req,res)=>{
  try{
    const {repo, before, head}=req.body;
    const compareUrl = await fetch(`https://api.github.com/repos/${repo}/compare/${before.substring(0, 10)}...${head.substring(0, 10)}`,
  {
    headers:{
    'Authorization': `token ${process.env.GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json'
    }
  });
    res.json(await compareUrl.json());
          
  }
  catch(error){
    console.error('Error fetching user activity:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
})
router.post("/user_events",async(req,res)=>{
  try{
    
    const {githubUsername}=req.body;
    const events = await fetch(`https://api.github.com/users/${githubUsername}/events/public?per_page=15`,
  {
    headers:{
    'Authorization': `token ${process.env.GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json'
    }
  });
    res.json(await events.json());
          
  }
  catch(error){
    console.error('Error fetching user activity:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
})

module.exports = router;
