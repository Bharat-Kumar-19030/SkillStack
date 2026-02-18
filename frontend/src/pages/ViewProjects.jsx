import React, { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { motion } from "framer-motion";
import { X } from 'lucide-react';
import upvoteicon from "../assets/upvote.svg";
import forkicon from "../assets/fork.svg";
import eyeicon from "../assets/eye.svg";
import liveicon from "../assets/live.svg";
const ViewProjects = () => {
    const { user } = useAuth();
    const [editingProject, setEditingProject] = useState(null); // Track project being edited
    const [hiddenRepos, setHiddenRepos] = useState([]); // Store hidden repo URLs
    const [loadingRepos, setLoadingRepos] = useState(false);
    const [mergedProjects, setMergedProjects] = useState([]);
    const [sortBy, setSortBy] = useState('priority'); // Sort option state (default to priority)
    const [contributions, setContributions] = useState([]);
    const [sortedContributions, setSortedContributions] = useState([]);
    const [githubRepos, setGithubRepos] = useState([]);
    const [projects, setProjects] = useState([]);
    const [fetching, setFetching] = useState(false);
    const [projectRankings, setProjectRankings] = useState({}); // Store project rankings {projectId: rank}
    const [contributionRankings, setContributionRankings] = useState({}); // Store contribution rankings
    const [showvideourl, setShowvideourl] = useState(""); // Video modal state

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [formData, setFormData] = useState({
        projectName: "",
        githubLink: "",
        description: "",
        tags: "",
        demoVideo: null,
        liveDemo: "",
        thumbnail: null,
    });
    useEffect(() => {
        if (!user) return;
        fetchProjects();
        fetchHiddenRepos();
        fetchContributions();
        fetchRankings();
    }, [user]);  // Only fetch on user change, not sortBy
    const fetchContributions = async () => {
        setFetching(true);
        if (!user) {
            setFetching(false);
            return;
        }
        try {
            const SERVER_URL = import.meta.env.VITE_SERVER_URL
            const res = await fetch(`${SERVER_URL}/api/github/contributions`, {
                method: "GET",
                credentials: "include",
            });
            if (res.ok) {
                const data = await res.json();
                console.log("Fetched contributions data:", data);
                console.log("Setting contributions to:", data.repos || []);
                setContributions(data.repos || []);
            } else {
                const errorData = await res.json();
                console.error("Failed to fetch contributions:", errorData);
            }
        } catch (err) {
            console.error("Error fetching contributions:", err);
        } finally {
            setFetching(false);
        }
    }

    // Fetch project rankings
    const fetchRankings = async () => {
        if (!user) return;
        try {
            const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
            const response = await fetch(`${SERVER_URL}/api/users/rankings`, {
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Fetched rankings:", data);
                setProjectRankings(data.projectRankings || {});
                setContributionRankings(data.contributionRankings || {});
            }
        } catch (error) {
            console.error("Fetch rankings error:", error);
        }
    };

    // Update project ranking
    const updateProjectRanking = async (projectId, newRank, type = 'project') => {
        try {
            const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
            console.log("Updating ranking:", { projectId, newRank, type });
            const response = await fetch(`${SERVER_URL}/api/users/updateRanking`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ projectId, rank: newRank, type }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Updated rankings:", data);
                if (type === 'project') {
                    setProjectRankings(prev => ({ ...prev, ...data.projectRankings }));
                } else {
                    setContributionRankings(prev => ({ ...prev, ...data.contributionRankings }));
                }
                return true;
            } else {
                const errorData = await response.json();
                console.error('Failed to update ranking:', errorData);
                toast.error('Failed to update ranking: ' + (errorData.message || 'Unknown error'));
                return false;
            }
        } catch (error) {
            console.error("Update ranking error:", error);
            toast.error('Failed to update ranking');
            return false;
        }
    };

    // Swap rankings between two projects
    const swapRankings = async (project1Id, rank1, project2Id, rank2, type = 'project') => {
        try {
            // Update both rankings
            await updateProjectRanking(project1Id, rank2, type);
            await updateProjectRanking(project2Id, rank1, type);
            toast.success('Priority updated');
        } catch (error) {
            console.error("Swap rankings error:", error);
        }
    };

    // Initialize all rankings based on current sort order
    const initializeRankings = async (type = 'project') => {
        const projectsList = type === 'project' ? sortedMergedProjects : sortedContributions;
        const rankings = type === 'project' ? projectRankings : contributionRankings;

        // Assign sequential ranks to all projects that don't have one
        const updates = [];
        projectsList.forEach((project, index) => {
            const projectId = project.htmlUrl || project.githubUrl || project._id || project.id;
            if (rankings[projectId] === undefined) {
                updates.push({ projectId, rank: index });
            }
        });

        // Batch update all rankings
        for (const { projectId, rank } of updates) {
            await updateProjectRanking(projectId, rank, type);
        }
    };

    // Move project up in ranking (decrease rank number, move towards 0)
    const moveProjectUp = async (project, type = 'project') => {
        const rankings = type === 'project' ? projectRankings : contributionRankings;
        const projectsList = type === 'project' ? sortedMergedProjects : sortedContributions;
        const projectId = project.htmlUrl || project.githubUrl || project._id || project.id;

        // Find current project's index in the displayed list
        const currentIndex = projectsList.findIndex(p => {
            const pId = p.htmlUrl || p.githubUrl || p._id || p.id;
            return pId === projectId;
        });

        if (currentIndex === -1) return; // Project not found
        if (currentIndex === 0) return; // Already at the top

        // Get the project directly above in the display list
        const projectAbove = projectsList[currentIndex - 1];
        const projectAboveId = projectAbove.htmlUrl || projectAbove.githubUrl || projectAbove._id || projectAbove.id;

        // Get or initialize rankings
        let currentRank = rankings[projectId];
        let aboveRank = rankings[projectAboveId];

        // Initialize ranks if they don't exist (based on current display positions)
        if (currentRank === undefined) {
            currentRank = currentIndex;
            await updateProjectRanking(projectId, currentRank, type);
        }
        if (aboveRank === undefined) {
            aboveRank = currentIndex - 1;
            await updateProjectRanking(projectAboveId, aboveRank, type);
        }

        // Swap ranks
        console.log("Swapping:", { projectId, currentRank, newRank: aboveRank, projectAboveId, aboveRank, newAboveRank: currentRank });
        await swapRankings(projectId, currentRank, projectAboveId, aboveRank, type);
    };

    // Move project down in ranking (increase rank number, move away from 0)
    const moveProjectDown = async (project, type = 'project') => {
        const rankings = type === 'project' ? projectRankings : contributionRankings;
        const projectsList = type === 'project' ? sortedMergedProjects : sortedContributions;
        const projectId = project.htmlUrl || project.githubUrl || project._id || project.id;

        // Find current project's index in the displayed list
        const currentIndex = projectsList.findIndex(p => {
            const pId = p.htmlUrl || p.githubUrl || p._id || p.id;
            return pId === projectId;
        });

        if (currentIndex === -1) return; // Project not found
        if (currentIndex === projectsList.length - 1) return; // Already at the bottom

        // Get the project directly below in the display list
        const projectBelow = projectsList[currentIndex + 1];
        const projectBelowId = projectBelow.htmlUrl || projectBelow.githubUrl || projectBelow._id || projectBelow.id;

        // Get or initialize rankings
        let currentRank = rankings[projectId];
        let belowRank = rankings[projectBelowId];

        // Initialize ranks if they don't exist (based on current display positions)
        if (currentRank === undefined) {
            currentRank = currentIndex;
            await updateProjectRanking(projectId, currentRank, type);
        }
        if (belowRank === undefined) {
            belowRank = currentIndex + 1;
            await updateProjectRanking(projectBelowId, belowRank, type);
        }

        // Swap ranks
        console.log("Swapping:", { projectId, currentRank, newRank: belowRank, projectBelowId, belowRank, newBelowRank: currentRank });
        await swapRankings(projectId, currentRank, projectBelowId, belowRank, type);
    };
    // FETCH PROJECTS FROM BACKEND
    //
    const fetchProjects = async () => {
        if (!user) return;
        try {
            const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

            // Fetch database projects
            const projectsResponse = await fetch(`${SERVER_URL}/api/projects/me?sortBy=${sortBy}`, {
                headers: {
                    "x-user-id": user._id,
                },
            });

            if (projectsResponse.ok) {
                const projectsData = await projectsResponse.json();
                setProjects(projectsData);
                console.log("Fetched database projects:", projectsData);
            } else {
                console.error("Failed to fetch projects");
            }

            // Fetch GitHub repositories
            if (user?.fetchPublicRepos || user?.fetchPrivateRepos) {
                setLoadingRepos(true);
                const githubResponse = await fetch(`${SERVER_URL}/api/github/userRepos`, {
                    credentials: 'include',
                });

                if (githubResponse.ok) {
                    const githubData = await githubResponse.json();
                    setGithubRepos(githubData.repos || []);
                    console.log("Fetched GitHub repos:", githubData);
                } else {
                    const error = await githubResponse.json();
                    console.error("Failed to fetch GitHub repos:", error.message);
                    if (error.message.includes('GitHub profile link')) {
                        // Don't show error if user hasn't set up GitHub link yet
                        console.log('GitHub profile not configured');
                    } else {
                        toast.error(error.message || "Could not fetch GitHub repositories");
                    }
                }
                setLoadingRepos(false);
            }

        } catch (error) {
            console.error("Fetch error:", error);
            setLoadingRepos(false);
        }
    };

    // Fetch hidden repositories
    const fetchHiddenRepos = async () => {
        if (!user) return;
        try {
            const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
            const response = await fetch(`${SERVER_URL}/api/users/hiddenRepos`, {
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setHiddenRepos(data.hiddenRepos || []);
            }
        } catch (error) {
            console.error("Fetch hidden repos error:", error);
        }
    };

    // Hide repository
    const handleHideRepo = async (repoUrl) => {
        try {
            const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
            const response = await fetch(`${SERVER_URL}/api/users/hideRepo`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ repoUrl }),
            });

            if (response.ok) {
                const data = await response.json();
                setHiddenRepos(data.hiddenRepos);
                toast.success('Repository hidden successfully');
            } else {
                toast.error('Failed to hide repository');
            }
        } catch (error) {
            console.error("Hide repo error:", error);
            toast.error('Failed to hide repository');
        }
    };

    // Unhide repository
    const handleUnhideRepo = async (repoUrl) => {
        try {
            const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
            const response = await fetch(`${SERVER_URL}/api/users/unhideRepo`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ repoUrl }),
            });

            if (response.ok) {
                const data = await response.json();
                setHiddenRepos(data.hiddenRepos);
                toast.success('Repository unhidden successfully');
            } else {
                toast.error('Failed to unhide repository');
            }
        } catch (error) {
            console.error("Unhide repo error:", error);
            toast.error('Failed to unhide repository');
        }
    };

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData({
            ...formData,
            [name]: files ? files[0] : value,
        });
    };

    // Fetch repository details from GitHub
    const handleFetch = async () => {
        setFetching(true);
        if (!user) {
            toast.error("Please login to fetch repository details.");
            setFetching(false);
            return;
        }
        const githubUrl = formData.githubLink;
        if (githubUrl.trim() === "") {
            toast.error("Please enter a GitHub repository URL.");
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
                toast.success("Repository details fetched!");
            } else {
                toast.error(data.message || "Failed to fetch repository details.");
            }
        } catch (err) {
            toast.error("Failed to fetch repository details.");
            console.error(err);
        }
        setFetching(false);
    };

    // Open Add Project Modal
    const openAddModal = () => {
        setFormData({
            projectName: "",
            githubLink: "",
            description: "",
            tags: "",
            demoVideo: null,
            liveDemo: "",
            thumbnail: null,
        });
        setShowAddModal(true);
    };

    // Open Edit Project Modal
    const openEditModal = (project) => {
        setEditingProject(project);
        setFormData({
            projectName: project.displayName || project.projectName || "",
            githubLink: project.htmlUrl || project.githubUrl || "",
            description: project.displayDescription || project.shortDescription || "",
            tags: project.topics?.join(", ") || "",
            demoVideo: null,
            liveDemo: project.homepage || project.liveDemoUrl || "",
            thumbnail: null,
        });
        setShowEditModal(true);
    };

    // Close modals
    const closeModals = () => {
        setShowAddModal(false);
        setShowEditModal(false);
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
    };

    // Submit form (Add or Edit)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error('Please Login to continue!');
            return;
        }
        setLoading(true);
        setUploadProgress(0);

        try {
            const data = new FormData();
            data.append("projectName", formData.projectName);
            data.append("shortDescription", formData.description);
            data.append("githubUrl", formData.githubLink);
            data.append("liveDemoUrl", formData.liveDemo);
            data.append("tags", formData.tags);

            if (formData.githubCreatedAt) data.append("githubCreatedAt", formData.githubCreatedAt);
            if (formData.githubUpdatedAt) data.append("githubUpdatedAt", formData.githubUpdatedAt);
            if (formData.thumbnail) data.append("thumbnail", formData.thumbnail);
            if (formData.demoVideo) data.append("demoVideo", formData.demoVideo);

            const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

            const uploadWithProgress = (url, method) => {
                return new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.upload.addEventListener('progress', (e) => {
                        if (e.lengthComputable) {
                            const percentComplete = Math.round((e.loaded / e.total) * 100);
                            setUploadProgress(percentComplete);
                        }
                    });
                    xhr.upload.addEventListener('loadstart', () => {
                        setUploadProgress(1);
                    });
                    xhr.addEventListener('load', () => {
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
                        reject(new Error('Network error'));
                    });
                    xhr.open(method, url);
                    xhr.setRequestHeader('x-user-id', user._id);
                    xhr.send(data);
                });
            };

            if (editingProject && editingProject.source === 'database' && editingProject._id) {
                // Update existing project
                const response = await uploadWithProgress(
                    `${SERVER_URL}/api/projects/${editingProject._id}`,
                    'PUT'
                );
                if (response.ok) {
                    toast.success("Project updated successfully!");
                    closeModals();
                    fetchProjects();
                } else {
                    toast.error(response.data.message || "Failed to update project");
                }
            } else {
                // Check if project exists
                const existingProject = projects.find(
                    p => p.githubUrl?.toLowerCase() === formData.githubLink?.toLowerCase()
                );
                if (existingProject) {
                    // Update existing
                    const response = await uploadWithProgress(
                        `${SERVER_URL}/api/projects/${existingProject._id}`,
                        'PUT'
                    );
                    if (response.ok) {
                        toast.success("Project updated successfully!");
                        closeModals();
                        fetchProjects();
                    } else {
                        toast.error(response.data.message || "Failed to update project");
                    }
                } else {
                    // Create new project
                    const response = await uploadWithProgress(
                        `${SERVER_URL}/api/projects`,
                        'POST'
                    );
                    if (response.ok) {
                        toast.success("Project created successfully!");
                        closeModals();
                        fetchProjects();
                    } else {
                        toast.error(response.data.message || "Something went wrong");
                    }
                }
            }
        } catch (err) {
            console.error(err);
            toast.error("Upload failed. Check backend.");
        }
        setLoading(false);
        setUploadProgress(0);
    };

    // Delete project
    const handleDeleteProject = async (projectId) => {
        if (!window.confirm('Are you sure you want to delete this project? This will also remove all associated media files.')) {
            return;
        }

        try {
            const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
            const response = await fetch(`${SERVER_URL}/api/projects/${projectId}`, {
                method: 'DELETE',
                headers: {
                    'x-user-id': user._id,
                },
            });

            if (response.ok) {
                toast.success('Project deleted successfully');
                // Refresh projects list
                fetchProjects();
            } else {
                const error = await response.json();
                toast.error(error.message || 'Failed to delete project');
            }
        } catch (error) {
            console.error("Delete project error:", error);
            toast.error('Failed to delete project');
        }
    };

    // Merge GitHub repos with database projects
    useEffect(() => {
        const mergeProjects = async () => {
            console.log("🔁 Starting mergeProjects - DB:", projects.length, "GitHub:", githubRepos.length, "Hidden:", hiddenRepos.length);
            if (projects.length === 0 && githubRepos.length === 0) {
                setMergedProjects([]);
                console.log("⚠️ Both projects and githubRepos are empty");
                return;
            }

            const merged = [];
            const processedGithubUrls = new Set();

            // First, process database projects and merge with GitHub data
            for (const dbProject of projects) {
                const normalizedUrl = dbProject.githubUrl?.toLowerCase().replace(/\.git$/, '');
                if (normalizedUrl) {
                    processedGithubUrls.add(normalizedUrl);
                }

                // Check if this database project's GitHub URL is hidden
                const isHidden = hiddenRepos.some(hiddenUrl =>
                    hiddenUrl.toLowerCase().replace(/\.git$/, '') === normalizedUrl
                );

                // Skip if hidden
                if (isHidden) {
                    continue;
                }

                // Find matching GitHub repo to get live stats
                const matchingGithubRepo = githubRepos.find(repo =>
                    repo.htmlUrl?.toLowerCase().replace(/\.git$/, '') === normalizedUrl
                );

                if (matchingGithubRepo) {
                    // Merge: Database project with GitHub live data
                    merged.push({
                        ...matchingGithubRepo, // GitHub data (stars, forks, language, etc.)
                        ...dbProject, // Database overrides (custom name, description, thumbnails, etc.)
                        source: 'database', // Mark as database project
                        displayName: dbProject.projectName, // Use database name
                        displayDescription: dbProject.shortDescription, // Use database description
                        // Keep GitHub metadata
                        language: matchingGithubRepo.language,
                        stargazersCount: matchingGithubRepo.stargazersCount,
                        forksCount: matchingGithubRepo.forksCount,
                        watchersCount: matchingGithubRepo.watchersCount,
                        topics: matchingGithubRepo.topics || [],
                        private: matchingGithubRepo.private,
                        htmlUrl: matchingGithubRepo.htmlUrl,
                        owner: matchingGithubRepo.owner?.login,
                        ownerurl: matchingGithubRepo.owner?.avatarUrl,
                        languages: matchingGithubRepo.languages,
                        homepage: dbProject.liveDemoUrl || matchingGithubRepo.homepage, // Database URL takes priority
                        // Always use GitHub dates (never database timestamps)
                        createdAt: matchingGithubRepo.createdAt,
                        updatedAt: matchingGithubRepo.updatedAt,
                        githubCreatedAt: dbProject.githubCreatedAt || matchingGithubRepo.createdAt,
                        githubUpdatedAt: dbProject.githubUpdatedAt || matchingGithubRepo.updatedAt,
                    });
                } else {
                    // Database project without matching GitHub repo
                    // Fetch repo details from API if GitHub URL exists
                    let repoOwner = null;
                    let ownerAvatarUrl = null;
                    let repoData = null;

                    if (dbProject.githubUrl) {
                        const match = dbProject.githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
                        repoOwner = match ? match[1] : null;
                        const repoName = match ? match[2].replace(/\.git$/, '') : null;

                        // Construct GitHub avatar URL from username
                        if (repoOwner) {
                            ownerAvatarUrl = `https://github.com/${repoOwner}.png`;
                        }

                        // Fetch repo details including languages
                        if (repoOwner && repoName) {
                            try {
                                const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
                                const response = await fetch(`${SERVER_URL}/api/github/fetchRepoDetails`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ githubUrl: dbProject.githubUrl }),
                                    credentials: "include",
                                });
                                if (response.ok) {
                                    repoData = await response.json();
                                }
                            } catch (err) {
                                console.error(`Failed to fetch repo details for ${dbProject.githubUrl}:`, err);
                            }
                        }
                    }

                    merged.push({
                        ...dbProject,
                        source: 'database',
                        displayName: dbProject.projectName,
                        displayDescription: dbProject.shortDescription,
                        owner: repoOwner || user?.name || "N/A",
                        ownerurl: ownerAvatarUrl || user?.profileImage || null,
                        homepage: dbProject.liveDemoUrl,
                        // Add fetched repo data if available
                        language: repoData?.language || null,
                        languages: repoData?.languages || null,
                        stargazersCount: repoData?.stargazers_count || 0,
                        forksCount: repoData?.forks_count || 0,
                        watchersCount: repoData?.watchers_count || 0,
                        commitCount: repoData?.commitCount || 0,
                        topics: repoData?.topics || [],
                    });
                }
            }

            // Then add GitHub repos that aren't in database and aren't hidden
            console.log("🔍 Processing GitHub repos:", githubRepos.length, "items");
            console.log("📋 Already processed GitHub URLs:", processedGithubUrls.size);
            console.log("🚫 Hidden repos:", hiddenRepos.length);
            
            let addedFromGithub = 0;
            githubRepos.forEach(repo => {
                const normalizedRepoUrl = repo.htmlUrl?.toLowerCase().replace(/\.git$/, '');

                // Skip if already in database or is hidden
                const isRepoHidden = hiddenRepos.some(hiddenUrl => 
                    hiddenUrl.toLowerCase().replace(/\.git$/, '') === normalizedRepoUrl
                );
                if (!processedGithubUrls.has(normalizedRepoUrl) && !isRepoHidden) {
                    merged.push({
                        ...repo,
                        source: 'github',
                        displayName: repo.name,
                        displayDescription: repo.description,
                        projectName: repo.name,
                        shortDescription: repo.description,
                        githubUrl: repo.htmlUrl,
                        owner: repo.owner?.login,
                        ownerurl: repo.owner?.avatarUrl,
                        thumbnailUrl: null,
                        demoVideoUrl: null,
                        homepage: repo.homepage, // Keep GitHub's homepage
                    });
                    addedFromGithub++;
                }
            });
            console.log("➕ Added from GitHub:", addedFromGithub, "items");
            console.log("📦 Total merged:", merged.length, "items");

            // Apply sorting to merged projects
            const sortedMerged = [...merged].sort((a, b) => {
                // Get project IDs for ranking
                const projectIdA = a.htmlUrl || a.githubUrl || a._id || a.id;
                const projectIdB = b.htmlUrl || b.githubUrl || b._id || b.id;
                const rankA = projectRankings[projectIdA];
                const rankB = projectRankings[projectIdB];

                // If sortBy is 'priority', use ranking as PRIMARY sort only
                if (sortBy === 'priority') {
                    // If both have rankings, sort by rank (lower number = higher priority)
                    if (rankA !== undefined && rankB !== undefined) {
                        return rankA - rankB;
                    }

                    // If only one has ranking, that one comes first
                    if (rankA !== undefined) return -1;
                    if (rankB !== undefined) return 1;

                    // If neither has ranking, keep original order
                    return 0;
                }

                // For other sort options: use selected option as PRIMARY, ranking as SECONDARY
                let primarySort = 0;
                switch (sortBy) {
                    case 'createdAt':
                        // Database projects have createdAt, GitHub repos use createdAt field
                        primarySort = new Date(b.githubCreatedAt || b.createdAt || b.created_at || 0) - new Date(a.githubCreatedAt || a.createdAt || a.created_at || 0);
                        break;

                    case 'updatedAt':
                        // Database projects have updatedAt, GitHub repos use updatedAt field
                        primarySort = new Date(b.githubUpdatedAt || b.updatedAt || b.updated_at || 0) - new Date(a.githubUpdatedAt || a.updatedAt || a.updated_at || 0);
                        break;

                    case 'name':
                        // Sort alphabetically by name
                        const nameA = (a.displayName || '').toLowerCase();
                        const nameB = (b.displayName || '').toLowerCase();
                        primarySort = nameA.localeCompare(nameB);
                        break;

                    case 'public':
                        // Public repos first, then private
                        const isPublicA = a.source === 'github' ? !a.private : a.isPublic;
                        const isPublicB = b.source === 'github' ? !b.private : b.isPublic;
                        primarySort = (isPublicB ? 1 : 0) - (isPublicA ? 1 : 0);
                        break;

                    case 'deployment':
                        // Projects with live demo links first
                        const hasDeployA = !!(a.homepage || a.liveDemoUrl);
                        const hasDeployB = !!(b.homepage || b.liveDemoUrl);
                        primarySort = (hasDeployB ? 1 : 0) - (hasDeployA ? 1 : 0);
                        break;

                    case 'demo':
                        // Projects with demo video first
                        const hasDemoA = !!a.demoVideoUrl;
                        const hasDemoB = !!b.demoVideoUrl;
                        primarySort = (hasDemoB ? 1 : 0) - (hasDemoA ? 1 : 0);
                        break;

                    default:
                        primarySort = 0;
                }

                // If primary sort is equal, use ranking as SECONDARY sort
                if (primarySort === 0) {
                    // If both have rankings, sort by rank
                    if (rankA !== undefined && rankB !== undefined) {
                        return rankA - rankB;
                    }
                    // If only one has ranking, that one comes first
                    if (rankA !== undefined) return -1;
                    if (rankB !== undefined) return 1;
                }

                return primarySort;
            });

            setMergedProjects(sortedMerged);
            console.log("✅ Merged projects set:", sortedMerged.length, "items");
        };

        mergeProjects();
    }, [projects, githubRepos, hiddenRepos, sortBy, user]);  // Don't include rankings here - let useMemo handle sorting
    
    // Re-sort when rankings change using useMemo (prevents race conditions)
    const sortedMergedProjects = useMemo(() => {
        console.log("🔄 useMemo running - mergedProjects:", mergedProjects.length, "projectRankings:", Object.keys(projectRankings).length);
        if (mergedProjects.length === 0) {
            console.log("⚠️ mergedProjects is empty, returning []");
            return [];
        }
        
        // For priority sort, apply ranking-based sorting
        // For other sorts, the merge already sorted them, so just apply rankings as secondary
        const sorted = [...mergedProjects].sort((a, b) => {
            const projectIdA = a.htmlUrl || a.githubUrl || a._id || a.id;
            const projectIdB = b.htmlUrl || b.githubUrl || b._id || b.id;
            const rankA = projectRankings[projectIdA];
            const rankB = projectRankings[projectIdB];

            // When sorting by priority, use ONLY rankings
            if (sortBy === 'priority') {
                if (rankA !== undefined && rankB !== undefined) {
                    return rankA - rankB;
                }
                if (rankA !== undefined) return -1;
                if (rankB !== undefined) return 1;
                return 0;
            }
            
            // For other sort modes, keep the merge order (rankings already applied as secondary)
            return 0;
        });
        console.log("✅ sortedMergedProjects:", sorted.length, "items");
        return sorted;
    }, [mergedProjects, projectRankings, sortBy]);  // Recalculate when any of these change

    // Sort contributions with ranking as secondary sort
    useEffect(() => {
        if (!contributions || contributions.length === 0) {
            setSortedContributions([]);
            return;
        }

        const sorted = [...contributions].sort((a, b) => {
            // Get project IDs for ranking
            const projectIdA = a.htmlUrl || a.id;
            const projectIdB = b.htmlUrl || b.id;
            const rankA = contributionRankings[projectIdA];
            const rankB = contributionRankings[projectIdB];

            // If sortBy is 'priority', use ranking as PRIMARY sort only
            if (sortBy === 'priority') {
                // If both have rankings, sort by rank (lower number = higher priority)
                if (rankA !== undefined && rankB !== undefined) {
                    return rankA - rankB;
                }

                // If only one has ranking, that one comes first
                if (rankA !== undefined) return -1;
                if (rankB !== undefined) return 1;

                // If neither has ranking, keep original order
                return 0;
            }

            // For other sort options: use selected option as PRIMARY, ranking as SECONDARY
            let primarySort = 0;
            switch (sortBy) {
                case 'createdAt':
                    primarySort = new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0);
                    break;

                case 'updatedAt':
                    primarySort = new Date(b.updatedAt || b.updated_at || 0) - new Date(a.updatedAt || a.updated_at || 0);
                    break;

                case 'name':
                    const nameA = (a.name || '').toLowerCase();
                    const nameB = (b.name || '').toLowerCase();
                    primarySort = nameA.localeCompare(nameB);
                    break;

                case 'public':
                    primarySort = (b.private ? 0 : 1) - (a.private ? 0 : 1);
                    break;

                case 'deployment':
                    primarySort = (!!b.homepage ? 1 : 0) - (!!a.homepage ? 1 : 0);
                    break;

                default:
                    primarySort = 0;
            }

            // If primary sort is equal, use ranking as SECONDARY sort
            if (primarySort === 0) {
                // If both have rankings, sort by rank
                if (rankA !== undefined && rankB !== undefined) {
                    return rankA - rankB;
                }
                // If only one has ranking, that one comes first
                if (rankA !== undefined) return -1;
                if (rankB !== undefined) return 1;
            }

            return primarySort;
        });

        setSortedContributions(sorted);
    }, [contributions, sortBy, contributionRankings]);

    return (
        <div>
            <div className="flex-1 p-4 md:p-12 md:px-20 ">
                <div className='dark:bg-gray-700 p-6 rounded-xl shadow-md'>
                    <div className="flex items-center justify-between mb-3">
                        <h1 className="text-gray-900 dark:text-white text-center md:text-left text-2xl md:text-3xl font-semibold">My Projects</h1>
                        <button
                            onClick={openAddModal}
                            className="font-semibold cursor-pointer px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add New
                        </button>
                    </div>
                    <div className="flex flex-col justify-between md:justify-between mb-6 md:flex-row">
                        <div className="font-dancing order-2">
                            <select
                                name="sort"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-0 py-1 text-gray-500 dark:text-gray-300 dark:bg-gray-800 dark:border-gray-600 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                            >
                                <option hidden className="text-center " disabled value="priority">Sort By</option>
                                <option value="priority">Priority (Custom Ranking)</option>
                                <option value="createdAt">Creation Date (Newest)</option>
                                <option value="updatedAt">Update Date (Recent)</option>
                                <option value="name">Name [A-Z]</option>
                                <option value="public">Public First</option>
                                <option value="deployment">Having Deployment Link</option>
                                <option value="demo">Having Demo Video</option>
                            </select>
                        </div>


                        <p className="text-gray-600 dark:text-gray-400 mb-8 order-1 text-center md:text-left">View and manage all your projects from database and GitHub.</p>
                    </div>
                    {loadingRepos && (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="relative w-full overflow-hidden rounded-xl shadow-md bg-gradient-to-br from-blue-50 to-indigo-50  dark:from-gray-800 dark:to-gray-900 p-2 md:px-4 flex items-center justify-center gap-4 mb-10">

                                {/* Shimmer overlay */}
                                <div className="absolute inset-0 overflow-hidden rounded-xl">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent  dark:via-white/10 animate-shimmer" />
                                </div>

                                {/* Thumbnail Skeleton */}
                                {/* <div className="w-40 h-36 md:w-56 md:h-56 absolute -top-15 md:top-auto mt-12 md:mt-0 md:-left-10rounded-lg  bg-gray-300 dark:bg-gray-700 animate-pulse" /> */}

                                {/* Content Section */}
                                <div className="w-full min-h-56 mt-30 md:mt-0 md:ml-50 space-y-4">

                                    {/* Title + badges */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="h-6 w-1/3 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
                                        <div className="h-5 w-16 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse" />
                                        <div className="h-5 w-20 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse" />
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <div className="h-3 w-full bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
                                        <div className="h-3 w-5/6 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
                                    </div>

                                    {/* Owner */}
                                    <div className="flex items-center gap-2">
                                        <div className="size-6 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse" />
                                        <div className="h-3 w-24 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
                                    </div>

                                    {/* Stats */}
                                    <div className="flex gap-3 flex-wrap">
                                        <div className="h-3 w-16 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
                                        <div className="h-3 w-20 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
                                        <div className="h-3 w-18 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
                                    </div>

                                    {/* Topics */}
                                    <div className="flex gap-2 flex-wrap">
                                        <div className="h-5 w-16 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
                                        <div className="h-5 w-20 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
                                        <div className="h-5 w-14 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
                                    </div>

                                    {/* Language bar */}
                                    <div className="h-2 w-full bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />

                                    {/* Footer */}
                                    <div className="flex justify-between items-center pt-3">
                                        <div className="h-3 w-32 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
                                        <div className="h-6 w-20 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
                                    </div>

                                </div>
                            </div>
                        )))}

                    {mergedProjects.length === 0 && !loadingRepos && (
                        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow">
                            <p className="text-gray-500 dark:text-gray-400 text-lg">No projects found</p>
                            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Add your GitHub profile link in your profile to see your repositories</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-8 md:ml-10 ">
                        {sortedMergedProjects.map((project, index) => (

                            <div key={project.id || index} className="relative w-full bg-gray-100 dark:bg-gray-800 shadow-md rounded-xl p-2 md:p-4 hover:shadow-lg transition flex  items-center justify-center  gap-4">
                                {/* Thumbnail or GitHub Icon */}
                                {/* {console.log("project",project)} */}
                                {project.thumbnailUrl ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 50 }}          // start below
                                        whileInView={{ opacity: 1, y: 0 }}       // end at normal position
                                        transition={{ duration: 0.6, ease: "easeOut" }}
                                        viewport={{ once: true }}                // animate only once
                                        className=" w-40 h-36 md:w-56 md:h-56 absolute -top-15 md:top-auto mt-12 md:mt-0 md:-left-10  shadow-lg"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        {/* <div className="w-56 absolute -left-10 h-56 shadow-lg"> */}
                                        <img src={project.thumbnailUrl} className=" w-40 h-36  md:w-56 md:h-56 object-cover rounded-lg hover:scale-105 transition-transform duration-300" alt="Project thumbnail" />
                                        {/* </div> */}

                                    </motion.div>
                                ) : (
                                    <div className="w-40 h-36 md:w-56 md:h-56 shadow-lg hover:scale-105 transition-transform duration-300 absolute -top-15 md:top-auto mt-12 md:mt-0 md:-left-10 bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-gray-800 dark:to-gray-700 rounded-lg flex items-center justify-center">
                                        <motion.svg
                                            initial={{ opacity: 0, y: 50 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.6, ease: "easeOut" }}
                                            viewport={{ once: false }}
                                            className="w-16 h-16 text-indigo-600 dark:text-indigo-300"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <svg className="w-16 h-16 text-indigo-600 dark:text-indigo-300" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                                            </svg>
                                        </motion.svg>
                                    </div>
                                )}


                                {/* Project Header */}
                                <div className="w-full min-h-56 mt-34 md:mt-0 md:ml-50">
                                    <div className="mt-1">
                                        <div className="flex items-start justify-between">
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex-1 text-center md:text-left">{project.displayName}</h3>
                                            {(project.source === 'github' || project.private !== undefined) && project.private && (
                                                <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                                    Private
                                                </span>
                                            )}
                                            {(project.source === 'github' || project.private !== undefined) && !project.private && (
                                                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                                    Public
                                                </span>
                                            )}
                                        </div>

                                        {project.displayDescription && <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 line-clamp-2">
                                            {project.displayDescription}
                                        </p>}
                                        <div className="flex items-center mt-2 gap-2">
                                            <img className="size-6 rounded-full" src={project.ownerurl} alt="" />
                                            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                                                by {project.owner || "N/A"}
                                            </p>

                                        </div>
                                    </div>

                                    {/* GitHub Stats (for both GitHub and database projects with GitHub link) */}
                                    {(project.source === 'github' || project.language || project.stargazersCount >= 0) && (
                                        <div className="flex gap-3 mt-3 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                                            {project.language && (
                                                <span className="flex items-center gap-1">
                                                    <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                                                    {project.language}
                                                </span>
                                            )}
                                            {project.stargazersCount >= 0 && (
                                                <span className="cursor-default flex items-center justify-center" title="Upvotes">
                                                    <img src={upvoteicon} alt="Upvotes" className="inline w-4 h-4 mr-1" />
                                                    {project.stargazersCount} Upvotes
                                                </span>
                                            )}
                                            {project.forksCount >= 0 && (
                                                <span className="cursor-default flex items-center justify-center" title="Forks">
                                                    <img src={forkicon} alt="Forks" className="inline w-4 h-4 mr-1" />
                                                    {project.forksCount} Forks
                                                </span>
                                            )}
                                            {project.watchersCount >= 0 && (
                                                <span className="cursor-default flex items-center justify-center" title="Watching">
                                                    <img src={eyeicon} alt="Watching" className="inline w-4 h-4 mr-1" />
                                                    {project.watchersCount} Watching
                                                </span>
                                            )}
                                            {project.commitCount >= 0 && (
                                                <span className="cursor-default flex items-center gap-1" title="Total Commits">

                                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M16 12C16 14.2091 14.2091 16 12 16C9.79085 16 7.99999 14.2091 7.99999 12M16 12C16 9.79086 14.2091 8 12 8C9.79085 8 7.99999 9.79086 7.99999 12M16 12H22M7.99999 12H2.00018" stroke="currentColor" strokeWidth="2" stroke-linecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                    {project.commitCount} Commits
                                                </span>
                                            )}

                                        </div>
                                    )}

                                    <div className="flex flex-col md:flex-row p-1 justify-between w-full gap-1">
                                        <div className="w-full md:w-30/100">
                                            {/* Links */}
                                            <div className="mt-3 space-y-1">
                                                <a href={project.githubUrl || project.htmlUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-gray-400 text-sm block hover:underline">
                                                    🔗 View Repository
                                                </a>
                                                {project.homepage && (
                                                    <a href={project.homepage} target="_blank" rel="noopener noreferrer" className="text-indigo-600 text-sm block hover:underline">
                                                        <img src={liveicon} className="inline w-4 h-4 mr-1" alt="" /> View Live
                                                    </a>
                                                )}
                                            </div>

                                            {/* Demo Video (only for database projects) */}
                                            {project.demoVideoUrl && (
                                                <button onClick={() => { setShowvideourl(project.demoVideoUrl) }} className="flex cursor-pointer items-center gap-1 justify-centercursor-pointer mt-1 px-3 py-1 bg-indigo-100 dark:bg-gray-700 dark:text-gray-200 text-indigo-700 text-xs rounded-full">
                                                    <lord-icon
                                                        src="https://cdn.lordicon.com/lyjuidpq.json"
                                                        trigger="morph"
                                                        delay="2000"
                                                        stroke="bold"
                                                        colors="primary:#e83a30,secondary:#e83a30"
                                                        style={{ width: "20px", height: "20px" }}>
                                                    </lord-icon>
                                                    View Demo Video
                                                </button>
                                            )}
                                        </div>
                                        <div className={`${project.topics && project.topics.length > 0 ? "border-black-l md:border-none pl-1 " : ""}w-full md:w-full`}>
                                            {/* Topics/Tags */}
                                            {project.topics && project.topics.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1  ">
                                                    {project.topics.map((topic, i) => (
                                                        <span key={i} className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs rounded">
                                                            {topic}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Languages Display */}
                                            {/* Show detailed language breakdown (always fetched from GitHub) */}
                                            {project.languages && Object.keys(project.languages).length > 0 ? (
                                                <div className="mt-3 ">
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Languages</p>
                                                    {(() => {
                                                        const total = Object.values(project.languages).reduce((a, b) => a + b, 0);
                                                        const languageData = Object.entries(project.languages)
                                                            .map(([name, bytes]) => ({
                                                                name,
                                                                bytes,
                                                                percent: ((bytes / total) * 100).toFixed(1),
                                                            }))
                                                            .sort((a, b) => b.bytes - a.bytes); // Sort by usage

                                                        const languageColors = {
                                                            JavaScript: "#f1e05a",
                                                            TypeScript: "#3178c6",
                                                            Python: "#3572A5",
                                                            Java: "#b07219",
                                                            // HTML: "#e34c26",
                                                            HTML: "#FF6347",
                                                            CSS: "#563d7c",
                                                            C: "#555555",
                                                            "C++": "#f34b7d",
                                                            "C#": "#178600",
                                                            Go: "#00ADD8",
                                                            Rust: "#dea584",
                                                            Ruby: "#701516",
                                                            PHP: "#4F5D95",
                                                            Swift: "#F05138",
                                                            Kotlin: "#A97BFF",
                                                            Dart: "#00B4AB",
                                                            Shell: "#89e051",
                                                            Vue: "#41b883",
                                                            Scala: "#c22d40",
                                                            R: "#198CE7",
                                                        };

                                                        return (
                                                            <>
                                                                {/* Language bar */}
                                                                <div className="w-full h-2 flex rounded overflow-hidden bg-gray-200 dark:bg-gray-700">
                                                                    {languageData.map((lang) => (
                                                                        <div
                                                                            key={lang.name}
                                                                            title={`${lang.name}: ${lang.percent}%`}
                                                                            style={{
                                                                                width: `${lang.percent}%`,
                                                                                backgroundColor: languageColors[lang.name] || "#8b949e",
                                                                            }}
                                                                            className="h-full"
                                                                        />
                                                                    ))}
                                                                </div>

                                                                {/* Language list */}
                                                                <div className="mt-2 flex flex-wrap gap-3 text-xs">
                                                                    {languageData.map((lang) => (
                                                                        <div key={lang.name} className="flex items-center gap-1 text-xs">
                                                                            <span
                                                                                className="w-2 h-2 rounded-full"
                                                                                style={{ backgroundColor: languageColors[lang.name] || "#8b949e" }}
                                                                            ></span>
                                                                            <span className="text-gray-700 dark:text-gray-300 text-xs">{lang.name}</span>
                                                                            <span className="text-gray-500 dark:text-gray-400 text-xs">{lang.percent}%</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>


                                    {/* Priority/Ranking Controls */}
                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-400">
                                        <div className="flex justify-between items-center gap-2">
                                            {project.source === 'github' ? (
                                                <>
                                                    <button
                                                        onClick={() => openEditModal(project)}
                                                        className="text-sm bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-4 py-1 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleHideRepo(project.htmlUrl)}
                                                        className="text-sm bg-indigo-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-4 py-1 rounded-lg hover:bg-indigo-200 dark:hover:bg-yellow-900/50"
                                                    >
                                                        Hide
                                                    </button>
                                                    <a
                                                        href={project.htmlUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                                                    >
                                                        View More
                                                    </a>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => openEditModal(project)}
                                                        className="text-sm bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-4 py-1 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50"
                                                    >
                                                        Edit
                                                    </button>
                                                    {project.githubUrl && (
                                                        <button
                                                            onClick={() => handleHideRepo(project.githubUrl)}
                                                            className="text-sm bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-4 py-1 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/50"
                                                        >
                                                            Hide
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteProject(project._id)}
                                                        className="text-sm bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-1 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50"
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            )}

                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => moveProjectUp(project, 'project')}
                                                className="p-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                                                title="Increase priority"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => moveProjectDown(project, 'project')}
                                                className="p-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                                                title="Decrease priority"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    {/* View More / Actions */}


                                    {/* Source Badge */}
                                    <div className="mt-2 text-xs text-gray-400 dark:text-gray-500 text-center flex items-center justify-between flex-wrap gap-2">
                                        {project.source === 'database' ? 'Custom Project' : 'From GitHub'}
                                        <div className="flex items-center gap-4">
                                            {(project.githubCreatedAt || project.createdAt || project.created_at) && (
                                                <span className="cursor-default flex items-center gap-1 text-xs" title="Created On">
                                                    Created-
                                                    {new Date(project.githubCreatedAt || project.createdAt || project.created_at).toLocaleDateString()}
                                                </span>
                                            )}
                                            {(<span>|</span>)}
                                            {(project.githubUpdatedAt || project.updatedAt || project.updated_at) && (
                                                <span className="cursor-default flex items-center gap-1 text-xs" title="Last Updated">
                                                    {/* <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                                    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                                  </svg> */}
                                                    Last Commit-
                                                    {new Date(project.githubUpdatedAt || project.updatedAt || project.updated_at).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contributions/Collaboration Section */}
                {
                    contributions.length > 0 && (
                        <div className="mt-12 bg-gray-50/50 dark:bg-gray-700 p-6 rounded-xl shadow">
                            <div className="mb-8">
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Collaborations</h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Repositories where you are a collaborator or have been invited
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-8 md:ml-10">
                                {sortedContributions.map((project, index) => (
                                    <div key={project.id || index} className="relative w-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 shadow-md rounded-xl p-2 md:px-4 hover:shadow-lg transition flex items-center justify-center gap-4 ">
                                        {/* Thumbnail or GitHub Icon */}
                                        <div className="w-40 h-36 md:w-56 md:h-56 shadow-lg hover:scale-105 transition-transform duration-300 absolute -top-15 md:top-auto mt-12 md:mt-0 md:-left-10 bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-gray-800 dark:to-gray-700 rounded-lg flex items-center justify-center">
                                            <motion.svg
                                                initial={{ opacity: 0, y: 50 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.6, ease: "easeOut" }}
                                                viewport={{ once: false }}
                                                className="w-16 h-16 text-indigo-600 dark:text-indigo-300"
                                                fill="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <svg className="w-16 h-16 text-indigo-600 dark:text-indigo-300" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                                                </svg>
                                            </motion.svg>
                                        </div>

                                        {/* Project Header */}
                                        <div className="w-full min-h-56 mt-34 md:mt-0 md:ml-50">
                                            <div className="mt-2">
                                                <div className="flex items-start justify-between">
                                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex-1 text-center md:text-left">{project.name}</h3>
                                                    {project.private ? (
                                                        <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                                            Private
                                                        </span>
                                                    ) : (
                                                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                                            Public
                                                        </span>
                                                    )}
                                                    <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                                                        Collaboration
                                                    </span>
                                                </div>

                                                {project.description && <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 line-clamp-2">
                                                    {project.description}
                                                </p>}
                                                <div className="flex items-center mt-2 gap-2">
                                                    {project.owner?.avatarUrl && (
                                                        <img className="size-6 rounded-full" src={project.owner.avatarUrl} alt="" />
                                                    )}
                                                    <p className="text-gray-600 dark:text-gray-400 text-xs line-clamp-2">
                                                        by {project.owner?.login || "N/A"}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* GitHub Stats */}
                                            {(project.language || project.stargazersCount >= 0) && (
                                                <div className="flex gap-3 mt-3 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                                                    {project.language && (
                                                        <span className="flex items-center gap-1">
                                                            <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                                                            {project.language}
                                                        </span>
                                                    )}
                                                    {project.stargazersCount >= 0 && (
                                                        <span className="cursor-default flex items-center justify-center" title="Upvotes">
                                                            <img src={upvoteicon} alt="Upvotes" className="inline w-4 h-4 mr-1" />
                                                            {project.stargazersCount} Upvotes
                                                        </span>
                                                    )}
                                                    {project.forksCount >= 0 && (
                                                        <span className="cursor-default flex items-center justify-center" title="Forks">
                                                            <img src={forkicon} alt="Forks" className="inline w-4 h-4 mr-1" />
                                                            {project.forksCount} Forks
                                                        </span>
                                                    )}
                                                    {project.watchersCount >= 0 && (
                                                        <span className="cursor-default flex items-center justify-center" title="Watching">
                                                            <img src={eyeicon} alt="Watching" className="inline w-4 h-4 mr-1" />
                                                            {project.watchersCount} Watching
                                                        </span>
                                                    )}
                                                    {project.commitCount >= 0 && (
                                                        <span className="cursor-default flex items-center gap-1" title="Total Commits">
                                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M16 12C16 14.2091 14.2091 16 12 16C9.79085 16 7.99999 14.2091 7.99999 12M16 12C16 9.79086 14.2091 8 12 8C9.79085 8 7.99999 9.79086 7.99999 12M16 12H22M7.99999 12H2.00018" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                            {project.commitCount} Commits
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Contributors Section - Prominent Display */}
                                            {project.contributors && project.contributors.length > 0 && (
                                                <div className="flex flex-wrap items-center justify-start  gap-3 rounded-lg py-1">
                                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                                        Other Contributors ({project.contributors.length})
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {project.contributors.slice(0, 10).map((contributor) => (
                                                            <a
                                                                key={contributor.login}
                                                                href={contributor.htmlUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="group relative"
                                                                title={`${contributor.login} - ${contributor.contributions} contributions`}
                                                            >
                                                                <div className="flex flex-col items-center gap-1 px-2">
                                                                    <img
                                                                        src={contributor.avatarUrl}
                                                                        alt={contributor.login}
                                                                        className="size-6 rounded-full transition-all"
                                                                    />
                                                                    <span className="text-xs text-gray-600 dark:text-gray-400 max-w-[40px] truncate">{contributor.login}</span>
                                                                </div>
                                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                                                    {contributor.login}
                                                                    <br />
                                                                    <span className="text-gray-300">{contributor.contributions} commits</span>
                                                                </div>
                                                            </a>
                                                        ))}
                                                        {project.contributors.length > 10 && (
                                                            <div className="flex flex-col items-center gap-1">
                                                                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300">
                                                                    +{project.contributors.length - 10}
                                                                </div>
                                                                <span className="text-xs text-gray-600 dark:text-gray-400">more</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex flex-col md:flex-row p-1 justify-between w-full gap-1">
                                                <div className="w-full md:w-30/100">
                                                    {/* Links */}
                                                    <div className="mt-1 space-y-1">
                                                        <a href={project.htmlUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-gray-400 text-sm block hover:underline">
                                                            🔗 View Repository
                                                        </a>
                                                        {project.homepage && (
                                                            <a href={project.homepage} target="_blank" rel="noopener noreferrer" className="text-indigo-600 text-sm block hover:underline">
                                                                <img src={liveicon} className="inline w-4 h-4 mr-1" alt="" /> View Live
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className={`${project.topics && project.topics.length > 0 ? "border-black-l md:border-none pl-1 " : ""}w-full md:w-full`}>
                                                    {/* Topics/Tags */}
                                                    {project.topics && project.topics.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {project.topics.map((topic, i) => (
                                                                <span key={i} className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs rounded">
                                                                    {topic}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Languages Display */}
                                                    {project.languages && Object.keys(project.languages).length > 0 ? (
                                                        <div className="mt-1 ">
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">Languages</p>
                                                            {(() => {
                                                                const total = Object.values(project.languages).reduce((a, b) => a + b, 0);
                                                                const languageData = Object.entries(project.languages)
                                                                    .map(([name, bytes]) => ({
                                                                        name,
                                                                        bytes,
                                                                        percent: ((bytes / total) * 100).toFixed(1),
                                                                    }))
                                                                    .sort((a, b) => b.bytes - a.bytes);

                                                                const languageColors = {
                                                                    JavaScript: "#f1e05a",
                                                                    TypeScript: "#3178c6",
                                                                    Python: "#3572A5",
                                                                    Java: "#b07219",
                                                                    HTML: "#FF6347",
                                                                    CSS: "#563d7c",
                                                                    C: "#555555",
                                                                    "C++": "#f34b7d",
                                                                    "C#": "#178600",
                                                                    Go: "#00ADD8",
                                                                    Rust: "#dea584",
                                                                    Ruby: "#701516",
                                                                    PHP: "#4F5D95",
                                                                    Swift: "#F05138",
                                                                    Kotlin: "#A97BFF",
                                                                    Dart: "#00B4AB",
                                                                    Shell: "#89e051",
                                                                    Vue: "#41b883",
                                                                    Scala: "#c22d40",
                                                                    R: "#198CE7",
                                                                };

                                                                return (
                                                                    <>
                                                                        {/* Language bar */}
                                                                        <div className="w-full h-2 flex rounded overflow-hidden bg-gray-200 dark:bg-gray-700">
                                                                            {languageData.map((lang) => (
                                                                                <div
                                                                                    key={lang.name}
                                                                                    title={`${lang.name}: ${lang.percent}%`}
                                                                                    style={{
                                                                                        width: `${lang.percent}%`,
                                                                                        backgroundColor: languageColors[lang.name] || "#8b949e",
                                                                                    }}
                                                                                    className="h-full"
                                                                                />
                                                                            ))}
                                                                        </div>

                                                                        {/* Language list */}
                                                                        <div className="mt-2 flex flex-wrap gap-3 text-xs">
                                                                            {languageData.map((lang) => (
                                                                                <div key={lang.name} className="flex items-center gap-1 text-xs">
                                                                                    <span
                                                                                        className="w-2 h-2 rounded-full"
                                                                                        style={{ backgroundColor: languageColors[lang.name] || "#8b949e" }}
                                                                                    ></span>
                                                                                    <span className="text-gray-700 dark:text-gray-300 text-xs">{lang.name}</span>
                                                                                    <span className="text-gray-500 dark:text-gray-400 text-xs">{lang.percent}%</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </>
                                                                );
                                                            })()}
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>

                                            {/* Priority/Ranking Controls */}
                                            <div className="flex items-center justify-between  mt-3 pt-3 border-t border-indigo-200 dark:border-gray-700">
                                                <div className="flex items-center gap-4">
                                                    {(project.createdAt || project.created_at) && (
                                                        <span className="cursor-default flex items-center gap-1 text-xs dark:text-gray-400" title="Created On">
                                                            Created-
                                                            {new Date(project.createdAt || project.created_at).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                    {(project.createdAt || project.created_at) && (project.updatedAt || project.updated_at) && (<span>|</span>)}
                                                    {(project.updatedAt || project.updated_at) && (
                                                        <span className="cursor-default flex items-center gap-1 text-xs dark:text-gray-400" title="Last Updated">
                                                            Last Commit-
                                                            {new Date(project.updatedAt || project.updated_at).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <a
                                                        href={project.htmlUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                                                    >
                                                        View More
                                                    </a>
                                                    <button
                                                        onClick={() => moveProjectUp(project, 'contribution')}
                                                        className="relative cursor-pointer group p-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800/50 transition"

                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                        </svg>
                                                        <div className='absolute top-5 bg-black text-xs text-white px-2 py-1 rounded group-hover:block hidden'>Increase priority</div>
                                                    </button>
                                                    <button
                                                        onClick={() => moveProjectDown(project, 'contribution')}
                                                        className="relative cursor-pointer group p-1 z-20 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800/50 transition"
                                                        title="Decrease priority"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                        <div className='absolute top-5 z-20 bg-black text-xs text-white px-2 py-1 rounded group-hover:block hidden'>Decrease priority</div>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* View More / Actions */}
                                            {/* <div className="flex justify-between items-center mt-5 pt-4 border-t gap-2">
                                            
                                        </div> */}

                                            {/* Source Badge */}
                                            {/* <div className="mt-2 text-xs text-gray-400 dark:text-gray-500 text-center flex items-center justify-between flex-wrap gap-2">
                                            Collaboration Repository
                                            
                                        </div> */}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>)
                }
                {
                    hiddenRepos.length > 0 && <div className="mt-12 bg-gray-50/50 dark:bg-gray-700 p-6 rounded-xl shadow">
                        <div className="">
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Hidden Repositories</h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Repositories which you have chosen to hide from your profile ({hiddenRepos.length})
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-8 md:ml-10">
                            {hiddenRepos.map((repoUrl, index) => {
                                // Find the repo details from githubRepos
                                const repo = githubRepos.find(r => r.htmlUrl === repoUrl);

                                // If repo not found in githubRepos, create a minimal object
                                const project = repo || {
                                    name: repoUrl.split('/').pop(),
                                    htmlUrl: repoUrl,
                                    description: "Repository details not available",
                                    owner: { login: "N/A", avatarUrl: null }
                                };

                                return (
                                    <div key={index} className="relative w-full bg-gray-100 dark:bg-gray-800 shadow-md rounded-xl p-2 md:p-4 hover:shadow-lg transition flex items-center justify-center gap-4 opacity-75">
                                        {/* Thumbnail or GitHub Icon */}
                                        <div className="w-40 h-36 md:w-56 md:h-56 shadow-lg hover:scale-105 transition-transform duration-300 absolute -top-15 md:top-auto mt-12 md:mt-0 md:-left-10 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 rounded-lg flex items-center justify-center">
                                            <motion.svg
                                                initial={{ opacity: 0, y: 50 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.6, ease: "easeOut" }}
                                                viewport={{ once: false }}
                                                className="w-16 h-16 text-gray-600 dark:text-gray-400"
                                                fill="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <svg className="w-16 h-16 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                                                </svg>
                                            </motion.svg>
                                        </div>

                                        {/* Project Header */}
                                        <div className="w-full min-h-56 mt-34 md:mt-0 md:ml-50">
                                            <div className="mt-4">
                                                <div className="flex items-start justify-between">
                                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex-1 text-center md:text-left">{project.name}</h3>
                                                    {project.private !== undefined && project.private && (
                                                        <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                                            Private
                                                        </span>
                                                    )}
                                                    {project.private !== undefined && !project.private && (
                                                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                                            Public
                                                        </span>
                                                    )}
                                                    <span className="ml-2 px-2 py-1 bg-red-200  text-gray-700 dark:text-red-500 text-xs rounded-full">
                                                        Hidden
                                                    </span>
                                                </div>

                                                {project.description && <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 line-clamp-2">
                                                    {project.description}
                                                </p>}
                                                <div className="flex items-center mt-2 gap-2">
                                                    {project.owner?.avatarUrl && (
                                                        <img className="size-6 rounded-full" src={project.owner.avatarUrl} alt="" />
                                                    )}
                                                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                                                        by {project.owner?.login || "N/A"}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* GitHub Stats */}
                                            {(project.language || project.stargazersCount >= 0) && (
                                                <div className="flex gap-3 mt-3 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                                                    {project.language && (
                                                        <span className="flex items-center gap-1">
                                                            <span className="w-3 h-3 rounded-full bg-gray-500"></span>
                                                            {project.language}
                                                        </span>
                                                    )}
                                                    {project.stargazersCount >= 0 && (
                                                        <span className="cursor-default flex items-center justify-center" title="Upvotes">
                                                            <img src={upvoteicon} alt="Upvotes" className="inline w-4 h-4 mr-1" />
                                                            {project.stargazersCount} Upvotes
                                                        </span>
                                                    )}
                                                    {project.forksCount >= 0 && (
                                                        <span className="cursor-default flex items-center justify-center" title="Forks">
                                                            <img src={forkicon} alt="Forks" className="inline w-4 h-4 mr-1" />
                                                            {project.forksCount} Forks
                                                        </span>
                                                    )}
                                                    {project.watchersCount >= 0 && (
                                                        <span className="cursor-default flex items-center justify-center" title="Watching">
                                                            <img src={eyeicon} alt="Watching" className="inline w-4 h-4 mr-1" />
                                                            {project.watchersCount} Watching
                                                        </span>
                                                    )}
                                                    {project.commitCount >= 0 && (
                                                        <span className="cursor-default flex items-center gap-1" title="Total Commits">
                                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M16 12C16 14.2091 14.2091 16 12 16C9.79085 16 7.99999 14.2091 7.99999 12M16 12C16 9.79086 14.2091 8 12 8C9.79085 8 7.99999 9.79086 7.99999 12M16 12H22M7.99999 12H2.00018" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                            {project.commitCount} Commits
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex flex-col md:flex-row p-1 justify-between w-full gap-1">
                                                <div className="w-full md:w-30/100">
                                                    {/* Links */}
                                                    <div className="mt-3 space-y-1">
                                                        <a href={project.htmlUrl} target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400  text-sm block hover:underline">
                                                            🔗 View Repository
                                                        </a>
                                                        {project.homepage && (
                                                            <a href={project.homepage} target="_blank" rel="noopener noreferrer" className="text-gray-600 text-sm block hover:underline">
                                                                <img src={liveicon} className="inline w-4 h-4 mr-1" alt="" /> View Live
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className={`${project.topics && project.topics.length > 0 ? "border-black-l md:border-none pl-1 " : ""}w-full md:w-full`}>
                                                    {/* Topics/Tags */}
                                                    {project.topics && project.topics.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-3 bg-red-200 dark:bg-red-900/20 ">
                                                            {project.topics.map((topic, i) => (
                                                                <span key={i} className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-gray-700 dark:text-gray-300 text-xs rounded">
                                                                    {topic}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Languages Display */}
                                                    {project.languages && Object.keys(project.languages).length > 0 ? (
                                                        <div className="mt-3 ">
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">Languages</p>
                                                            {(() => {
                                                                const total = Object.values(project.languages).reduce((a, b) => a + b, 0);
                                                                const languageData = Object.entries(project.languages)
                                                                    .map(([name, bytes]) => ({
                                                                        name,
                                                                        bytes,
                                                                        percent: ((bytes / total) * 100).toFixed(1),
                                                                    }))
                                                                    .sort((a, b) => b.bytes - a.bytes);

                                                                return (
                                                                    <>
                                                                        {/* Language bar */}
                                                                        <div className="w-full h-2 flex rounded overflow-hidden bg-gray-200 dark:bg-gray-700">
                                                                            {languageData.map((lang) => (
                                                                                <div
                                                                                    key={lang.name}
                                                                                    title={`${lang.name}: ${lang.percent}%`}
                                                                                    style={{
                                                                                        width: `${lang.percent}%`,

                                                                                    }}
                                                                                    className="h-full bg-gray-700"
                                                                                />
                                                                            ))}
                                                                        </div>

                                                                        {/* Language list */}
                                                                        <div className="mt-2 flex flex-wrap gap-3 text-xs">
                                                                            {languageData.map((lang) => (
                                                                                <div key={lang.name} className="flex items-center gap-1 text-xs">
                                                                                    <span
                                                                                        className="w-2 h-2 rounded-full bg-gray-600"

                                                                                    ></span>
                                                                                    <span className="text-gray-700 dark:text-gray-300 text-xs">{lang.name}</span>
                                                                                    <span className="text-gray-500 dark:text-gray-400 text-xs">{lang.percent}%</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </>
                                                                );
                                                            })()}
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>

                                            {/* View More / Actions */}
                                            <div className="flex justify-between items-center mt-2 pt-4 border-t border-gray-600 gap-2">
                                                <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400 text-xs">
                                                    {(project.createdAt || project.created_at) && (
                                                        <span className="cursor-default flex items-center gap-1 text-xs" title="Created On">
                                                            Created-
                                                            {new Date(project.createdAt || project.created_at).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                    {(project.createdAt || project.created_at) && (project.updatedAt || project.updated_at) && (<span>|</span>)}
                                                    {(project.updatedAt || project.updated_at) && (
                                                        <span className="cursor-default flex items-center gap-1 text-xs" title="Last Updated">
                                                            Last Commit-
                                                            {new Date(project.updatedAt || project.updated_at).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs">
                                                    <button
                                                        onClick={() => handleUnhideRepo(repoUrl)}
                                                        className="cursor-pointer hover:bg-green-500 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-4 py-1 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50"
                                                    >
                                                        Unhide
                                                    </button>
                                                    <a
                                                        href={project.htmlUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className=" bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                                                    >
                                                        View More
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                    </div>
                }
            </div>

            {/* Add Project Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl px-8 py-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Upload Progress Overlay */}
                        {loading && (
                            <div className="absolute inset-0 bg-black/70 dark:bg-black/80 z-50 flex items-center justify-center rounded-2xl">
                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                                    <div className="text-center">
                                        <div className="mb-6">
                                            <svg className="w-20 h-20 mx-auto text-indigo-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Uploading Project</h3>
                                        <p className="text-gray-600 dark:text-gray-300 mb-6">Please wait while we upload your files...</p>

                                        <div className="relative w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
                                            <div
                                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300 ease-out rounded-full"
                                                style={{ width: `${uploadProgress}%` }}
                                            >
                                                <div className="absolute inset-0 bg-white dark:bg-gray-300 opacity-20 animate-pulse"></div>
                                            </div>
                                        </div>

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

                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Project</h2>
                            <button
                                onClick={closeModals}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className='grid grid-cols-1 md:grid-cols-2  gap-2 items-center justify-between'>
                                {/* Project Name */}
                                <div className="w-full">
                                    <label className="text-gray-700 dark:text-gray-300 font-medium block mb-1">Project Name</label>
                                    <input
                                        value={formData.projectName}
                                        type="text"
                                        name="projectName"
                                        placeholder="Enter the project title"
                                        onChange={handleChange}
                                        required
                                        className="text-gray-600 dark:text-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 w-full border rounded-lg p-2 focus:border-indigo-500 dark:focus:border-indigo-400"
                                    />
                                </div>

                                {/* GitHub Link */}
                                <div className="w-full">
                                    <label className="text-gray-700 dark:text-gray-300 font-medium block mb-1">GitHub Repository Link</label>
                                    <div className="flex gap-2">
                                        <input
                                            value={formData.githubLink}
                                            type="url"
                                            name="githubLink"
                                            placeholder="https://github.com/username/repo"
                                            onChange={handleChange}
                                            className="text-gray-600 dark:text-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 w-full border rounded-lg p-2 focus:border-indigo-500 dark:focus:border-indigo-400"
                                        />
                                        <button
                                            onClick={handleFetch}
                                            type="button"
                                            disabled={fetching}
                                            className="bg-indigo-600 text-white px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 whitespace-nowrap"
                                        >
                                            {fetching ? 'Fetching...' : 'Fetch'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="text-gray-700 dark:text-gray-300 font-medium block mb-1">Short Description</label>
                                <textarea
                                    value={formData.description || ""}
                                    name="description"
                                    rows="2"
                                    placeholder="A short description about your project..."
                                    onChange={handleChange}
                                    className="text-gray-600 dark:text-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 w-full border rounded-lg p-3 focus:border-indigo-500 dark:focus:border-indigo-400"
                                />
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-2  gap-2 items-center justify-between'>
                                {/* Tags */}
                                <div>
                                    <label className="text-gray-700 dark:text-gray-300 font-medium block mb-1">Tech Stack / Tags</label>
                                    <input
                                        value={formData.tags}
                                        type="text"
                                        name="tags"
                                        placeholder="Fetched automatically"
                                        onChange={handleChange}
                                        disabled
                                        className="text-gray-600 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700 w-full border rounded-lg p-2 bg-gray-100 cursor-not-allowed"
                                    />
                                </div>

                                {/* Live Demo */}
                                <div>
                                    <label className="text-gray-700 dark:text-gray-300 font-medium block mb-1">Live Demo Link (optional)</label>
                                    <input
                                        value={formData.liveDemo}
                                        type="url"
                                        name="liveDemo"
                                        placeholder="https://your-deployment-link.com"
                                        onChange={handleChange}
                                        className="text-gray-600 dark:text-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 w-full border rounded-lg p-2 focus:border-indigo-500 dark:focus:border-indigo-400"
                                    />
                                </div>
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-2 items-center justify-between'>
                                {/* Demo Video */}
                                <div>
                                    <label className="text-gray-700 dark:text-gray-300 font-medium block mb-1">Upload Demo Video (Optional)</label>
                                    <input
                                        type="file"
                                        name="demoVideo"
                                        accept="video/*"
                                        onChange={handleChange}
                                        className="text-gray-600 dark:text-gray-200 dark:bg-gray-700 dark:border-gray-600 w-full border rounded-lg p-2 bg-gray-50 dark:bg-gray-700"
                                    />
                                </div>

                                {/* Thumbnail */}
                                <div>
                                    <label className="text-gray-700 dark:text-gray-300 font-medium block mb-1">Thumbnail / Cover Image (Optional)</label>
                                    <input
                                        type="file"
                                        name="thumbnail"
                                        accept="image/*"
                                        onChange={handleChange}
                                        className="text-gray-600 dark:text-gray-200 dark:bg-gray-700 dark:border-gray-600 w-full border rounded-lg p-2 bg-gray-50 dark:bg-gray-700"
                                    />
                                </div>
                            </div>
                            {/* Buttons */}
                            <div className="flex gap-3 justify-end pt-4">
                                <button
                                    type="button"
                                    onClick={closeModals}
                                    className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
                                >
                                    {loading ? 'Uploading...' : 'Save Project'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Project Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Upload Progress Overlay */}
                        {loading && (
                            <div className="absolute inset-0 bg-black/70 dark:bg-black/80 z-50 flex items-center justify-center rounded-2xl">
                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                                    <div className="text-center">
                                        <div className="mb-6">
                                            <svg className="w-20 h-20 mx-auto text-indigo-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Updating Project</h3>
                                        <p className="text-gray-600 dark:text-gray-300 mb-6">Please wait while we update your project...</p>

                                        <div className="relative w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
                                            <div
                                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300 ease-out rounded-full"
                                                style={{ width: `${uploadProgress}%` }}
                                            >
                                                <div className="absolute inset-0 bg-white dark:bg-gray-300 opacity-20 animate-pulse"></div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-center gap-2">
                                            <span className="text-4xl font-bold text-indigo-600">{uploadProgress}%</span>
                                            <div className="flex gap-1">
                                                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                            </div>
                                        </div>

                                        {uploadProgress === 100 && (
                                            <p className="text-sm text-green-600 mt-4 font-medium animate-pulse">Processing on server...</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Project</h2>
                                {editingProject && (
                                    <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
                                        Editing: <span className="font-medium">{editingProject.displayName || editingProject.projectName}</span>
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={closeModals}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-2 items-center justify-between'>
                                {/* Project Name */}
                                <div>
                                    <label className="text-gray-700 dark:text-gray-300 font-medium block mb-1">Project Name</label>
                                    <input
                                        value={formData.projectName}
                                        type="text"
                                        name="projectName"
                                        placeholder="Enter the project title"
                                        onChange={handleChange}
                                        required
                                        className="text-gray-600 dark:text-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 w-full border rounded-lg p-2 focus:border-indigo-500 dark:focus:border-indigo-400"
                                    />
                                </div>

                                {/* GitHub Link */}
                                <div>
                                    <label className="text-gray-700 dark:text-gray-300 font-medium block mb-1">GitHub Repository Link</label>
                                    <div className="flex gap-2">
                                        <input
                                            value={formData.githubLink}
                                            type="url"
                                            name="githubLink"
                                            placeholder="https://github.com/username/repo"
                                            onChange={handleChange}
                                            className="text-gray-600 dark:text-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 w-full border rounded-lg p-2 focus:border-indigo-500 dark:focus:border-indigo-400"
                                        />
                                        <button
                                            onClick={handleFetch}
                                            type="button"
                                            disabled={fetching}
                                            className="bg-indigo-600 text-white px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 whitespace-nowrap"
                                        >
                                            {fetching ? 'Fetching...' : 'Fetch'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="text-gray-700 dark:text-gray-300 font-medium block mb-1">Short Description</label>
                                <textarea
                                    value={formData.description || ""}
                                    name="description"
                                    rows="3"
                                    placeholder="A short description about your project..."
                                    onChange={handleChange}
                                    className="text-gray-600 dark:text-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 w-full border rounded-lg p-3 focus:border-indigo-500 dark:focus:border-indigo-400"
                                />
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-2 items-center justify-between'>
                                {/* Tags */}
                                <div>
                                    <label className="text-gray-700 dark:text-gray-300 font-medium block mb-1">Tech Stack / Tags</label>
                                    <input
                                        value={formData.tags}
                                        type="text"
                                        name="tags"
                                        placeholder="Fetched automatically"
                                        onChange={handleChange}
                                        disabled
                                        className="text-gray-600 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700 w-full border rounded-lg p-2 bg-gray-100 cursor-not-allowed"
                                    />
                                </div>

                                {/* Live Demo */}
                                <div>
                                    <label className="text-gray-700 dark:text-gray-300 font-medium block mb-1">Live Demo Link (optional)</label>
                                    <input
                                        value={formData.liveDemo}
                                        type="url"
                                        name="liveDemo"
                                        placeholder="https://your-deployment-link.com"
                                        onChange={handleChange}
                                        className="text-gray-600 dark:text-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 w-full border rounded-lg p-2 focus:border-indigo-500 dark:focus:border-indigo-400"
                                    />
                                </div>
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-2 items-center justify-between'>
                                {/* Demo Video */}
                                <div>
                                    <label className="text-gray-700 dark:text-gray-300 font-medium block mb-1">Upload Demo Video (Optional)</label>
                                    <input
                                        type="file"
                                        name="demoVideo"
                                        accept="video/*"
                                        onChange={handleChange}
                                        className="text-gray-600 dark:text-gray-200 dark:bg-gray-700 dark:border-gray-600 w-full border rounded-lg p-2 bg-gray-50 dark:bg-gray-700"
                                    />
                                    {editingProject?.demoVideoUrl && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Current video will be replaced if new file is uploaded</p>
                                    )}
                                </div>

                                {/* Thumbnail */}
                                <div>
                                    <label className="text-gray-700 dark:text-gray-300 font-medium block mb-1">Thumbnail / Cover Image (Optional)</label>
                                    <input
                                        type="file"
                                        name="thumbnail"
                                        accept="image/*"
                                        onChange={handleChange}
                                        className="text-gray-600 dark:text-gray-200 dark:bg-gray-700 dark:border-gray-600 w-full border rounded-lg p-2 bg-gray-50 dark:bg-gray-700"
                                    />
                                    {editingProject?.thumbnailUrl && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Current thumbnail will be replaced if new file is uploaded</p>
                                    )}
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 justify-end pt-4">
                                <button
                                    type="button"
                                    onClick={closeModals}
                                    className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
                                >
                                    {loading ? 'Updating...' : 'Update Project'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Video Modal Overlay */}
            {showvideourl !== "" && (
                <div 
                    className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowvideourl("")}
                >
                    <div 
                        className="relative w-full max-w-5xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button 
                            className="absolute -top-10 right-0 cursor-pointer font-bold text-white hover:text-gray-300 transition-colors"
                            onClick={() => setShowvideourl("")}
                        >
                            <X size={34} />
                        </button>
                        <video 
                            src={showvideourl} 
                            controls 
                            autoPlay
                            className="w-full rounded-xl shadow-2xl"
                        />
                    </div>
                </div>
            )}

        </div>
    )
}

export default ViewProjects
