import React, { useEffect, useState } from 'react';

export default function GitHubTimeline({ githubUsername ,setLastcommit}) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventDetails, setEventDetails] = useState({});

  useEffect(() => {
    if (githubUsername) {
      fetchGitHubEvents();
    } else {
      setLoading(false);
      setEvents([]);
    }
  }, [githubUsername]);

  // Early return if no username provided
  if (!githubUsername) {
    return (
      <div className="text-center py-8 text-gray-500">
        No GitHub profile linked
      </div>
    );
  }

  const fetchGitHubEvents = async () => {
    try {
      setLoading(true);
      const SERVER_URL=import.meta.env.VITE_SERVER_URL
      const url=`${SERVER_URL}/api/user_events`
      const response = await fetch(url,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body:JSON.stringify({githubUsername})
      });
      
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
        setLastcommit(getTimeAgo(data[0]?.created_at) || null);
        
        // Fetch commit details for PushEvents
        fetchCommitDetailsForPushEvents(data);
      } else {
        console.error('Failed to fetch GitHub events');
        setEvents([]);
      }
    } catch (error) {
      console.error('Error fetching GitHub events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommitDetailsForPushEvents = async (events) => {
    const details = {};
    
    for (const event of events) {
      if (event.type === 'PushEvent' && event.payload.head) {
        try {
          // Fetch commits between before and head
          const repo = event.repo.name;
          const before = event.payload.before;
          const head = event.payload.head;
          
          // Try to get comparison data
          const SERVER_URL=import.meta.env.VITE_SERVER_URL
          const compareUrl = `${SERVER_URL}/api/user_activity`
          const response = await fetch(compareUrl,{
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({repo, before, head})
          });
          
          if (response.ok) {
            const data = await response.json();
            details[event.id] = {
              commits: data.commits || [],
              totalCommits: data.total_commits || data.commits?.length || 1
            };
          }
        } catch (err) {
          // Silently fail - will use size from payload
          console.log('Could not fetch commit details:', err);
        }
      }
    }
    
    setEventDetails(details);
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'PushEvent':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
        );
      case 'CreateEvent':
        return (
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
            <path d="M8 1a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 3.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
          </svg>
        );
      case 'DeleteEvent':
        return (
          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 16 16">
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
            <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
          </svg>
        );
      case 'IssuesEvent':
        return (
          <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 13A6 6 0 1 1 8 2a6 6 0 0 1 0 12z"/>
            <path d="M8 4a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0v-3A.5.5 0 0 1 8 4zm0 5a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0v-1A.5.5 0 0 1 8 9z"/>
          </svg>
        );
      case 'PullRequestEvent':
        return (
          <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M7.177 3.073L9.573.677A.25.25 0 0 1 10 .854v4.792a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354zM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5zm-2.25.75a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25zM11 2.5h-1V4h1a1 1 0 0 1 1 1v5.628a2.251 2.251 0 1 0 1.5 0V5A2.5 2.5 0 0 0 11 2.5zm1 10.25a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0zM3.75 12a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5z"/>
          </svg>
        );
      case 'ForkEvent':
        return (
          <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 16 16">
            <path d="M5 3.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0zm0 2.122a2.25 2.25 0 1 0-1.5 0v.878A2.25 2.25 0 0 0 5.75 8.5h1.5v2.128a2.251 2.251 0 1 0 1.5 0V8.5h1.5a2.25 2.25 0 0 0 2.25-2.25v-.878a2.25 2.25 0 1 0-1.5 0v.878a.75.75 0 0 1-.75.75h-4.5A.75.75 0 0 1 5 6.25v-.878zm3.75 7.378a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0zm3-8.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5z"/>
          </svg>
        );
      case 'WatchEvent':
        return (
          <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 13A6 6 0 1 1 8 2a6 6 0 0 1 0 12z"/>
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
          </svg>
        );
    }
  };

  const getEventDescription = (event) => {
    const repo = event.repo.name;
    // console.log("event",event)
    switch (event.type) {
      case 'PushEvent':
        // Use fetched commit details if available, otherwise use payload data
        const details = eventDetails[event.id];
        const commits = details?.commits || [];
        const commitCount = details?.totalCommits || event.payload.size || event.payload.distinct_size || 1;
        const ref = event.payload.ref ? event.payload.ref.replace('refs/heads/', '') : 'unknown';
        
        return (
          <div>
            <span className="font-medium">Pushed {commitCount} commit{commitCount !== 1 ? 's' : ''}</span> to{' '}
            <code className="text-xs bg-gray-100 dark:bg-gray-400 px-1 rounded">{ref}</code> in{' '}
            <a 
              href={`https://github.com/${repo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-300 hover:underline"
            >
              {repo}
            </a>
            {commits.length > 0 && (
              <div className="mt-2 text-sm text-gray-600 ml-4 border-l-2 border-gray-300 pl-3 space-y-1">
                {commits.slice(0, 3).map((commit, idx) => (
                  <div key={idx} className="truncate">
                    <a
                      href={commit.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline"
                    >
                      <code className="text-xs bg-gray-100 px-1 rounded">{commit.sha.substring(0, 7)}</code>
                    </a>
                    {' '}{commit.commit.message.split('\n')[0]}
                  </div>
                ))}
                {commits.length > 3 && (
                  <div className="text-xs text-gray-500">
                    + {commits.length - 3} more commit{commits.length - 3 !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            )}
            {commits.length === 0 && event.payload.head && (
              <div className="mt-2 text-sm text-gray-600">
                <a
                  href={`https://github.com/${repo}/commit/${event.payload.head}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  <code className="text-xs bg-gray-100 px-1 rounded">{event.payload.head.substring(0, 7)}</code>
                  {' '}View commits
                </a>
              </div>
            )}
          </div>
        );
      
      case 'CreateEvent':
        const refType = event.payload.ref_type;
        return (
          <div>
            <span className="font-medium">Created {refType}</span>{' '}
            {event.payload.ref && <code className="text-sm bg-gray-100 px-1 rounded">{event.payload.ref}</code>}{' '}
            in{' '}
            <a 
              href={`https://github.com/${repo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline"
            >
              {repo}
            </a>
          </div>
        );
      
      case 'DeleteEvent':
        return (
          <div>
            <span className="font-medium">Deleted {event.payload.ref_type}</span>{' '}
            <code className="text-sm bg-gray-100 px-1 rounded">{event.payload.ref}</code>{' '}
            from{' '}
            <a 
              href={`https://github.com/${repo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline"
            >
              {repo}
            </a>
          </div>
        );
      
      case 'IssuesEvent':
        return (
          <div>
            <span className="font-medium">{event.payload.action} issue</span>{' '}
            <a 
              href={event.payload.issue?.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline"
            >
              #{event.payload.issue?.number}
            </a>{' '}
            in{' '}
            <a 
              href={`https://github.com/${repo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline"
            >
              {repo}
            </a>
            {event.payload.issue?.title && (
              <div className="mt-1 text-sm text-gray-700">{event.payload.issue.title}</div>
            )}
          </div>
        );
      
      case 'PullRequestEvent':
        return (
          <div>
            <span className="font-medium">{event.payload.action} pull request</span>{' '}
            <a 
              href={event.payload.pull_request?.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-300 hover:underline"
            >
              #{event.payload.pull_request?.number}
            </a>{' '}
            in{' '}
            <a 
              href={`https://github.com/${repo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-300 hover:underline"
            >
              {repo}
            </a>
            {event.payload.pull_request?.title && (
              <div className="mt-1 text-sm text-gray-700">{event.payload.pull_request.title}</div>
            )}
          </div>
        );
      
      case 'ForkEvent':
        return (
          <div>
            <span className="font-medium">Forked</span>{' '}
            <a 
              href={`https://github.com/${repo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-300 hover:underline"
            >
              {repo}
            </a>{' '}
            to{' '}
            <a 
              href={event.payload.forkee?.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-300 hover:underline"
            >
              {event.payload.forkee?.full_name}
            </a>
          </div>
        );
      
      case 'WatchEvent':
        return (
          <div>
            <span className="font-medium">Starred</span>{' '}
            <a 
              href={`https://github.com/${repo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-300 hover:underline"
            >
              {repo}
            </a>
          </div>
        );
      
      default:
        return (
          <div>
            <span className="font-medium">{event.type.replace('Event', '')}</span> in{' '}
            <a 
              href={`https://github.com/${repo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-300 hover:underline"
            >
              {repo}
            </a>
          </div>
        );
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600) > 1 ? Math.floor(seconds / 3600) + ' hours ago' : '1 hour ago'}`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400) > 1 ? Math.floor(seconds / 86400) + ' days ago' : '1 day ago'}`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No recent activity found
      </div>
    );
  }

  return (
    <div className="space-y-4 dark:bg-gray-700">
      <h3 className="text-lg font-semibold text-gray-800  dark:text-white  ">Recent Activity</h3>
      
      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={event.id} className="flex gap-4">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div className="p-2 bg-gray-50 dark:bg-gray-400 rounded-full border-2 border-gray-200">
                {getEventIcon(event.type)}
              </div>
              {index < events.length - 1 && (
                <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-400 mt-0"></div>
              )}
            </div>

            {/* Event details */}
            <div className="flex-1 pb-1">
              <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:text-white p-2 hover:shadow-md transition-shadow">
                {getEventDescription(event)}
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-300">
                  {getTimeAgo(event.created_at)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
