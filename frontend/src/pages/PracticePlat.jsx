import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchAllLeetCodeData } from '../utils/leetcodeAPI';
import LeetCodeStatsCard from '../components/LeetCodeStatsCard';
import ContestInfoCard from '../components/ContestInfoCard';
import LanguageStatsCard from '../components/LanguageStatsCard';
import TopicStatsCard from '../components/TopicStatsCard';
const PracticePlat = ({ user }) => {    
  const navigate=useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leetcodeData, setLeetcodeData] = useState(null);
  const [activeTab, setActiveTab] = useState('leetcode');

  useEffect(() => {
    if (!user) {
      // navigate(-1);
      console.log("no user found")
      return;
    }

    // Extract LeetCode username from profile link
    if (user.leetcodeProfileLink) {
      const leetcodeUsername = extractLeetCodeUsername(user.leetcodeProfileLink);
      if (leetcodeUsername) {
        fetchLeetCodeStats(leetcodeUsername);
      } else {
        setError('Invalid LeetCode profile link');
        setLoading(false);
      }
    } else {
      setError('No LeetCode profile link found');
      setLoading(false);
    }
  }, [user, navigate]);

  const extractLeetCodeUsername = (url) => {
    try {
      // Extract username from URLs like:
      // https://leetcode.com/u/username/
      // https://leetcode.com/username
      const match = url.match(/leetcode\.com\/(?:u\/)?([^\/]+)/);
      return match ? match[1] : null;
    } catch (err) {
      console.error('Error extracting username:', err);
      return null;
    }
  };

  const fetchLeetCodeStats = async (username) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllLeetCodeData(username);
      setLeetcodeData(data);
    } catch (err) {
      console.error('Error fetching LeetCode stats:', err);
      setError('Failed to fetch LeetCode statistics. Please check the username.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">No user data found</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    const Skeleton = ({ className }) => (
  <div
    className={`animate-pulse bg-gray-300 dark:bg-gray-700 rounded-lg ${className}`}
  />
);
    return (
      <div className="px-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
      
      {/* LEFT SIDE */}
      <div className="space-y-6">
        
        {/* Circular Stats Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow">
          <div className="flex gap-6">
            
            {/* Circle */}
            <Skeleton className="w-40 h-40 rounded-full" />
            
            {/* Difficulty Stats */}
            <div className="flex flex-col justify-center gap-4 flex-1">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
        </div>

        {/* Contest Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow space-y-4">
          <Skeleton className="h-6 w-48" />
          
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
        </div>

        {/* Language Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow space-y-4">
          <Skeleton className="h-6 w-40" />
          
          <div className="flex gap-4">
            <Skeleton className="h-14 flex-1 rounded-xl" />
            <Skeleton className="h-14 flex-1 rounded-xl" />
            <Skeleton className="h-14 flex-1 rounded-xl" />
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow space-y-5">
        
        {/* Tabs */}
        <div className="flex gap-3">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>

        {/* Topic List */}
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-10" />
            </div>
            <Skeleton className="h-3 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center bg-white dark:bg-gray-800 rounded-xl p-8 shadow-xl max-w-md">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Error Loading Data</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="max-w-full px-2 sm:px-4">          

        {/* LeetCode Stats */}
          <div className="flex flex-col items-start md:flex-row gap-2 sm:gap-4 w-full">
            <div className='flex flex-col justify-center w-full md:w-[48.00%] max-w-full gap-2'>
            {/* Stats Overview */}
            <LeetCodeStatsCard problemStats={leetcodeData.problemStats} />

            {/* Contest Information */}
            {leetcodeData.contestStats && (
              <ContestInfoCard contestStats={leetcodeData.contestStats} />
            )}
            {leetcodeData.languageStats && leetcodeData.languageStats.length > 0 && (
              <LanguageStatsCard languageStats={leetcodeData.languageStats} />
            )}
            </div>

            {/* Language Stats */}
            {/* {leetcodeData.languageStats && leetcodeData.languageStats.length > 0 && (
              <LanguageStatsCard languageStats={leetcodeData.languageStats} />
            )} */}
            <div className='w-full md:w-[52.00%] max-w-full overflow-y-auto'>
            {/* Topic Stats */}
            {leetcodeData.topicStats && (
              <TopicStatsCard topicStats={leetcodeData.topicStats} />
            )}
            </div>
          </div>
      </div>
    </div>
  );
};

export default PracticePlat;
