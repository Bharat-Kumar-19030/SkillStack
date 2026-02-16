const express = require("express");
const router = express.Router();
const User = require("../models/User");
const crypto = require('crypto');

// Encryption constants (must match users.js)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const ENCRYPTION_IV = process.env.ENCRYPTION_IV;

// Decrypt GitHub token
function decryptToken(text) {
    const encryptedText = Buffer.from(text, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), Buffer.from(ENCRYPTION_IV));
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

router.post("/fetchRepoDetails", async (req, res) => {
    try {

        const repoUrl = req.body.githubUrl;
        console.log(repoUrl);
        if (!repoUrl) {

            return res.status(400).json({ message: "Repository URL is required" });
        }
        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);

        if (!match) {
            return res.status(400).json({ message: "Invalid GitHub URL format" });
        }
        const [, owner, repo] = match;
        const cleanRepo = repo.replace(/\.git$/, ''); // Remove .git if present

        // Fetch from GitHub API 
        const repodetail = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}`,
            {
                headers:
                    { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` },
                "User-Agent": "NodeServer",
            }
        );

        if (!repodetail.ok) {
            return res.status(400).json({ message: "Failed to fetch repository details" });
        }
        const repoData = await repodetail.json();
        
        // Fetch languages for the repository
        const languagesResponse = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}/languages`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                    "User-Agent": "NodeServer",
                }
            }
        );
        
        let languages = {};
        if (languagesResponse.ok) {
            languages = await languagesResponse.json();
        }
        
        // Fetch commit count
        let commitCount = 0;
        try {
            const commitsResponse = await fetch(
                `https://api.github.com/repos/${owner}/${cleanRepo}/commits?per_page=1`,
                {
                    headers: {
                        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                        "User-Agent": "NodeServer",
                    }
                }
            );
            if (commitsResponse.ok) {
                const linkHeader = commitsResponse.headers.get('Link');
                if (linkHeader) {
                    const match = linkHeader.match(/page=(\d+)>; rel="last"/);
                    commitCount = match ? parseInt(match[1]) : 1;
                } else {
                    const commits = await commitsResponse.json();
                    commitCount = commits.length;
                }
            }
        } catch (err) {
            console.error('Failed to fetch commits:', err);
            commitCount = 0;
        }
        
        // Add languages and commit count to the response
        repoData.languages = languages;
        repoData.commitCount = commitCount;
        
        res.json(repoData);
    } catch (err) {
        console.error("Github fetch error:", err);
        res.status(500).json({ message: "Failed to fetch repository details" });
    }

})

// Fetch all repositories for a user from GitHub
router.get("/userRepos", async (req, res) => {
    try {
        const jwt = require('jsonwebtoken');
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "Unauthorised user" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user with githubToken field
        const user = await User.findById(decoded.id).select('+githubToken fetchPublicRepos fetchPrivateRepos githubProfileLink');

        if (!user) {

            return res.status(404).json({ message: "User not found" });
        }
        // console.log("user",user);

        // Extract GitHub username from githubProfileLink
        let githubUsername = null;

        if (user.githubProfileLink) {
            const match = user.githubProfileLink.match(/github\.com\/([^\/]+)/);
            if (match) {
                githubUsername = match[1];
            }
        }

        if (!githubUsername) {
            return res.status(400).json({
                message: "GitHub profile link not found. Please add your GitHub profile link in your profile settings."
            });
        }

        // Build headers
        const headers = {
            'Accept': 'application/vnd.github.v3+json',
            "User-Agent": "NodeServer",
        };

        // Use token if fetching private repos is enabled and token exists
        let apiUrl = `https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=100`;

        if (user.fetchPrivateRepos && user.githubToken) {
            try {
                const decryptedToken = decryptToken(user.githubToken);
                console.log("decpriptedtoken", decryptedToken)
                headers['Authorization'] = `Bearer ${decryptedToken}`;
                apiUrl = `https://api.github.com/user/repos?affiliation=owner&per_page=100&sort=updated&visibility=all`;
                console.log("calling private all")
            } catch (err) {
                console.error('Token decryption error:', err);
                return res.status(400).json({ message: "Invalid GitHub token. Please update your token in settings." });
            }
        } else if (user.fetchPublicRepos) {
            apiUrl = `https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=100`;
            headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
            console.log("calling public only")

        }

        // Fetch user's repositories from GitHub API
        const response = await fetch(apiUrl, { headers });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('GitHub API error:', response.status, errorText);
            return res.status(response.status).json({
                message: "Failed to fetch GitHub repositories. Please check your token and try again."
            });
        }

        const repos = await response.json();



        // Format the response with relevant details
        const formattedRepos = await Promise.all(
            repos.map(async (repo) => {
                // Always fetch languages for all repositories
                try {
                    const langdata = await fetch(`https://api.github.com/repos/${repo.full_name}/languages`, { headers });
                    const langjson = await langdata.json();
                    repo.languages = langjson;
                } catch (err) {
                    console.error(`Failed to fetch languages for ${repo.full_name}:`, err);
                    repo.languages = {};
                }

                // Fetch commit count
                let commitCount = 0;
                try {
                    const commitsResponse = await fetch(
                        `https://api.github.com/repos/${repo.full_name}/commits?per_page=1`,
                        { headers }
                    );
                    if (commitsResponse.ok) {
                        const linkHeader = commitsResponse.headers.get('Link');
                        if (linkHeader) {
                            const match = linkHeader.match(/page=(\d+)>; rel="last"/);
                            commitCount = match ? parseInt(match[1]) : 1;
                        } else {
                            // If no Link header, there's only one page
                            const commits = await commitsResponse.json();
                            commitCount = commits.length;
                        }
                    }
                } catch (err) {
                    console.error(`Failed to fetch commits for ${repo.full_name}:`, err);
                    commitCount = 0;
                }

                return {
                    id: repo.id,
                    name: repo.name,
                    fullName: repo.full_name,
                    description: repo.description,
                    private: repo.private,
                    htmlUrl: repo.html_url,
                    language: repo.language,
                    stargazersCount: repo.stargazers_count,
                    forksCount: repo.forks_count,
                    watchersCount: repo.watchers_count,
                    topics: repo.topics || [],
                    createdAt: repo.created_at,
                    updatedAt: repo.updated_at,
                    commitCount: commitCount,
                    homepage: repo.homepage,
                    size: repo.size,
                    defaultBranch: repo.default_branch,
                    openIssuesCount: repo.open_issues_count,
                    hasIssues: repo.has_issues,
                    hasWiki: repo.has_wiki,
                    hasPages: repo.has_pages,
                    license: repo.license?.name || null,
                    languages: repo.languages,
                    owner: {
                        login: repo.owner.login,
                        avatarUrl: repo.owner.avatar_url,
                    }
                }

            }));

        res.json({
            username: githubUsername,
            totalRepos: formattedRepos.length,
            repos: formattedRepos
        });

    } catch (err) {
        console.error("GitHub user repos fetch error:", err);
        res.status(500).json({ message: "Failed to fetch user repositories", error: err.message });
    }
});



// Fetch all contributions for a user from GitHub
router.get("/contributions", async (req, res) => {
    try {
        const jwt = require('jsonwebtoken');
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "Unauthorised user" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user with githubToken field
        const user = await User.findById(decoded.id).select('+githubToken githubProfileLink');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Extract GitHub username from githubProfileLink
        let githubUsername = null;

        if (user.githubProfileLink) {
            const match = user.githubProfileLink.match(/github\.com\/([^\/]+)/);
            if (match) {
                githubUsername = match[1];
            }
        }

        if (!githubUsername) {
            return res.status(400).json({
                message: "GitHub profile link not found. Please add your GitHub profile link in your profile settings."
            });
        }

        // Check if user has GitHub token
        if (!user.githubToken) {
            return res.status(400).json({ 
                message: "GitHub token required. Please add your GitHub token in settings to view contributions." 
            });
        }

        // Build headers
        const headers = {
            'Accept': 'application/vnd.github.v3+json',
            "User-Agent": "NodeServer",
        };

        let repos = [];

        // Decrypt and use GitHub token
        try {
            const decryptedToken = decryptToken(user.githubToken);
            headers['Authorization'] = `Bearer ${decryptedToken}`;
            const apiUrl = `https://api.github.com/user/repos?affiliation=collaborator&per_page=100&sort=updated`;
            
            console.log("Fetching contributed repos for:", githubUsername);
            
            const response = await fetch(apiUrl, { headers });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('GitHub API error:', response.status, errorText);
                return res.status(response.status).json({
                    message: "Failed to fetch GitHub repositories. Please check your token and try again."
                });
            }

            repos = await response.json();
            console.log("Fetched contributed repos count:", repos.length);
            
        } catch (err) {
            console.error('Token decryption error:', err);
            return res.status(400).json({ 
                message: "Invalid GitHub token. Please update your token in settings." 
            });
        }

        // Format the response with relevant details
        const formattedRepos = await Promise.all(
            repos.map(async (repo) => {
                let languages = {};
                let contributors = [];

                // Always fetch languages for all repositories
                try {
                    const langResponse = await fetch(
                        `https://api.github.com/repos/${repo.full_name}/languages`, 
                        { headers }
                    );
                    if (langResponse.ok) {
                        languages = await langResponse.json();
                    }
                } catch (err) {
                    console.error(`Error fetching languages for ${repo.full_name}:`, err);
                }

                // Fetch contributors (up to 10)
                try {
                    const contribResponse = await fetch(
                        `https://api.github.com/repos/${repo.full_name}/contributors?per_page=10`,
                        { headers }
                    );
                    if (contribResponse.ok) {
                        const contribData = await contribResponse.json();
                        contributors = contribData.map(contrib => ({
                            login: contrib.login,
                            avatarUrl: contrib.avatar_url,
                            contributions: contrib.contributions,
                            htmlUrl: contrib.html_url
                        }));
                    }
                } catch (err) {
                    console.error(`Error fetching contributors for ${repo.full_name}:`, err);
                }

                // Fetch commit count
                let commitCount = 0;
                try {
                    const commitsResponse = await fetch(
                        `https://api.github.com/repos/${repo.full_name}/commits?per_page=1`,
                        { headers }
                    );
                    if (commitsResponse.ok) {
                        const linkHeader = commitsResponse.headers.get('Link');
                        if (linkHeader) {
                            const match = linkHeader.match(/page=(\d+)>; rel="last"/);
                            commitCount = match ? parseInt(match[1]) : 1;
                        } else {
                            const commits = await commitsResponse.json();
                            commitCount = commits.length;
                        }
                    }
                } catch (err) {
                    console.error(`Failed to fetch commits for ${repo.full_name}:`, err);
                    commitCount = 0;
                }

                return {
                    id: repo.id,
                    name: repo.name,
                    fullName: repo.full_name,
                    description: repo.description,
                    private: repo.private,
                    htmlUrl: repo.html_url,
                    language: repo.language,
                    stargazersCount: repo.stargazers_count,
                    forksCount: repo.forks_count,
                    watchersCount: repo.watchers_count,
                    topics: repo.topics || [],
                    createdAt: repo.created_at,
                    updatedAt: repo.updated_at,
                    commitCount: commitCount,
                    homepage: repo.homepage,
                    size: repo.size,
                    defaultBranch: repo.default_branch,
                    openIssuesCount: repo.open_issues_count,
                    hasIssues: repo.has_issues,
                    hasWiki: repo.has_wiki,
                    hasPages: repo.has_pages,
                    license: repo.license?.name || null,
                    languages: languages,
                    contributors: contributors,
                    owner: {
                        login: repo.owner.login,
                        avatarUrl: repo.owner.avatar_url,
                    }
                };
            })
        );

        console.log("Formatted repos count:", formattedRepos.length);
        
        res.json({
            username: githubUsername,
            totalRepos: formattedRepos.length,
            repos: formattedRepos
        });

    } catch (err) {
        console.error("GitHub user contribution fetch error:", err);
        res.status(500).json({ message: "Failed to fetch user contributions", error: err.message });
    }
});

// Fetch all repositories for a user from GitHub using username (public access)
router.get("/userRepos_from_username", async (req, res) => {
    try {
        const username = req.headers['x-user-name'];
        
        if (!username) {
            return res.status(400).json({ message: 'Username is required in x-user-name header' });
        }
        
        // Find user by username
        const user = await User.findOne({ username: username.toLowerCase() })
            .select('+githubToken fetchPublicRepos fetchPrivateRepos githubProfileLink');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Extract GitHub username from githubProfileLink
        let githubUsername = null;

        if (user.githubProfileLink) {
            const match = user.githubProfileLink.match(/github\.com\/([^\/]+)/);
            if (match) {
                githubUsername = match[1];
            }
        }

        if (!githubUsername) {
            return res.status(400).json({
                message: "GitHub profile link not found."
            });
        }

        // Build headers
        const headers = {
            'Accept': 'application/vnd.github.v3+json',
            "User-Agent": "NodeServer",
        };

        // Use token if fetching private repos is enabled and token exists
        let apiUrl = `https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=100`;

        if (user.fetchPrivateRepos && user.githubToken) {
            try {
                const decryptedToken = decryptToken(user.githubToken);
                headers['Authorization'] = `Bearer ${decryptedToken}`;
                apiUrl = `https://api.github.com/user/repos?affiliation=owner&per_page=100&sort=updated&visibility=all`;
            } catch (err) {
                console.error('Token decryption error:', err);
                // Fall back to public repos only
                headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
                apiUrl = `https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=100`;
            }
        } else if (user.fetchPublicRepos) {
            apiUrl = `https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=100`;
            headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
        } else {
            // User hasn't enabled repo fetching
            return res.json({
                username: githubUsername,
                totalRepos: 0,
                repos: []
            });
        }

        // Fetch user's repositories from GitHub API
        const response = await fetch(apiUrl, { headers });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('GitHub API error:', response.status, errorText);
            return res.status(response.status).json({
                message: "Failed to fetch GitHub repositories."
            });
        }

        const repos = await response.json();

        // Format the response with relevant details
        const formattedRepos = await Promise.all(
            repos.map(async (repo) => {
                // Always fetch languages for all repositories
                try {
                    const langdata = await fetch(`https://api.github.com/repos/${repo.full_name}/languages`, { headers });
                    const langjson = await langdata.json();
                    repo.languages = langjson;
                } catch (err) {
                    console.error(`Failed to fetch languages for ${repo.full_name}:`, err);
                    repo.languages = {};
                }

                // Fetch commit count
                let commitCount = 0;
                try {
                    const commitsResponse = await fetch(
                        `https://api.github.com/repos/${repo.full_name}/commits?per_page=1`,
                        { headers }
                    );
                    if (commitsResponse.ok) {
                        const linkHeader = commitsResponse.headers.get('Link');
                        if (linkHeader) {
                            const match = linkHeader.match(/page=(\d+)>; rel="last"/);
                            commitCount = match ? parseInt(match[1]) : 1;
                        } else {
                            const commits = await commitsResponse.json();
                            commitCount = commits.length;
                        }
                    }
                } catch (err) {
                    console.error(`Failed to fetch commits for ${repo.full_name}:`, err);
                    commitCount = 0;
                }

                return {
                    id: repo.id,
                    name: repo.name,
                    fullName: repo.full_name,
                    description: repo.description,
                    private: repo.private,
                    htmlUrl: repo.html_url,
                    language: repo.language,
                    stargazersCount: repo.stargazers_count,
                    forksCount: repo.forks_count,
                    watchersCount: repo.watchers_count,
                    topics: repo.topics || [],
                    createdAt: repo.created_at,
                    updatedAt: repo.updated_at,
                    commitCount: commitCount,
                    homepage: repo.homepage,
                    size: repo.size,
                    defaultBranch: repo.default_branch,
                    openIssuesCount: repo.open_issues_count,
                    hasIssues: repo.has_issues,
                    hasWiki: repo.has_wiki,
                    hasPages: repo.has_pages,
                    license: repo.license?.name || null,
                    languages: repo.languages,
                    owner: {
                        login: repo.owner.login,
                        avatarUrl: repo.owner.avatar_url,
                    }
                };
            }));

        res.json({
            username: githubUsername,
            totalRepos: formattedRepos.length,
            repos: formattedRepos
        });

    } catch (err) {
        console.error("GitHub user repos fetch error:", err);
        res.status(500).json({ message: "Failed to fetch user repositories", error: err.message });
    }
});

// Fetch all contributions for a user from GitHub using username (public access)
router.get("/contributions_from_username", async (req, res) => {
    try {
        const username = req.headers['x-user-name'];
        
        if (!username) {
            return res.status(400).json({ message: 'Username is required in x-user-name header' });
        }
        
        // Find user by username
        const user = await User.findOne({ username: username.toLowerCase() })
            .select('+githubToken githubProfileLink');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Extract GitHub username from githubProfileLink
        let githubUsername = null;

        if (user.githubProfileLink) {
            const match = user.githubProfileLink.match(/github\.com\/([^\/]+)/);
            if (match) {
                githubUsername = match[1];
            }
        }

        if (!githubUsername) {
            return res.status(400).json({
                message: "GitHub profile link not found."
            });
        }

        // Check if user has GitHub token
        if (!user.githubToken) {
            return res.json({ 
                username: githubUsername,
                totalRepos: 0,
                repos: []
            });
        }

        // Build headers
        const headers = {
            'Accept': 'application/vnd.github.v3+json',
            "User-Agent": "NodeServer",
        };

        let repos = [];

        // Decrypt and use GitHub token
        try {
            const decryptedToken = decryptToken(user.githubToken);
            headers['Authorization'] = `Bearer ${decryptedToken}`;
            const apiUrl = `https://api.github.com/user/repos?affiliation=collaborator&per_page=100&sort=updated`;
            
            const response = await fetch(apiUrl, { headers });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('GitHub API error:', response.status, errorText);
                return res.json({
                    username: githubUsername,
                    totalRepos: 0,
                    repos: []
                });
            }

            repos = await response.json();
            
        } catch (err) {
            console.error('Token decryption error:', err);
            return res.json({ 
                username: githubUsername,
                totalRepos: 0,
                repos: []
            });
        }

        // Format the response with relevant details
        const formattedRepos = await Promise.all(
            repos.map(async (repo) => {
                let languages = {};
                let contributors = [];

                // Always fetch languages for all repositories
                try {
                    const langResponse = await fetch(
                        `https://api.github.com/repos/${repo.full_name}/languages`, 
                        { headers }
                    );
                    if (langResponse.ok) {
                        languages = await langResponse.json();
                    }
                } catch (err) {
                    console.error(`Error fetching languages for ${repo.full_name}:`, err);
                }

                // Fetch contributors (up to 10)
                try {
                    const contribResponse = await fetch(
                        `https://api.github.com/repos/${repo.full_name}/contributors?per_page=10`,
                        { headers }
                    );
                    if (contribResponse.ok) {
                        const contribData = await contribResponse.json();
                        contributors = contribData.map(contrib => ({
                            login: contrib.login,
                            avatarUrl: contrib.avatar_url,
                            contributions: contrib.contributions,
                            htmlUrl: contrib.html_url
                        }));
                    }
                } catch (err) {
                    console.error(`Error fetching contributors for ${repo.full_name}:`, err);
                }

                // Fetch commit count
                let commitCount = 0;
                try {
                    const commitsResponse = await fetch(
                        `https://api.github.com/repos/${repo.full_name}/commits?per_page=1`,
                        { headers }
                    );
                    if (commitsResponse.ok) {
                        const linkHeader = commitsResponse.headers.get('Link');
                        if (linkHeader) {
                            const match = linkHeader.match(/page=(\d+)>; rel="last"/);
                            commitCount = match ? parseInt(match[1]) : 1;
                        } else {
                            const commits = await commitsResponse.json();
                            commitCount = commits.length;
                        }
                    }
                } catch (err) {
                    console.error(`Failed to fetch commits for ${repo.full_name}:`, err);
                    commitCount = 0;
                }

                return {
                    id: repo.id,
                    name: repo.name,
                    fullName: repo.full_name,
                    description: repo.description,
                    private: repo.private,
                    htmlUrl: repo.html_url,
                    language: repo.language,
                    stargazersCount: repo.stargazers_count,
                    forksCount: repo.forks_count,
                    watchersCount: repo.watchers_count,
                    topics: repo.topics || [],
                    createdAt: repo.created_at,
                    updatedAt: repo.updated_at,
                    commitCount: commitCount,
                    homepage: repo.homepage,
                    size: repo.size,
                    defaultBranch: repo.default_branch,
                    openIssuesCount: repo.open_issues_count,
                    hasIssues: repo.has_issues,
                    hasWiki: repo.has_wiki,
                    hasPages: repo.has_pages,
                    license: repo.license?.name || null,
                    languages: languages,
                    contributors: contributors,
                    owner: {
                        login: repo.owner.login,
                        avatarUrl: repo.owner.avatar_url,
                    }
                };
            })
        );
        
        res.json({
            username: githubUsername,
            totalRepos: formattedRepos.length,
            repos: formattedRepos
        });

    } catch (err) {
        console.error("GitHub user contribution fetch error:", err);
        res.status(500).json({ message: "Failed to fetch user contributions", error: err.message });
    }
});

// Fetch total commits and last commit date for a user
router.get("/githubStats", async (req, res) => {
    try {
        const jwt = require('jsonwebtoken');
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "Unauthorised user" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('+githubToken githubProfileLink');

        if (!user || !user.githubProfileLink) {
            return res.status(400).json({ message: "GitHub profile link not configured" });
        }

        const githubUsername = user.githubProfileLink.split('/').pop();
        
        const headers = {
            'Accept': 'application/vnd.github.v3+json',
            "User-Agent": "NodeServer",
        };

        if (user.githubToken) {
            try {
                const decryptedToken = decryptToken(user.githubToken);
                headers['Authorization'] = `Bearer ${decryptedToken}`;
            } catch (err) {
                console.error('Token decryption error:', err);
            }
        } else {
            headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
        }

        // Fetch all user events to calculate total commits
        const eventsResponse = await fetch(
            `https://api.github.com/users/${githubUsername}/events/public?per_page=100`,
            { headers }
        );

        if (!eventsResponse.ok) {
            return res.status(400).json({ message: "Failed to fetch GitHub events" });
        }

        const events = await eventsResponse.json();
        
        // Filter push events and count commits
        let totalCommits = 0;
        let lastCommitDate = null;
        
        events.forEach(event => {
            if (event.type === 'PushEvent' && event.payload.commits) {
                totalCommits += event.payload.commits.length;
                if (!lastCommitDate || new Date(event.created_at) > new Date(lastCommitDate)) {
                    lastCommitDate = event.created_at;
                }
            }
        });

        // Also fetch from user's repos for more accurate count
        const reposResponse = await fetch(
            `https://api.github.com/users/${githubUsername}/repos?per_page=100`,
            { headers }
        );

        if (reposResponse.ok) {
            const repos = await reposResponse.json();
            
            // Get commit count from each repo (sample from main branches)
            for (const repo of repos.slice(0, 10)) { // Limit to first 10 repos to avoid rate limits
                try {
                    const commitsResponse = await fetch(
                        `https://api.github.com/repos/${repo.full_name}/commits?author=${githubUsername}&per_page=1`,
                        { headers }
                    );
                    
                    if (commitsResponse.ok) {
                        const linkHeader = commitsResponse.headers.get('Link');
                        if (linkHeader) {
                            const match = linkHeader.match(/page=(\d+)>; rel="last"/);
                            if (match) {
                                totalCommits += parseInt(match[1]);
                            }
                        }
                    }
                } catch (err) {
                    console.error(`Error fetching commits for ${repo.full_name}:`, err);
                }
            }
        }

        // Update user stats in database
        user.totalCommits = totalCommits;
        user.lastCommitDate = lastCommitDate;
        await user.save();

        res.json({
            totalCommits,
            lastCommitDate,
            username: githubUsername
        });

    } catch (err) {
        console.error("GitHub stats fetch error:", err);
        res.status(500).json({ message: "Failed to fetch GitHub stats", error: err.message });
    }
});

module.exports = router;