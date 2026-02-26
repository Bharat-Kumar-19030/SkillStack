import React from 'react';
import { useTheme } from '../context/ThemeContext.jsx';

const LeetCodeStatsCard = ({ problemStats }) => {
  if (!problemStats) return null;
  const [isHovered, setIsHovered] = React.useState(false);
  const [acc_section, setAcc_section] = React.useState("");
  const { theme } = useTheme();
  
  const { easy, medium, hard, total } = problemStats;

  // Calculate percentages relative to total solved (so circle is 100% filled)
  const totalSolved = total.solved || 1; // Avoid division by zero
  
  // Each difficulty as a percentage of total solved problems
  const easyPercentage = ((easy.solved / totalSolved) * 100);
  const mediumPercentage = ((medium.solved / totalSolved) * 100);
  const hardPercentage = ((hard.solved / totalSolved) * 100);
  
  // For acceptance rate display
  const acceptancePercentage = parseFloat(total.acceptanceRate);
  
  const circumference = 2 * Math.PI * 70;
  
  // For clockwise animation starting from top
  // Easy: Uses offset to control fill amount
  const easyOffset = circumference - (easyPercentage / 100) * circumference;
  
  // For acceptance rate (single color)
  const [acceptanceOffset, setAcceptanceOffset] = React.useState(circumference - (acceptancePercentage / 100) * circumference);

  return (
    <div className="bg-white dark:bg-gray-700  rounded-2xl p-2 pr-3">
      

      <div className="flex flex-col md:flex-row justify-between gap-1 items-center">
        {/* Circular Progress */}
        <div 
          className="flex flex-col items-center justify-center cursor-pointer"
          
        >
          <div className="relative w-44 h-44 ">
            {/* Background circle - shows full track */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="88"
                cy="88"
                r="70"
                stroke={theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(156, 163, 175, 0.3)'}
                strokeWidth="20"
                fill="none"
              />
              
              {/* Show multi-colored segments when displaying solved count */}
              {!isHovered ? (
                <>
                  {/* Easy segment (Green) - starts from top, goes clockwise */}
                  <circle
                    cx="88"
                    cy="88"     
                    r="70"
                    stroke="currentColor"
                    strokeWidth="20"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={easyOffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out text-green-400 bg-gray-400"
                  />
                  
                  {/* Medium segment (Orange) - continues from easy */}
                  <circle
                    cx="88"
                    cy="88"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="20"
                    fill="none"
                    strokeDasharray={`${(mediumPercentage / 100) * circumference} ${circumference}`}
                    strokeDashoffset={-((easyPercentage / 100) * circumference)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out text-yellow-400"
                  />
                  
                  {/* Hard segment (Red) - continues from medium */}
                  <circle
                    cx="88"
                    cy="88"
                    r="70"
                    // className=''
                    stroke="currentColor"
                    strokeWidth="20"
                    fill="none"
                    strokeDasharray={`${(hardPercentage / 100) * circumference} ${circumference}`}
                    strokeDashoffset={-((easyPercentage + mediumPercentage) / 100) * circumference}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out text-red-400"
                  />
                </>
              ) : (
                /* Single gradient circle for acceptance rate on hover */
                <circle
                  cx="88"
                  cy="88"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="20"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={acceptanceOffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out text-green-400 bg-gray-400"
                />
              )}
              
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center text - shows solved count by default, acceptance rate on hover */}
            <div onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)} className="absolute inset-0 flex flex-col items-center justify-center transition-all duration-300">
              
              {!isHovered ? (
                <>
                  <span className="text-5xl font-bold text-gray-700 dark:text-white ">{total.solved}</span>
                  <span className="text-green-400 text-sm mt-2 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Solved
                  </span>
                </>
              ) : (
                <>
                  {acc_section && acc_section !== "" ? 
                  <span className="text-5xl font-bold text-gray-700 dark:text-white">
                    {acc_section.split('.')[0]}
                    <span className='text-sm text-gray-700 dark:text-white'>
                      {'.'+acc_section.split('.')[1]+'%'}
                    </span>
                  </span> :
                  <span className="text-5xl font-bold text-gray-700 dark:text-white">
                    {total.acceptanceRate.split('.')[0]}
                    <span className='text-sm text-gray-700 dark:text-white'>
                      {'.'+total.acceptanceRate.split('.')[1]+'%'}
                    </span>
                  </span>}

                  <span className="text-green-400 text-sm mt-2 flex items-center">
                    Acceptance
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Difficulty Breakdown */}
        <div className="flex flex-col justify-center space-y-2 w-full">
          {/* Easy */}
          <div onMouseEnter={() => { setIsHovered(true); setAcc_section(easy.acceptanceRate);setAcceptanceOffset(circumference - (parseFloat(easy.acceptanceRate) / 100) * circumference) }}
          onMouseLeave={() => {setIsHovered(false);setAcc_section("");setAcceptanceOffset(circumference - (parseFloat(total.acceptanceRate) / 100) * circumference)}} 
          className="w-full dark:bg-gray-800/50 rounded-xl p-2 border border-gray-300 dark:border-gray-700 hover:border-green-500 transition-all">
            <div className="flex items-center justify-between gap-3 w-full">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-gray-600 dark:text-white font-semibold ">Easy</span>
              </div>
              <div className="bg-green-500 flex items-center justify-center text-white px-2 py-1 rounded-lg font-bold text-sm">
                {easy.solved}
              </div>
            </div>
            
          </div>

          {/* Medium */}
          <div onMouseEnter={() => { setIsHovered(true); setAcc_section(medium.acceptanceRate);setAcceptanceOffset(circumference - (parseFloat(medium.acceptanceRate) / 100) * circumference) }}
          onMouseLeave={() => {setIsHovered(false);setAcc_section("");setAcceptanceOffset(circumference - (parseFloat(total.acceptanceRate) / 100) * circumference)}} 
          className="w-full dark:bg-gray-800/50 rounded-xl p-2 border border-gray-300 dark:border-gray-700 hover:border-orange-500 transition-all">
            <div className="flex items-center justify-between gap-3 ">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-gray-600 dark:text-white font-semibold ">Medium</span>
              </div>
              <div className="bg-orange-500 flex items-center justify-center text-white font-bold text-sm px-2 py-1 rounded-lg ">
                {medium.solved}
              </div>
            </div>
          </div>

          {/* Hard */}
          <div onMouseEnter={() => { setIsHovered(true); setAcc_section(hard.acceptanceRate);setAcceptanceOffset(circumference - (parseFloat(hard.acceptanceRate) / 100) * circumference) }}
          onMouseLeave={() => {setIsHovered(false);setAcc_section("");setAcceptanceOffset(circumference - (parseFloat(total.acceptanceRate) / 100) * circumference) }} 
          className="w-full dark:bg-gray-800/50 rounded-xl p-2 border border-gray-300 dark:border-gray-700 hover:border-red-500 transition-all">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-gray-600 dark:text-white font-semibold ">Hard</span>
              </div>
              <div className="bg-red-500 flex items-center justify-center text-white px-2 py-1 text-sm rounded-lg font-bold">
                {hard.solved}
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeetCodeStatsCard;
