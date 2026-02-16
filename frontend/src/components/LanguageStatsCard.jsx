import React from 'react';

const LanguageStatsCard = ({ languageStats }) => {
  if (!languageStats || languageStats.length === 0) return null;

  // Sort languages by problems solved (descending)
  const sortedLanguages = [...languageStats].sort((a, b) => b.problemsSolved - a.problemsSolved);
  const maxProblems = Math.max(...languageStats.map(lang => lang.problemsSolved));

  // Language color mapping
  const languageColors = {
    'C++': { bg: 'from-pink-600 to-pink-500', text: 'text-pink-400', border: 'border-pink-500' },
    'Java': { bg: 'from-red-600 to-orange-500', text: 'text-orange-400', border: 'border-orange-500' },
    'Python': { bg: 'from-blue-600 to-blue-500', text: 'text-blue-400', border: 'border-blue-500' },
    'Python3': { bg: 'from-blue-600 to-blue-500', text: 'text-blue-400', border: 'border-blue-500' },
    'JavaScript': { bg: 'from-yellow-600 to-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500' },
    'C': { bg: 'from-gray-600 to-gray-500', text: 'text-gray-400', border: 'border-gray-500' },
    'C#': { bg: 'from-purple-600 to-purple-500', text: 'text-purple-400', border: 'border-purple-500' },
    'Go': { bg: 'from-cyan-600 to-cyan-500', text: 'text-cyan-400', border: 'border-cyan-500' },
    'Ruby': { bg: 'from-red-700 to-red-600', text: 'text-red-400', border: 'border-red-500' },
    'Swift': { bg: 'from-orange-600 to-orange-500', text: 'text-orange-400', border: 'border-orange-500' },
    'Kotlin': { bg: 'from-indigo-600 to-indigo-500', text: 'text-indigo-400', border: 'border-indigo-500' },
    'TypeScript': { bg: 'from-blue-700 to-blue-600', text: 'text-blue-400', border: 'border-blue-500' },
    'Rust': { bg: 'from-orange-700 to-orange-600', text: 'text-orange-400', border: 'border-orange-500' },
    'default': { bg: 'from-teal-600 to-teal-500', text: 'text-teal-400', border: 'border-teal-500' }
  };

  const getLanguageColor = (langName) => {
    return languageColors[langName] || languageColors['default'];
  };

  return (
    <div className="dark:bg-gray-600 bg-white border-gray-100 rounded-2xl p-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className=" font-bold text-gray-600 dark:text-white flex items-center">
          <svg className="w-6 h-6 mr-3 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Language Statistics
        </h2>
        <div className="text-gray-400 text-sm">
          {sortedLanguages.length} {sortedLanguages.length === 1 ? 'Language' : 'Languages'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {sortedLanguages.map((lang, index) => {
          const colors = getLanguageColor(lang.languageName);
          const percentage = (lang.problemsSolved / maxProblems) * 100;

          return (
            <div
              key={lang.languageName}
              className={`dark:bg-gray-800/50  bg-white rounded-xl p-1 px-2 border ${colors.border} hover:scale-105 transition-all hover:shadow-lg`}
            >
              <div className="flex items-center justify-between ">
                <div className="flex items-center space-x-3">
                  
                  <div>
                    <h3 className="dark:text-white text-gray-600 font-semibold text-sm">{lang.languageName}</h3>
                    <p className="text-gray-400 dark:text-gray-300 text-xs">Problems Solved</p>
                  </div>
                </div>
                <div className={`${colors.text} font-bold`}>
                  {lang.problemsSolved}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      
    </div>
  );
};

export default LanguageStatsCard;
