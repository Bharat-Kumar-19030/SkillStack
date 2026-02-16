// LeetCode GraphQL API Service (via Backend)

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

/**
 * Fetch user profile data from LeetCode
 * @param {string} username - LeetCode username
 */
export async function fetchLeetCodeUserProfile(username) {
  try {
    const response = await fetch(`${SERVER_URL}/api/leetcode/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch LeetCode data');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching LeetCode profile:', error);
    throw error;
  }
}

/**
 * Fetch user contest data from LeetCode
 * @param {string} username - LeetCode username
 */
export async function fetchLeetCodeContestData(username) {
  try {
    const response = await fetch(`${SERVER_URL}/api/leetcode/contest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch LeetCode contest data');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching LeetCode contest data:', error);
    throw error;
  }
}

/**
 * Fetch language stats from LeetCode
 * @param {string} username - LeetCode username
 */
export async function fetchLeetCodeLanguageStats(username) {
  try {
    const response = await fetch(`${SERVER_URL}/api/leetcode/language-stats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch language stats');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching language stats:', error);
    throw error;
  }
}

/**
 * Fetch problem solving stats by topics
 * @param {string} username - LeetCode username
 */
export async function fetchLeetCodeTopicStats(username) {
  try {
    const response = await fetch(`${SERVER_URL}/api/leetcode/topic-stats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch topic stats');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching topic stats:', error);
    throw error;
  }
}

/**
 * Fetch all LeetCode data for a user
 * @param {string} username - LeetCode username
 */
export async function fetchAllLeetCodeData(username) {
  try {
    const response = await fetch(`${SERVER_URL}/api/leetcode/all-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch all LeetCode data');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching all LeetCode data:', error);
    throw error;
  }
}
