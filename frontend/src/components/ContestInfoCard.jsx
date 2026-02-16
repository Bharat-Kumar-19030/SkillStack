import React from 'react';
import { useTheme } from '../context/ThemeContext.jsx';

const ContestInfoCard = ({ contestStats }) => {
  const { theme } = useTheme();

  if (!contestStats) return null;

  const {
    attendedContestsCount,
    rating,
    globalRanking,
    totalParticipants,
    topPercentage
  } = contestStats;

  return (
    <div className="bg-white dark:bg-gray-600  rounded-2xl p-3  border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <h2 className=" font-bold text-gray-700 dark:text-white flex items-center">
          <svg className="w-8 h-8 mr-2 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Contest Performance
        </h2>
      </div>
      <div className='flex flex-col gap-3 justify-center items-center w-full '>

        <div className="flex flex-col md:flex-row itms-center justify-between gap-2 w-full">
          {/* Rating */}
          <div className="bg-white border w-full border-gray-100 p-2 dark:bg-gray-800/50 rounded-xl  hover:scale-105 transition-transform">
            <div className="flex items-center gap-2 justify-between">
              <span className="text-purple-600 dark:text-purple-300 text-sm font-medium">Rating</span>
              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </div>
            <div className=" font-bold text-gray-600 dark:text-white">
              {rating ? Math.round(rating) : 'N/A'}
            </div>
            <div className="text-purple-600 dark:text-purple-300 text-xs">
              {rating >= 2500 ? 'Grandmaster' :
                rating >= 2200 ? 'Master' :
                  rating >= 1900 ? 'Candidate Master' :
                    rating >= 1600 ? 'Expert' :
                      rating >= 1400 ? 'Specialist' :
                        rating >= 1200 ? 'Apprentice' :
                          'Novice'}
            </div>
          </div>

          {/* Global Ranking */}
          <div className="bg-white w-full border border-gray-100 p-2 dark:bg-gray-800/50 rounded-xl  hover:scale-105 transition-transform">
            <div className="flex items-center gap-2 justify-between">
              <span className="text-indigo-600 dark:text-indigo-300 text-sm font-medium">Global Ranking</span>
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
            </div>
            <div className=" font-bold text-gray-600 dark:text-white">
              {globalRanking ? globalRanking.toLocaleString() : 'N/A'}
            </div>
            <div className="text-indigo-600 dark:text-indigo-300 text-xs">
              Out of {totalParticipants ? totalParticipants.toLocaleString() : 'N/A'} users
            </div>
          </div>
        </div>
      
        <div className="flex flex-col md:flex-row items-center justify-between w-full gap-2">


          {/* Top Percentage */}
          <div className="bg-white border w-full border-gray-100 p-2 dark:bg-gray-800/50 rounded-xl  hover:scale-105 transition-transform">
            <div className="flex items-center justify-between ">
              <span className="text-pink-600 dark:text-pink-300 text-sm font-medium">In Top</span>
              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div className=" font-bold text-gray-600 dark:text-white">
              {topPercentage ? topPercentage.toFixed(2) : 'N/A'}%
            </div>
            <div className="text-pink-600 dark:text-pink-300 text-xs">
              Coders Worldwide
            </div>
          </div>

          {/* Contests Attended */}
          <div className="bg-white w-full dark:bg-gray-800/50 rounded-xl p-2 border border-gray-100  hover:scale-105 transition-transform md:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between ">
              <span className="text-blue-600 dark:text-blue-300 text-sm font-medium">Contests Attended</span>
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-xl font-bold text-gray-600 dark:text-white ">
              {attendedContestsCount || 0}
            </div>
            <div className="text-blue-600 dark:text-blue-300 text-xs">
              Total contests
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContestInfoCard;
