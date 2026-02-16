import React, { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from '../context/AuthContext.jsx';
import { ToastContainer, toast } from 'react-toastify';
import Enter from "./enter.jsx";
import upvoteicon from "../assets/upvote.svg";
import forkicon from "../assets/fork.svg";
import eyeicon from "../assets/eye.svg";
import liveicon from "../assets/live.svg";
import { motion } from "framer-motion";
import gif from "../assets/project_anime-1-loop.gif";
export default function AddProject({ show = true, act = 1 }) {
  const { user } = useAuth();
  console.log(user)

  // All state declarations first
  const [fetching, setFetching] = useState(false)
  const [gifi, setGifi] = useState(gif)
  const [active, setActive] = useState(act);
  const [showenter, setShowenter] = useState(false)
  const [small, setSmall] = useState(false); // Sidebar collapsed state
  const [abs, setAbs] = useState(false); // Sidebar absolute positioning for mobile
  const [formData, setFormData] = useState({
    projectName: "",
    githubLink: "",
    description: "",
    tags: "",
    demoVideo: null,
    liveDemo: "",
    thumbnail: null,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showvideourl, setShowvideourl] = useState("");
  const [projects, setProjects] = useState([]);
  const [githubRepos, setGithubRepos] = useState([]);

  // All useEffect hooks after state declarations
  useEffect(() => {
    // if(active===2){
      setGifi(`${gif}?${Date.now()}`);
    // }
  }, [])
  
  useEffect(() => {
    setActive(act)
  }, [act]);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setSmall(true);
    } else {
      setSmall(false);
      setAbs(false);
    }
  }, []);

  

  useEffect(() => {
    if (editingProject) {
      // Prefill form with project data when editing
      setFormData({
        projectName: editingProject.displayName || "",
        githubLink: editingProject.githubUrl || editingProject.htmlUrl || "",
        description: editingProject.displayDescription || "",
        tags: editingProject.topics?.join(", ") || "",
        demoVideo: null,
        liveDemo: editingProject.homepage || "",
        thumbnail: null,
      });
      setActive(1); // Switch to add project tab
    }
  }, [editingProject]);

  
  const handleFetch = async () => {
    setFetching(true);
    if (!user) {
      alert("Please login to fetch repository details.");
      setFetching(false);
      return;
    }
    const githubUrl = formData.githubLink;
    if (githubUrl.trim() === "") {
      alert("Please enter a GitHub repository URL.");
      setFetching(false);
      return;
    }
    try {

      const SERVER_URL = import.meta.env.VITE_SERVER_URL
      const response = await fetch(`${SERVER_URL}/api/github/fetchRepoDetails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ githubUrl }),
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        console.log("repo data: ", data);

        // Extract languages and format as comma-separated string
        let techStack = "";
        if (data.languages && Object.keys(data.languages).length > 0) {
          techStack = Object.keys(data.languages).join(", ");
        }

        setFormData({
          ...formData,
          projectName: data.name,
          description: data.description,
          tags: techStack,
          githubCreatedAt: data.created_at,
          githubUpdatedAt: data.updated_at,
        });
        console.log("form setted");
      }
      else {
        alert(data.message || "Failed to fetch repository details1.");
      }
    } catch (err) {
      alert("Failed to fetch repository details2.");
      console.error(err);
    }
    setFetching(false);
  }

  // Handle input text + file changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  // ----------------------------
  //     SUBMIT FORM TO BACKEND
  // ----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast('Please Login to continue!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        style: {
          '--toastify-color-progress-light': 'red', // green progress bar
        },
      });
      setShowenter(true);
      return;
    }
    console.log("Submitting:", formData);
    setLoading(true);
    setMessage("");
    setUploadProgress(0);

    try {
      const data = new FormData();
      data.append("projectName", formData.projectName);
      data.append("shortDescription", formData.description);
      data.append("githubUrl", formData.githubLink);
      data.append("liveDemoUrl", formData.liveDemo);
      data.append("tags", formData.tags);
      
      // Include GitHub dates if available (from Fetch button)
      if (formData.githubCreatedAt) data.append("githubCreatedAt", formData.githubCreatedAt);
      if (formData.githubUpdatedAt) data.append("githubUpdatedAt", formData.githubUpdatedAt);

      if (formData.thumbnail) data.append("thumbnail", formData.thumbnail);
      if (formData.demoVideo) data.append("demoVideo", formData.demoVideo);

      const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

      // Function to make request with progress tracking
      const uploadWithProgress = (url, method) => {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          // Track upload progress
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const percentComplete = Math.round((e.loaded / e.total) * 100);
              console.log('Upload progress:', percentComplete + '%', `(${e.loaded}/${e.total} bytes)`);
              setUploadProgress(percentComplete);
            }
          });

          // Start with 1% to show the overlay immediately
          xhr.upload.addEventListener('loadstart', () => {
            console.log('Upload started');
            setUploadProgress(1);
          });

          xhr.addEventListener('load', () => {
            console.log('Upload complete, processing response...');
            setUploadProgress(100);
            
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const result = JSON.parse(xhr.responseText);
                resolve({ ok: true, data: result });
              } catch (err) {
                reject(new Error('Failed to parse response'));
              }
            } else {
              try {
                const result = JSON.parse(xhr.responseText);
                resolve({ ok: false, data: result });
              } catch (err) {
                reject(new Error(`HTTP Error: ${xhr.status}`));
              }
            }
          });

          xhr.addEventListener('error', () => {
            console.log('Upload error');
            reject(new Error('Network error'));
          });

          xhr.open(method, url);
          xhr.setRequestHeader('x-user-id', user._id);
          xhr.send(data);
        });
      };

      // Check if we're editing an existing database project
      if (editingProject && editingProject.source === 'database' && editingProject._id) {
        // Update existing project
        const response = await uploadWithProgress(
          `${SERVER_URL}/api/projects/${editingProject._id}`,
          'PUT'
        );

        if (response.ok) {
          setMessage("Project updated successfully! 🎉");
          toast.success("Project updated successfully!");
          console.log("Updated Project:", response.data);
          setEditingProject(null);
          setFormData({
            projectName: "",
            githubLink: "",
            description: "",
            tags: "",
            demoVideo: null,
            liveDemo: "",
            thumbnail: null,
          });
          // Refresh projects list
          fetchProjects();
        } else {
          setMessage(response.data.message || "Failed to update project");
          toast.error(response.data.message || "Failed to update project");
        }
      } else {
        // Check if a project with this GitHub URL already exists
        const existingProject = projects.find(
          p => p.githubUrl?.toLowerCase() === formData.githubLink?.toLowerCase()
        );

        if (existingProject) {
          // Update existing project instead of creating new
          const response = await uploadWithProgress(
            `${SERVER_URL}/api/projects/${existingProject._id}`,
            'PUT'
          );

          if (response.ok) {
            setMessage("Project updated successfully! 🎉");
            toast.success("Project updated successfully!");
            console.log("Updated Project:", response.data);
            setEditingProject(null);
            setFormData({
              projectName: "",
              githubLink: "",
              description: "",
              tags: "",
              demoVideo: null,
              liveDemo: "",
              thumbnail: null,
            });
            // Refresh projects list
            fetchProjects();
          } else {
            setMessage(response.data.message || "Failed to update project");
            toast.error(response.data.message || "Failed to update project");
          }
        } else {
          // Create new project
          const response = await uploadWithProgress(
            `${SERVER_URL}/api/projects`,
            'POST'
          );

          if (response.ok) {
            setMessage("Project uploaded successfully! 🎉");
            toast.success("Project created successfully!");
            console.log("Saved Project:", response.data);
            setEditingProject(null);
            setFormData({
              projectName: "",
              githubLink: "",
              description: "",
              tags: "",
              demoVideo: null,
              liveDemo: "",
              thumbnail: null,
            });
            // Refresh projects list
            fetchProjects();
          } else {
            setMessage(response.data.message || "Something went wrong");
            toast.error(response.data.message || "Something went wrong");
          }
        }
      }
    } catch (err) {
      console.error(err);
      setMessage("Upload failed. Check backend.");
      toast.error("Upload failed. Check backend.");
    }

    setLoading(false);
    setUploadProgress(0);
  };

  //
  
  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900 flex items-start">
      {showenter && (
        <>
          {console.log("showent is ", showenter)}
          <Enter toop={1} setShowenter={setShowenter} />
        </>
      )}

      {/* Upload Progress Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-70 dark:bg-opacity-80 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="mb-6">
                <svg className="w-20 h-20 mx-auto text-indigo-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Uploading Project</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">Please wait while we upload your files...</p>
              
              {/* Progress Bar */}
              <div className="relative w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                >
                  <div className="absolute inset-0 bg-white dark:bg-gray-300 opacity-20 animate-pulse"></div>
                </div>
              </div>
              
              {/* Percentage Display */}
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-bold text-indigo-600">{uploadProgress}%</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
              
              {uploadProgress === 100 && (
                <p className="text-sm text-green-600 mt-4 font-medium animate-pulse">Processing on server...(This can take few minutes)</p>
              )}
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {/* Menu Toggle Button */}
      {show && (
        <button
          className="w-10 fixed top-20 left-1 z-40 p-2"
          onClick={() => {
            setSmall(!small);
            if (window.innerWidth < 768) {
              setAbs(true);
            }
          }}
        >
          {small ? <Menu size={28} className="text-gray-500 dark:text-gray-400" /> : <X size={28} className="text-gray-500 dark:text-gray-400" />}
        </button>
      )}

      {/* LEFT SIDEBAR */}
      {show && (
        <div className={`bg-white dark:bg-gray-800 shadow-lg p-8 flex flex-col items-center transition-all duration-300 z-30 ${small
            ? "hidden"
            : abs
              ? "absolute top-0 left-0 h-full w-3/4 md:w-1/4"
              : "w-1/4"
          }`}>
            <img src={gifi} alt="" />
          <h2 className="text-2xl font-semibold mb-8">Project Menu</h2>

          <ul className="text-gray-600 dark:text-gray-400 w-full flex flex-col  ">
            <li onClick={() => setActive(1)} className="cursor-pointer hover:text-indigo-600  hover:shadow-lg hover:bg-indigo-50 rounded-2xl w-full text-center py-2">
              Add Project
            </li>
            <li onClick={() => setActive(2)} className="cursor-pointer hover:text-indigo-600  hover:shadow-lg hover:bg-indigo-50 rounded-2xl w-full text-center py-2">
              My Projects
            </li>
            <li onClick={() => setActive(3)} className="cursor-pointer hover:text-indigo-600  hover:shadow-lg hover:bg-indigo-50 rounded-2xl w-full text-center py-2">
              Dashboard
            </li>
          </ul>
        </div>
      )}

      {/* RIGHT CONTENT */}
      {active == 1 && showvideourl == "" && (

        <div className="flex-1 p-12 no-scrollbar h-full overflow-y-auto">

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-semibold">
                {editingProject ? 'Edit Project' : 'Add Project'}
              </h1>
              {editingProject && (
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Editing: <span className="font-medium">{editingProject.displayName}</span>
                </p>
              )}
            </div>
            {editingProject && (
              <button
                onClick={() => {
                  setEditingProject(null);
                  setFormData({
                    projectName: "",
                    githubLink: "",
                    description: "",
                    tags: "",
                    demoVideo: null,
                    liveDemo: "",
                    thumbnail: null,
                  });
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-8 space-y-6" encType="multipart/form-data">

            {/* Project Name */}
            <div>
              <label className="text-gray-700 dark:text-gray-300 font-medium">Project Name</label>
              <input
                value={formData.projectName}
                type="text"
                name="projectName"
                placeholder="Enter the project title"
                onChange={handleChange}
                required
                className="text-gray-600 dark:text-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 w-full border rounded-lg p-2 mt-1 focus:border-indigo-500 dark:focus:border-indigo-400"
              />
            </div>

            {/* GitHub Link */}
            <div>
              <label className="text-gray-700 dark:text-gray-300 font-medium">GitHub Repository Link</label>
              <div className="flex gap-4">
                <input
                  value={formData.githubLink}
                  type="url"
                  name="githubLink"
                  placeholder="https://github.com/username/repo"
                  onChange={handleChange}
                  className="text-gray-600 dark:text-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 w-full border rounded-lg p-2 mt-1 focus:border-indigo-500 dark:focus:border-indigo-400"
                />
                <button onClick={handleFetch} type="button" className="bg-indigo-600 text-white px-4 rounded-lg mt-1 hover:bg-indigo-700">
                  Fetch
                </button>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-gray-700 dark:text-gray-300 font-medium">Short Description</label>
              <textarea
                value={formData.description || ""}
                name="description"
                rows="3"
                placeholder="A short description about your project..."
                onChange={handleChange}
                className="text-gray-600 dark:text-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 w-full border rounded-lg p-3 mt-1 focus:border-indigo-500 dark:focus:border-indigo-400"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="text-gray-700 dark:text-gray-300 font-medium">Tech Stack / Tags</label>
              <input
                value={formData.tags}
                type="text"
                name="tags"
                placeholder="Fetched automatically"
                onChange={handleChange}
                disabled
                className="text-gray-600 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700 w-full border rounded-lg p-2 mt-1 focus:border-indigo-500 bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* Live Demo */}
            <div>
              <label className="text-gray-700 dark:text-gray-300 font-medium">Live Demo Link (optional)</label>
              <input
                type="url"
                name="liveDemo"
                placeholder="https://your-deployment-link.com"
                onChange={handleChange}
                className="text-gray-600 dark:text-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 w-full border rounded-lg p-2 mt-1 focus:border-indigo-500 dark:focus:border-indigo-400"
              />
            </div>

            {/* Demo Video */}
            <div>
              <label className="text-gray-700 dark:text-gray-300 font-medium">Upload Demo Video (Optional)</label>
              <input
                type="file"
                name="demoVideo"
                accept="video/*"
                onChange={handleChange}
                className="text-gray-600 dark:text-gray-200 dark:bg-gray-700 dark:border-gray-600 w-full border rounded-lg p-2 mt-1 bg-gray-50 dark:bg-gray-700"
              />
            </div>

            {/* Thumbnail */}
            <div>
              <label className="text-gray-700 dark:text-gray-300 font-medium">Thumbnail / Cover Image (Optional)</label>
              <input
                type="file"
                name="thumbnail"
                accept="image/*"
                onChange={handleChange}
                className="text-gray-600 dark:text-gray-200 dark:bg-gray-700 dark:border-gray-600 w-full border rounded-lg p-2 mt-1 bg-gray-50 dark:bg-gray-700"
              />
            </div>

            {/* Save Button */}
            <div className="text-right">
              {loading ? (<button type="submit" disabled={loading} className="click bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition">
                Uploading...
              </button>) :
                (<button type="submit" disabled={loading} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition">

                  "Save Project"
                </button>)}
            </div>

            {/* Success/Error message */}
            {message && <p className="text-green-600 dark:text-green-400">{message}</p>}
          </form>
        </div>
      )}

      {/* My Projects Area */}

      {/* Dashboard - Hidden Repositories */}
      {active == 3 && showvideourl == "" && (
        <div className="flex-1 p-12 max-h-[90vh] overflow-y-auto">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6 text-center md:text-left">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-center md:text-left">Manage your hidden repositories</p>

          {hiddenRepos.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow">
              <p className="text-gray-500 dark:text-gray-400 text-lg">No hidden repositories</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Hide repositories from "My Projects" to manage them here</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Hidden Repositories ({hiddenRepos.length})</h2>
              <div className="space-y-3">
                {hiddenRepos.map((repoUrl, index) => {
                  // Find the repo details from githubRepos
                  const repo = githubRepos.find(r => r.htmlUrl === repoUrl);
                  const repoName = repo?.name || repoUrl.split('/').pop();

                  return (
                    <div key={index} className="flex items-center flex-wrap gap-1 md:gap-0 justify-between p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                      <div className="flex-1 ">
                        <h3 className="font-medium text-gray-900 dark:text-white">{repoName}</h3>
                        {repo && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{repo.description || "No description"}</p>
                        )}
                        <a
                          href={repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-600 hover:underline mt-1 inline-block"
                        >
                          {repoUrl}
                        </a>
                      </div>
                      <button
                        onClick={() => handleUnhideRepo(repoUrl)}
                        className="ml-auto md:ml-4 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 text-sm"
                      >
                        Unhide
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {showvideourl !== "" && (<div className=" absolute top-0 right-0 bg-black h-full flex-1 p-12 overflow-y-auto">
        <div className="relative flex items-center">
          <button className=' cursor-pointer font-bold' onClick={() => setShowvideourl("")}><X size={34} className="text-white font-bold" /></button>
        </div>
        <video src={showvideourl} controls className="w-3/4 mx-auto "></video>
      </div>)}
    </div>
  );
}
