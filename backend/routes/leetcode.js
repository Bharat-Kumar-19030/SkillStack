const express = require('express');
const router = express.Router();

const LEETCODE_GRAPHQL_ENDPOINT = 'https://leetcode.com/graphql';

/**
 * Fetch user profile data from LeetCode
 */
router.post('/profile', async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ message: 'Username is required' });
  }

  const query = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        username
        profile {
          realName
          userAvatar
          ranking
          reputation
        }
        submitStats: submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
          totalSubmissionNum {
            difficulty
            count
            submissions
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(LEETCODE_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      },
      body: JSON.stringify({
        query,
        variables: { username }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch LeetCode data');
    }

    const data = await response.json();
    res.json(data.data.matchedUser);
  } catch (error) {
    console.error('Error fetching LeetCode profile:', error);
    res.status(500).json({ message: 'Error fetching LeetCode profile', error: error.message });
  }
});

/**
 * Fetch user contest data from LeetCode
 */
router.post('/contest', async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ message: 'Username is required' });
  }

  const query = `
    query getUserContestData($username: String!) {
      userContestRanking(username: $username) {
        attendedContestsCount
        rating
        globalRanking
        totalParticipants
        topPercentage
      }
      userContestRankingHistory(username: $username) {
        attended
        rating
        ranking
        trendDirection
        problemsSolved
        totalProblems
        finishTimeInSeconds
        contest {
          title
          startTime
        }
      }
    }
  `;

  try {
    const response = await fetch(LEETCODE_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      },
      body: JSON.stringify({
        query,
        variables: { username }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch LeetCode contest data');
    }

    const data = await response.json();
    res.json({
      contestRanking: data.data.userContestRanking,
      contestHistory: data.data.userContestRankingHistory
    });
  } catch (error) {
    console.error('Error fetching LeetCode contest data:', error);
    res.status(500).json({ message: 'Error fetching LeetCode contest data', error: error.message });
  }
});

/**
 * Fetch language stats from LeetCode
 */
router.post('/language-stats', async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ message: 'Username is required' });
  }

  const query = `
    query getLanguageStats($username: String!) {
      matchedUser(username: $username) {
        languageProblemCount {
          languageName
          problemsSolved
        }
      }
    }
  `;

  try {
    const response = await fetch(LEETCODE_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      },
      body: JSON.stringify({
        query,
        variables: { username }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch language stats');
    }

    const data = await response.json();
    res.json(data.data.matchedUser.languageProblemCount);
  } catch (error) {
    console.error('Error fetching language stats:', error);
    res.status(500).json({ message: 'Error fetching language stats', error: error.message });
  }
});

/**
 * Fetch problem solving stats by topics
 */
router.post('/topic-stats', async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ message: 'Username is required' });
  }

  const query = `
    query getTopicStats($username: String!) {
      matchedUser(username: $username) {
        tagProblemCounts {
          advanced {
            tagName
            tagSlug
            problemsSolved
          }
          intermediate {
            tagName
            tagSlug
            problemsSolved
          }
          fundamental {
            tagName
            tagSlug
            problemsSolved
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(LEETCODE_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      },
      body: JSON.stringify({
        query,
        variables: { username }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch topic stats');
    }

    const data = await response.json();
    res.json(data.data.matchedUser.tagProblemCounts);
  } catch (error) {
    console.error('Error fetching topic stats:', error);
    res.status(500).json({ message: 'Error fetching topic stats', error: error.message });
  }
});

/**
 * Debug endpoint to see raw LeetCode data
 */
router.post('/debug-stats', async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ message: 'Username is required' });
  }

  try {
    const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
              submissions
            }
            totalSubmissionNum {
              difficulty
              count
              submissions
            }
          }
        }
      }
    `;

    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      },
      body: JSON.stringify({ query, variables: { username } })
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching debug stats:', error);
    res.status(500).json({ message: 'Error fetching debug stats', error: error.message });
  }
});

/**
 * Fetch all LeetCode data for a user (combined endpoint)
 */
router.post('/all-data', async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ message: 'Username is required' });
  }

  // Helper function to fetch from LeetCode
  const fetchFromLeetCode = async (query, variables) => {
    const response = await fetch(LEETCODE_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      },
      body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch from LeetCode');
    }

    return response.json();
  };

  try {
    // Profile query with comprehensive submission stats
    const profileQuery = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          username
          profile {
            realName
            userAvatar
            ranking
            reputation
          }
          submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
              submissions
            }
            totalSubmissionNum {
              difficulty
              count
              submissions
            }
          }
        }
      }
    `;

    // Contest query
    const contestQuery = `
      query getUserContestData($username: String!) {
        userContestRanking(username: $username) {
          attendedContestsCount
          rating
          globalRanking
          totalParticipants
          topPercentage
        }
        userContestRankingHistory(username: $username) {
          attended
          rating
          ranking
          trendDirection
          problemsSolved
          totalProblems
          finishTimeInSeconds
          contest {
            title
            startTime
          }
        }
      }
    `;

    // Language stats query
    const languageQuery = `
      query getLanguageStats($username: String!) {
        matchedUser(username: $username) {
          languageProblemCount {
            languageName
            problemsSolved
          }
        }
      }
    `;

    // Topic stats query
    const topicQuery = `
      query getTopicStats($username: String!) {
        matchedUser(username: $username) {
          tagProblemCounts {
            advanced {
              tagName
              tagSlug
              problemsSolved
            }
            intermediate {
              tagName
              tagSlug
              problemsSolved
            }
            fundamental {
              tagName
              tagSlug
              problemsSolved
            }
          }
        }
      }
    `;

    // Fetch all data in parallel
    const [profileData, contestData, languageData, topicData] = await Promise.all([
      fetchFromLeetCode(profileQuery, { username }),
      fetchFromLeetCode(contestQuery, { username }),
      fetchFromLeetCode(languageQuery, { username }),
      fetchFromLeetCode(topicQuery, { username })
    ]);

    const profile = profileData.data.matchedUser;
    
    // Check if user exists
    if (!profile) {
      return res.status(404).json({ 
        message: 'User not found on LeetCode',
        error: 'The username provided does not exist on LeetCode'
      });
    }

    // Check if submitStatsGlobal exists
    if (!profile.submitStatsGlobal) {
      return res.status(404).json({ 
        message: 'No submission stats found',
        error: 'The user has no submission statistics available'
      });
    }

    const acStats = profile.submitStatsGlobal.acSubmissionNum;
    const totalStats = profile.submitStatsGlobal.totalSubmissionNum;
    
    const easyAc = acStats.find(s => s.difficulty === 'Easy');
    const mediumAc = acStats.find(s => s.difficulty === 'Medium');
    const hardAc = acStats.find(s => s.difficulty === 'Hard');
    const allAc = acStats.find(s => s.difficulty === 'All');
    
    const easyTotal = totalStats.find(s => s.difficulty === 'Easy');
    const mediumTotal = totalStats.find(s => s.difficulty === 'Medium');
    const hardTotal = totalStats.find(s => s.difficulty === 'Hard');
    const allTotal = totalStats.find(s => s.difficulty === 'All');

    // Calculate acceptance rate: (accepted submissions / total submissions including failed) * 100
    const calculateAcceptanceRate = (acceptedSubmissions, totalSubmissions) => {
      return totalSubmissions > 0 ? ((acceptedSubmissions / totalSubmissions) * 100).toFixed(2) : 0;
    };

    const result = {
      profile: {
        username: profile.username,
        realName: profile.profile.realName,
        avatar: profile.profile.userAvatar,
        ranking: profile.profile.ranking,
        reputation: profile.profile.reputation
      },
      problemStats: {
        easy: {
          solved: easyAc?.count || 0,
          totalSubmissions: easyTotal?.submissions || 0,
          acceptedSubmissions: easyAc?.submissions || 0,
          acceptanceRate: calculateAcceptanceRate(easyAc?.submissions || 0, easyTotal?.submissions || 0)
        },
        medium: {
          solved: mediumAc?.count || 0,
          totalSubmissions: mediumTotal?.submissions || 0,
          acceptedSubmissions: mediumAc?.submissions || 0,
          acceptanceRate: calculateAcceptanceRate(mediumAc?.submissions || 0, mediumTotal?.submissions || 0)
        },
        hard: {
          solved: hardAc?.count || 0,
          totalSubmissions: hardTotal?.submissions || 0,
          acceptedSubmissions: hardAc?.submissions || 0,
          acceptanceRate: calculateAcceptanceRate(hardAc?.submissions || 0, hardTotal?.submissions || 0)
        },
        total: {
          solved: allAc?.count || 0,
          totalSubmissions: allTotal?.submissions || 0,
          acceptedSubmissions: allAc?.submissions || 0,
          acceptanceRate: calculateAcceptanceRate(allAc?.submissions || 0, allTotal?.submissions || 0)
        }
      },
      contestStats: contestData.data?.userContestRanking || null,
      contestHistory: contestData.data?.userContestRankingHistory || [],
      languageStats: languageData.data?.matchedUser?.languageProblemCount || [],
      topicStats: topicData.data?.matchedUser?.tagProblemCounts || {}
    };

    res.json(result);
  } catch (error) {
    console.error('Error fetching all LeetCode data:', error);
    res.status(500).json({ message: 'Error fetching all LeetCode data', error: error.message });
  }
});

module.exports = router;
