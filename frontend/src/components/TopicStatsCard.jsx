import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext.jsx';

const TopicStatsCard = ({ topicStats }) => {
  const [activeTab, setActiveTab] = useState('intermediate');
  const { theme } = useTheme();

  if (!topicStats) return null;

  const { advanced = [], intermediate = [], fundamental = [] } = topicStats;

  // Sort topics by problems solved
  const sortedAdvanced = [...advanced].sort((a, b) => b.problemsSolved - a.problemsSolved).slice(0, 10);
  const sortedIntermediate = [...intermediate].sort((a, b) => b.problemsSolved - a.problemsSolved).slice(0, 10);
  const sortedFundamental = [...fundamental].sort((a, b) => b.problemsSolved - a.problemsSolved).slice(0, 10);

  const getActiveTopics = () => {
    switch (activeTab) {
      case 'advanced':
        return sortedAdvanced;
      case 'intermediate':
        return sortedIntermediate;
      case 'fundamental':
        return sortedFundamental;
      default:
        return sortedAdvanced;
    }
  };

  const activeTopics = getActiveTopics();
  const maxProblems = activeTopics.length > 0 ? Math.max(...activeTopics.map(t => t.problemsSolved)) : 1;

  const getTopicColor = (index) => {
    const colors = [
      { bg: 'from-blue-600 to-blue-500', text: 'text-blue-400' },
      { bg: 'from-purple-600 to-purple-500', text: 'text-purple-400' },
      { bg: 'from-pink-600 to-pink-500', text: 'text-pink-400' },
      { bg: 'from-red-600 to-red-500', text: 'text-red-400' },
      { bg: 'from-orange-600 to-orange-500', text: 'text-orange-400' },
      { bg: 'from-yellow-600 to-yellow-500', text: 'text-yellow-400' },
      { bg: 'from-green-600 to-green-500', text: 'text-green-400' },
      { bg: 'from-teal-600 to-teal-500', text: 'text-teal-400' },
      { bg: 'from-cyan-600 to-cyan-500', text: 'text-cyan-400' },
      { bg: 'from-indigo-600 to-indigo-500', text: 'text-indigo-400' },
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="bg-white dark:bg-gray-700 rounded-2xl p-3 border border-gray-100 dark:border-gray-700 max-w-full overflow-hidden">


      {/* Tabs */}
      <div className="flex space-x-1 sm:space-x-2 mb-6 bg-gray-300/50 dark:bg-gray-800/50 rounded-xl p-1">
        <button
          onClick={() => setActiveTab('advanced')}
          className={`flex-1 py-2 px-1 sm:px-2 rounded-lg font-semibold transition-all text-xs sm:text-sm min-w-0 ${activeTab === 'advanced'
              ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
        >
          <div className="flex items-center justify-center space-x-1">
            <span className="truncate">Advanced</span>
            <span className="text-xs opacity-75 flex-shrink-0">({advanced.length})</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('intermediate')}
          className={`flex-1 py-2 px-1 sm:px-2 rounded-lg font-semibold transition-all text-xs sm:text-sm min-w-0 ${activeTab === 'intermediate'
              ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
        >
          <div className="flex items-center justify-center space-x-1">
            <span className="truncate">Intermediate</span>
            <span className="text-xs opacity-75 flex-shrink-0">({intermediate.length})</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('fundamental')}
          className={`flex-1 py-2 px-1 sm:px-2 rounded-lg font-semibold transition-all text-xs sm:text-sm min-w-0 ${activeTab === 'fundamental'
              ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
        >
          <div className="flex items-center justify-center space-x-1">
            <span className="truncate">Fundamental</span>
            <span className="text-xs opacity-75 flex-shrink-0">({fundamental.length})</span>
          </div>
        </button>
      </div>

      {/* Topics List */}
      {activeTopics.length > 0 ? (
        <div className="space-y-3">
          {activeTopics.map((topic, index) => {
            const colors = getTopicColor(index);
            const percentage = (topic.problemsSolved / maxProblems) * 100;

            return (
              <div
                key={topic.tagSlug}
                className="bg-white dark:bg-gray-800/50 rounded-xl px-2 py-1 border border-gray-300 dark:border-gray-700 hover:border-indigo-600 dark:hover:border-indigo-500 transition-all hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between gap-1 min-w-0">
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                    <div className={`w-5 h-5 p-1 rounded-md bg-gradient-to-br ${colors.bg} flex items-center justify-center font-bold text-white text-xs flex-shrink-0`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-gray-900 dark:text-white font-semibold text-sm truncate">{topic.tagName}</h3>
                      {/* <p className="text-gray-600 dark:text-gray-400 text-xs">/{topic.tagSlug}</p> */}
                      {/* Progress Bar */}
                      <div className="relative w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${colors.bg} rounded-full transition-all duration-700 ease-out`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className={`${colors.text} font-bold text-lg sm:text-xl flex-shrink-0`}>
                    {topic.problemsSolved}
                  </div>
                </div>


              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400">No topics data available</p>
        </div>
      )}

      {/* Summary Stats */}
      {/* {(advanced.length > 0 || intermediate.length > 0 || fundamental.length > 0) && (
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-red-200/50 to-red-300/50 dark:from-red-900/30 dark:to-red-800/30 rounded-xl p-4 border border-red-400 dark:border-red-700">
            <div className="text-red-600 dark:text-red-400 text-xs font-medium mb-1">Advanced (Top {sortedAdvanced.length})</div>
            <div className="text-gray-900 dark:text-white text-2xl font-bold">{sortedAdvanced.reduce((sum, t) => sum + t.problemsSolved, 0)}</div>
          </div>
          <div className="bg-gradient-to-br from-orange-200/50 to-orange-300/50 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl p-4 border border-orange-400 dark:border-orange-700">
            <div className="text-orange-600 dark:text-orange-400 text-xs font-medium mb-1">Intermediate (Top {sortedIntermediate.length})</div>
            <div className="text-gray-900 dark:text-white text-2xl font-bold">{sortedIntermediate.reduce((sum, t) => sum + t.problemsSolved, 0)}</div>
          </div>
          <div className="bg-gradient-to-br from-green-200/50 to-green-300/50 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-4 border border-green-400 dark:border-green-700">
            <div className="text-green-600 dark:text-green-400 text-xs font-medium mb-1">Fundamental (Top {sortedFundamental.length})</div>
            <div className="text-gray-900 dark:text-white text-2xl font-bold">{sortedFundamental.reduce((sum, t) => sum + t.problemsSolved, 0)}</div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default TopicStatsCard;
