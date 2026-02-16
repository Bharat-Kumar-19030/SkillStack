import React, { useEffect, useState } from 'react';

export default function GitHubHeatmap({ githubUsername }) {
  const [contributionData, setContributionData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (githubUsername) {
      fetchGitHubEvents();
    }
  }, [githubUsername]);

  const fetchGitHubEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://api.github.com/users/${githubUsername}/events/public?per_page=100`);
      
      if (response.ok) {
        const events = await response.json();
        processEventsForHeatmap(events);
      } else {
        console.error('Failed to fetch GitHub events');
        setContributionData([]);
      }
    } catch (error) {
      console.error('Error fetching GitHub events:', error);
      setContributionData([]);
    } finally {
      setLoading(false);
    }
  };

  const processEventsForHeatmap = (events) => {
    // Create a map to count events per day
    const eventsByDate = {};
    
    events.forEach(event => {
      const date = new Date(event.created_at).toISOString().split('T')[0];
      eventsByDate[date] = (eventsByDate[date] || 0) + 1;
    });

    // Generate last 365 days
    const heatmapData = [];
    const today = new Date();
    
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      heatmapData.push({
        date: dateStr,
        count: eventsByDate[dateStr] || 0,
        dayOfWeek: date.getDay(),
        weekNumber: Math.floor((364 - i) / 7)
      });
    }

    setContributionData(heatmapData);
  };

  const getColorIntensity = (count) => {
    if (count === 0) return 'bg-gray-100';
    if (count <= 2) return 'bg-green-700';
    if (count <= 5) return 'bg-green-800';
    if (count <= 10) return 'bg-green-900';
    return 'bg-green-900';
  };

  const getMonthLabels = () => {
    const months = [];
    const today = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push({
        name: date.toLocaleDateString('en-US', { month: 'short' }),
        offset: Math.floor((365 - (i * 30)) / 7) * 12
      });
    }
    
    return months;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Group data by week
  const weeks = [];
  for (let i = 0; i < 52; i++) {
    weeks.push(contributionData.filter(d => d.weekNumber === i));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Contribution Activity</h3>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-600 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-800 rounded-sm"></div>
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="flex gap-1 mb-2 text-xs text-gray-600 ml-6">
            {getMonthLabels().map((month, idx) => (
              <div 
                key={idx} 
                style={{ marginLeft: `${month.offset}px` }}
                className="absolute"
              >
                {month.name}
              </div>
            ))}
          </div>

          {/* Day labels and heatmap grid */}
          <div className="flex gap-1">
            {/* Day of week labels */}
            <div className="flex flex-col gap-1 text-xs text-gray-600 pr-2">
              <div className="h-3"></div>
              <div className="h-3">Mon</div>
              <div className="h-3"></div>
              <div className="h-3">Wed</div>
              <div className="h-3"></div>
              <div className="h-3">Fri</div>
              <div className="h-3"></div>
            </div>

            {/* Heatmap grid */}
            <div className="flex gap-1">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-1">
                  {[0, 1, 2, 3, 4, 5, 6].map(day => {
                    const dayData = week.find(d => d.dayOfWeek === day);
                    return (
                      <div
                        key={day}
                        className={`w-3 h-3 rounded-sm ${
                          dayData ? getColorIntensity(dayData.count) : 'bg-gray-100'
                        }`}
                        title={dayData ? `${dayData.date}: ${dayData.count} contributions` : ''}
                      ></div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-600">
        {contributionData.reduce((sum, d) => sum + d.count, 0)} contributions in the last year
      </div>
    </div>
  );
}
