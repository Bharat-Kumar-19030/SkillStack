import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Info, Key, Github, Check, X, ExternalLink, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, checkAuth } = useAuth();
  
  const [settings, setSettings] = useState({
    fetchPublicRepos: false,
    fetchPrivateRepos: false,
    fetchLanguages: false,
    githubToken: '',
  });
  
  const [showToken, setShowToken] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tokenChanged, setTokenChanged] = useState(false);
  const [isSavingToken, setIsSavingToken] = useState(false);
  
  // Ref for GitHub token input
  const tokenInputRef = useRef(null);

  // Load user settings on mount
  useEffect(() => {
    if (user) {
      fetchSettings();
      
    }
  }, [user]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
      const response = await fetch(`${SERVER_URL}/api/users/settings`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setSettings({
          fetchPublicRepos: data.fetchPublicRepos || false,
          fetchPrivateRepos: data.fetchPrivateRepos || false,
          fetchLanguages: data.fetchLanguages || false,
          githubToken: data.githubToken ? '••••••••••••' : '',
        });
        setTokenChanged(false);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error); 
    } finally {
      setLoading(false); 
    }
  };

  const saveSettingToBackend = async (updatedSetting) => {
    try {
      const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
      
      const res = await fetch(`${SERVER_URL}/api/users/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updatedSetting),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success('Setting saved successfully!');
        if (checkAuth) {
          await checkAuth();
        }
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to save setting');
      }
    } catch (error) {
      console.error('Save setting error:', error);
      toast.error('Failed to save setting');
    }
  };

  const handleSaveToken = async () => {
    if (!settings.githubToken || settings.githubToken.includes('•')) {
      toast.error('Please enter a valid GitHub token');
      return;
    }

    setIsSavingToken(true);
    try {
      const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
      
      const res = await fetch(`${SERVER_URL}/api/users/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ githubToken: settings.githubToken }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success('GitHub token saved successfully!');
        setSettings({
          ...settings,
          githubToken: data.githubToken ? '••••••••••••' : '',
        });
        setTokenChanged(false);
        if (checkAuth) {
          await checkAuth();
        }
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to save token');
      }
    } catch (error) {
      console.error('Save token error:', error);
      toast.error('Failed to save token');
    } finally {
      setIsSavingToken(false);
    }
  };

  const handleTogglePublicRepos = async (enabled) => {
    setSettings({ ...settings, fetchPublicRepos: enabled });
    await saveSettingToBackend({ fetchPublicRepos: enabled });
  };

  const handleTogglePrivateRepos = async (enabled) => {
    if (enabled && !settings.githubToken) {
      toast.error('Please provide a GitHub Personal Access Token first');
      setShowInstructions(true);
      // Focus on the token input field
      setTimeout(() => {
        tokenInputRef.current?.focus();
      }, 100);
      return;
    }
    setSettings({ ...settings, fetchPrivateRepos: enabled });
    await saveSettingToBackend({ fetchPrivateRepos: enabled });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2 dark:text-white">Settings</h1>
      <p className="text-gray-600 mb-8 dark:text-gray-300">Manage your GitHub integration and project sync preferences</p>

      <div className="space-y-6 ">
        {/* GitHub Integration Card */}
        <div className="bg-white dark:bg-gray-800 dark:text-gray-200 rounded-xl shadow-md p-6 ">
          <div className="flex items-center gap-3 mb-6">
            <Github className="w-6 h-6 text-gray-700 dark:text-gray-200" />
            <h2 className="text-xl font-semibold dark:text-white">GitHub Integration</h2>
          </div>

          {/* Public Repos Toggle */}
          <div className="border-b pb-6 mb-6">
            <div className="flex items-start justify-between ">
              <div className="flex-1">
                <h3 className="text-lg font-medium mb-2 dark:text-white">Fetch Public Repositories</h3>
                <p className="text-gray-600 text-sm dark:text-gray-200">
                  Automatically sync and display all your public GitHub repositories in the "My Projects" section.
                  No authentication required.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={settings.fetchPublicRepos}
                  onChange={(e) => handleTogglePublicRepos(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>

          {/* Private Repos Toggle */}
          <div className=" pb-6 ">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium mb-2 flex items-center gap-2 dark:text-white">
                  Deep Fetch 
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    Requires Token
                  </span>
                </h3>
                <p className="text-gray-600 text-sm mb-3 dark:text-gray-200">
                  Access and display your private GitHub repositories and collaborations. Requires a Personal Access Token with
                  <code className="mx-1 px-2 py-0.5 bg-gray-100 rounded text-xs dark:bg-gray-700 dark:text-gray-200">repo</code> scope.
                </p>
                
                {!settings.fetchPrivateRepos && (
                  <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 dark:bg-gray-800 dark:border-gray-700 rounded-lg p-3 text-sm text-blue-800 dark:text-yellow-100">
                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>
                      Enable this to sync private repositories and access the collaborations you made. You'll need to provide a GitHub Personal Access Token.
                    </p>
                    
                  </div>
                )}
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={settings.fetchPrivateRepos}
                  onChange={(e) => handleTogglePrivateRepos(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>

          

          {/* GitHub Token Input */}
          <div className='border-b pb-6 mb-6'>
            <div className="flex items-center justify-between mb-3">
              <label className="text-lg font-medium flex items-center gap-2">
                <Key className="w-5 h-5" />
                GitHub Personal Access Token
              </label>
              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="text-indigo-600 hover:text-indigo-700 dark:text-gray-100 dark:hover:text-gray-400 cursor-pointer text-sm flex items-center gap-1"
              >
                {showInstructions ? 'Hide' : 'Show'} Instructions
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>

            {/* Token Input Field */}
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <input
                  ref={tokenInputRef}
                  type={showToken ? "text" : "password"}
                  value={settings.githubToken}
                  onChange={(e) => {
                    setSettings({ ...settings, githubToken: e.target.value });
                    setTokenChanged(true);
                  }}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <button
                type="button"
                onClick={handleSaveToken}
                disabled={!tokenChanged || isSavingToken}
                className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed flex items-center gap-2"
                title="Save Token"
              >
                {isSavingToken ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Check className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Instructions Dropdown */}
            {showInstructions && (
              <div className="mt-4 bg-gray-50 border dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 dark:text-gray-200">
                  <Github className="w-5 h-5" />
                  How to Generate a GitHub Personal Access Token (Classic)
                </h4>
                
                <ol className="space-y-4 text-sm text-gray-700 dark:text-gray-200">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 dark:bg-gray-800 dark:text-gray-300 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-semibold text-xs">
                      1
                    </span>
                    <div>
                      <p className="font-medium mb-1">Go to GitHub Settings</p>
                      <p className="text-gray-600 dark:text-gray-200">
                        Visit{' '}
                        <a
                          href="https://github.com/settings/tokens"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline inline-flex items-center gap-1"
                        >
                          github.com/settings/tokens
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </p>
                    </div>
                  </li>

                  <li className="flex gap-3">
                    <span className="flex-shrink-0 dark:bg-gray-800 dark:text-gray-300 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-semibold text-xs">
                      2
                    </span>
                    <div>
                      <p className="font-medium mb-1">Generate New Token</p>
                      <p className="text-gray-600 dark:text-gray-200">
                        Click <strong>"Generate new token"</strong> → Choose <strong>"Tokens (classic)"</strong>
                      </p>
                    </div>
                  </li>

                  <li className="flex gap-3">
                    <span className="flex-shrink-0 dark:bg-gray-800 dark:text-gray-300 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-semibold text-xs">
                      3
                    </span>
                    <div>
                      <p className="font-medium mb-1">Configure Token</p>
                      <p className="text-gray-600 mb-2 dark:text-gray-200">Give it a descriptive note (e.g., "VibeSpace Integration")</p>
                      <p className="text-gray-600 dark:text-gray-200">Set expiration (recommended: 90 days)</p>
                    </div>
                  </li>

                  <li className="flex gap-3">
                    <span className="flex-shrink-0 dark:bg-gray-800 dark:text-gray-300 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-semibold text-xs">
                      4
                    </span>
                    <div>
                      <p className="font-medium mb-2">Select Required Scopes</p>
                      <div className="bg-white border dark:bg-gray-700 dark:border-gray-600 rounded p-3 space-y-2">
                        <label className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-600" />
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded dark:bg-gray-600">repo</code>
                          <span className="text-xs text-gray-600 dark:text-gray-200">(Full control of private repositories)</span>
                        </label>
                        <p className="text-xs text-gray-500 ml-6 dark:text-gray-200">
                          This scope is required to access your private repositories
                        </p>
                      </div>
                    </div>
                  </li>

                  <li className="flex gap-3">
                    <span className="flex-shrink-0 dark:bg-gray-800 dark:text-gray-300 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-semibold text-xs">
                      5
                    </span>
                    <div>
                      <p className="font-medium mb-1">Generate and Copy Token</p>
                      <p className="text-gray-600 dark:text-gray-200">
                        Click <strong>"Generate token"</strong> and copy it immediately (you won't be able to see it again!)
                      </p>
                    </div>
                  </li>

                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 dark:bg-gray-800 dark:text-gray-300 text-indigo-600 rounded-full flex items-center justify-center font-semibold text-xs">
                      6
                    </span>
                    <div>
                      <p className="font-medium mb-1">Paste Token Here</p>
                      <p className="text-gray-600 dark:text-gray-200">
                        Paste the token (starting with <code className="bg-gray-100 px-1 rounded dark:bg-gray-600">ghp_</code>) in the field above and save settings
                      </p>
                    </div>
                  </li>
                </ol>

                <div className="mt-6 bg-yellow-50 border border-yellow-200 dark:bg-gray-700 dark:border-yellow-400 rounded-lg p-4">
                  <div className="flex gap-3">
                    <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-800 dark:text-yellow-400">
                      <p className="font-semibold mb-1">Security Note</p>
                      <p>
                        Your token is encrypted and stored securely. We never share it with third parties. 
                        You can revoke this token anytime from your GitHub settings.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
        </div>

      </div>
    </div>
  );
}