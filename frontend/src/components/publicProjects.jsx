import React, { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { ToastContainer, toast } from 'react-toastify';
import upvoteicon from "../assets/upvote.svg";
import forkicon from "../assets/fork.svg";
import eyeicon from "../assets/eye.svg";
import liveicon from "../assets/live.svg";
import { motion } from "framer-motion";
export default function publicProjects({ username, t_userd, set_t_userd, contributions, setContributions }) {
    const { isDark } = useTheme();
    const [user, setUser] = useState(null)
    const [showenter, setShowenter] = useState(false)
    const [fetching, setFetching] = useState(false)
    const [hiddenRepos, setHiddenRepos] = useState([]); // Store hidden repo URLs
    const [showvideourl, setShowvideourl] = useState("");
    const [projects, setProjects] = useState([]);
    const [githubRepos, setGithubRepos] = useState([]);
    const [loadingRepos, setLoadingRepos] = useState(false);
    const [mergedProjects, setMergedProjects] = useState([]);
    const [sortBy, setSortBy] = useState('priority'); // Sort option state (default to priority)
    const [user_d, setUser_d] = useState([]);

    useEffect(() => {
        const fetchUser = async () => {
            const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
            try {
                console.log("Fetching user data for username:", username);
                let res = await fetch(`${SERVER_URL}/api/user_from_username`, {
                    headers: {
                        "x-user-name": username,
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    // console.log("User data fetched successfully:", data);
                    // console.log("Project Rankings (raw):", data.projectRankings);
                    // console.log("Project Rankings keys:", data.projectRankings ? Object.keys(data.projectRankings) : 'none');
                    // console.log("Contribution Rankings:", data.contributionRankings);
                    setUser(data);
                    setUser_d(data);
                } else {
                    console.error("Failed to fetch user:", res.status, res.statusText);
                }
            } catch (err) {
                console.error("Error fetching username:", username, err);
            }
        };

        if (username) {
            fetchUser();
        }
    }, [username]);

    // Helper function to sort contributions based on current sortBy and user rankings
    const sortContributionsData = (contributionsData) => {
        if (!contributionsData || contributionsData.length === 0) return contributionsData;
        if (sortBy === 'priority' && !user) return contributionsData;

        return [...contributionsData].sort((a, b) => {
            const projectIdA = a.htmlUrl || a.id;
            const projectIdB = b.htmlUrl || b.id;
            const rankA = user?.contributionRankings?.[projectIdA];
            const rankB = user?.contributionRankings?.[projectIdB];

            if (sortBy === 'priority') {
                if (rankA !== undefined && rankB !== undefined) return rankA - rankB;
                if (rankA !== undefined) return -1;
                if (rankB !== undefined) return 1;
                return 0;
            }

            let primarySort = 0;
            switch (sortBy) {
                case 'createdAt':
                    primarySort = new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0);
                    break;
                case 'updatedAt':
                    primarySort = new Date(b.updatedAt || b.updated_at || 0) - new Date(a.updatedAt || a.updated_at || 0);
                    break;
                case 'name':
                    primarySort = (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase());
                    break;
                case 'public':
                    primarySort = (b.private ? 0 : 1) - (a.private ? 0 : 1);
                    break;
                case 'deployment':
                    primarySort = (!!b.homepage ? 1 : 0) - (!!a.homepage ? 1 : 0);
                    break;
            }

            if (primarySort === 0) {
                if (rankA !== undefined && rankB !== undefined) return rankA - rankB;
                if (rankA !== undefined) return -1;
                if (rankB !== undefined) return 1;
            }

            return primarySort;
        });
    };

    useEffect(() => {
        if (user) {
            fetchProjects();
            fetchHiddenRepos();
            fetchContributions();
        }
    }, [sortBy, user]);

    const fetchHiddenRepos = async () => {
        if (!user) {
            return;
        }
        try {
            const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
            const response = await fetch(`${SERVER_URL}/api/users/hiddenRepos_from_username`, {
                headers: {
                    "x-user-name": username,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setHiddenRepos(data.hiddenRepos || []);
            } else {
                console.error("Failed to fetch hidden repos");
                setHiddenRepos([]);
            }
        } catch (err) {
            console.error("Error fetching hidden repos:", err);
            setHiddenRepos([]);
        }
    };

    const fetchContributions = async () => {
        setFetching(true);
        if (!user) {
            setFetching(false);
            return;
        }
        try {
            const SERVER_URL = import.meta.env.VITE_SERVER_URL
            const res = await fetch(`${SERVER_URL}/api/github/contributions_from_username`, {
                method: "GET",
                headers: {
                    "x-user-name": username,
                },
            });
            if (res.ok) {
                const data = await res.json();
                console.log("Fetched contributions data:", data);
                const sortedData = sortContributionsData(data.repos || []);
                console.log("Setting sorted contributions to:", sortedData);
                setContributions(sortedData);
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
    const fetchProjects = async () => {
        if (!user) {
            console.log("User not found, skipping fetchProjects");
            return;
        }

        console.log("Fetching projects for user:", user.username || user.name);

        try {
            const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

            // Fetch database projects (manually added projects)
            console.log("Fetching database projects with username:", username);
            const projectsResponse = await fetch(`${SERVER_URL}/api/projects/from_username?sortBy=${sortBy}`, {
                headers: {
                    "x-user-name": username,
                },
            });

            if (projectsResponse.ok) {
                const projectsData = await projectsResponse.json();
                setProjects(projectsData);
                console.log("Fetched database projects:", projectsData.length, "projects");
            } else {
                console.error("Failed to fetch projects:", projectsResponse.status);
            }

            // Always fetch GitHub repositories - backend will handle permissions
            setLoadingRepos(true);
            console.log("Fetching GitHub repos with username:", username);
            const githubResponse = await fetch(`${SERVER_URL}/api/github/userRepos_from_username`, {
                method: "GET",
                headers: {
                    "x-user-name": username,
                },
            });

            if (githubResponse.ok) {
                const githubData = await githubResponse.json();
                setGithubRepos(githubData.repos || []);
                console.log("Fetched GitHub repos:", githubData.repos?.length || 0, "repos");
            } else {
                const error = await githubResponse.json();
                console.error("Failed to fetch GitHub repos:", error.message);
                // Silently fail - user might not have GitHub integration enabled
                setGithubRepos([]);
            }
            setLoadingRepos(false);

        } catch (error) {
            console.error("Fetch error:", error);
            setLoadingRepos(false);
        }
    };

    // Aggregate languages and send stats to parent
    useEffect(() => {
        if (mergedProjects.length === 0 || !user) return;

        // Aggregate all languages from merged projects
        const languageMap = {};
        let totalCommits = 0;

        mergedProjects.forEach(project => {
            // Aggregate language bytes
            if (project.languages && typeof project.languages === 'object') {
                Object.entries(project.languages).forEach(([lang, bytes]) => {
                    if (languageMap[lang]) {
                        languageMap[lang] += bytes;
                    } else {
                        languageMap[lang] = bytes;
                    }
                });
            }

            // Sum up commits
            if (project.commitCount) {
                totalCommits += project.commitCount;
            }
        });

        // Sort languages by usage (most to least)
        const sortedLanguages = Object.entries(languageMap)
            .map(([name, bytes]) => ({ name, bytes }))
            .sort((a, b) => b.bytes - a.bytes);

        // Prepare data object to send to parent
        const aggregatedData = {
            userObject: user,
            languages: sortedLanguages,
            totalRepos: mergedProjects.length,
            totalCommits: totalCommits
        };

        // Send to parent component
        if (set_t_userd) {
            set_t_userd(aggregatedData);
            console.log("Sending aggregated data to parent:", aggregatedData);
        }
    }, [mergedProjects, user, set_t_userd]);

    // Merge GitHub repos with database projects
    useEffect(() => {
        if (projects.length === 0 && githubRepos.length === 0) {
            setMergedProjects([]);
            return;
        }

        // If we're supposed to sort by priority but user data isn't loaded yet, wait
        if (sortBy === 'priority' && !user) {
            console.log('Waiting for user data before sorting by priority...');
            return;
        }

        const merged = [];
        const processedGithubUrls = new Set();

        // First, process database projects and merge with GitHub data
        projects.forEach(dbProject => {
            const normalizedUrl = dbProject.githubUrl?.toLowerCase().replace(/\.git$/, '');
            if (normalizedUrl) {
                processedGithubUrls.add(normalizedUrl);
            }

            // Check if this database project's GitHub URL is hidden
            const isHidden = hiddenRepos.some(hiddenUrl =>
                hiddenUrl.toLowerCase() === normalizedUrl
            );

            // Skip if hidden
            if (isHidden) {
                return;
            }

            // Find matching GitHub repo to get live stats
            const matchingGithubRepo = githubRepos.find(repo =>
                repo.htmlUrl?.toLowerCase() === normalizedUrl
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
                // Extract owner from GitHub URL (e.g., https://github.com/owner/repo)
                let repoOwner = null;
                let ownerAvatarUrl = null;
                if (dbProject.githubUrl) {
                    const match = dbProject.githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
                    repoOwner = match ? match[1] : null;
                    // Construct GitHub avatar URL from username
                    if (repoOwner) {
                        ownerAvatarUrl = `https://github.com/${repoOwner}.png`;
                    }
                }

                merged.push({
                    ...dbProject,
                    source: 'database',
                    displayName: dbProject.projectName,
                    displayDescription: dbProject.shortDescription,
                    owner: repoOwner || user?.name || "N/A", // Use repo owner from URL, fallback to user name
                    ownerurl: ownerAvatarUrl || user?.profileImage || null,
                    homepage: dbProject.liveDemoUrl, // Map liveDemoUrl to homepage for display
                });
            }
        });

        // Then add GitHub repos that aren't in database and aren't hidden
        console.log("from github", githubRepos);
        githubRepos.forEach(repo => {
            const normalizedRepoUrl = repo.htmlUrl?.toLowerCase();

            // Skip if already in database or is hidden
            if (!processedGithubUrls.has(normalizedRepoUrl) && !hiddenRepos.includes(repo.htmlUrl)) {
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
            }
        });

        // Apply sorting to merged projects
        const sortedMerged = [...merged].sort((a, b) => {
            // Get project IDs for ranking
            const projectIdA = a.htmlUrl || a.githubUrl || a._id || a.id;
            const projectIdB = b.htmlUrl || b.githubUrl || b._id || b.id;
            const rankA = user?.projectRankings?.[projectIdA];
            const rankB = user?.projectRankings?.[projectIdB];

            // Only log first iteration for debugging
            if (a === merged[0] && b === merged[1]) {
                console.log('Available ranking keys:', user?.projectRankings ? Object.keys(user.projectRankings) : 'none');
                console.log('Sample project URL being checked:', projectIdA);
                console.log('Does it have a rank?', rankA !== undefined ? `Yes: ${rankA}` : 'No');
            }

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

        // console.log('Merged projects sorted. Total projects:', sortedMerged.length);
        // console.log('User rankings available:', user?.projectRankings ? Object.keys(user.projectRankings).length : 0);
        // console.log('Sort mode:', sortBy);
        // console.log('First 3 projects after sort:', sortedMerged.slice(0, 3).map(p => ({
        //     name: p.displayName || p.name,
        //     url: p.htmlUrl || p.githubUrl,
        //     rank: user?.projectRankings?.[p.htmlUrl || p.githubUrl]
        // })));
        setMergedProjects(sortedMerged);
    }, [projects, githubRepos, hiddenRepos, sortBy, user]);

    // Re-sort contributions when sortBy or user changes (without refetching)
    useEffect(() => {
        if (!contributions || contributions.length === 0) return;
        if (sortBy === 'priority' && !user) return;

        const sortedContributions = sortContributionsData(contributions);
        // Only update if the sort order actually changed
        if (JSON.stringify(sortedContributions) !== JSON.stringify(contributions)) {
            setContributions(sortedContributions);
        }
    }, [sortBy, user]);


    return (
        <div className="dark:bg-gray-700 rounded-xl p-5 w-full">
            <div className="relative flex">
                {/* My Projects Area */}
                <div className="flex-1 ">

                        {loadingRepos && Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="relative w-full overflow-hidden rounded-xl shadow-md 
    bg-gradient-to-br from-blue-50 to-indigo-50 
    dark:from-gray-800 dark:to-gray-900 
    p-2 md:px-4 flex items-center justify-center gap-4 mb-10">

                                {/* Shimmer overlay */}
                                <div className="absolute inset-0 overflow-hidden rounded-xl">
                                    <div className="absolute inset-0 bg-gradient-to-r 
        from-transparent via-white/40 to-transparent 
        dark:via-white/10 
        animate-shimmer" />
                                </div>

                                {/* Thumbnail Skeleton */}
                                <div className="w-40 h-36 md:w-56 md:h-56 
      absolute -top-15 md:top-auto mt-12 md:mt-0 md:-left-10
      rounded-lg 
      bg-gray-300 dark:bg-gray-700 
      animate-pulse" />

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
                        ))}

                        {mergedProjects.length === 0 && !loadingRepos && (
                            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow ">
                                <p className="text-gray-500 dark:text-gray-400 text-lg">No projects found</p>

                            </div>
                        )}

                        {mergedProjects.length > 0 && !loadingRepos && (
                            <div>

                                <div className="mb-3 flex flex-wrap justify-between items-center gap-4">
                                    <h2 className="md:text-3xl md:pl-5 font-semibold mb-0 dark:text-white">Projects</h2>
                                    {mergedProjects.length > 0 && !loadingRepos && <div className="flex flex-col justify-between md:justify-between mb-6 md:flex-row">
                                        <div className="font-dancing order-2">
                                            <select
                                                name="sort"
                                                value={sortBy}
                                                onChange={(e) => setSortBy(e.target.value)}
                                                className="px-0 py-1 text-gray-500 dark:text-gray-300 border border-gray-300 dark:border-gray-600 dark:bg-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
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
                                    </div>}
                                </div>
                                <div className="grid gap-8 md:pl-12">
                                    {mergedProjects.map((project, index) => (
                                        <div key={project.id || index} className="bg-white dark:bg-gray-800 relative w-full shadow-md rounded-xl p-2 md:p-4 hover:shadow-lg transition flex  items-center justify-center  gap-4">
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
                                                <div className="w-40 h-36  md:w-56 md:h-56 shadow-lg hover:scale-105 transition-transform duration-300 absolute -top-15 md:top-auto mt-12 md:mt-0 md:-left-10 bg-linear-to-br from-indigo-100 to-purple-100 dark:from-gray-800 dark:to-gray-700 rounded-lg flex items-center justify-center">
                                                    <motion.svg
                                                        initial={{ opacity: 0, y: 50 }}          // start below
                                                        whileInView={{ opacity: 1, y: 0 }}       // end at normal position
                                                        transition={{ duration: 0.6, ease: "easeOut" }}
                                                        viewport={{ once: false }}                // animate only once
                                                        className="w-16 h-16 text-indigo-600"
                                                        fill="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >

                                                        <svg className="w-16 h-16 text-indigo-600 " fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                                                        </svg>
                                                    </motion.svg>
                                                </div>
                                            )}


                                            {/* Project Header */}
                                            <div className=" w-full min-h-56 mt-34 md:mt-0 md:ml-50 ">
                                                <div className="mt-1">
                                                    <div className="flex items-start justify-between">
                                                        <h3 className="text-xl font-semibold flex-1 text-center md:text-left dark:text-white">{project.displayName}</h3>
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

                                                    {project.displayDescription && <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 line-clamp-2">
                                                        {project.displayDescription}
                                                    </p>}
                                                    <div className="flex items-center mt-2 gap-2">
                                                        <img className="size-6 rounded-full" src={project.ownerurl} alt="" />
                                                        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                                                            by {project.owner || "N/A"}
                                                        </p>

                                                    </div>
                                                </div>

                                                {/* GitHub Stats (for both GitHub and database projects with GitHub link) */}
                                                {(project.source === 'github' || project.language || project.stargazersCount >= 0) && (
                                                    <div className="flex gap-3 mt-2 text-xs text-gray-500 flex-wrap">
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
                                                        <div className="mt-1 space-y-1">
                                                            <a href={project.githubUrl || project.htmlUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 text-sm block hover:underline">
                                                                🔗 View Repository
                                                            </a>
                                                            {project.homepage && (
                                                                <a href={project.homepage} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 text-sm block hover:underline">
                                                                    <img src={liveicon} className="inline w-4 h-4 mr-1" alt="" /> View Live
                                                                </a>
                                                            )}
                                                        </div>

                                                        {/* Demo Video (only for database projects) */}
                                                        {project.demoVideoUrl && (
                                                            <button onClick={() => { setShowvideourl(project.demoVideoUrl) }} className="flex items-center gap-1 justify-centercursor-pointer mt-3 px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs rounded-full">
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
                                                            <div className="flex flex-wrap gap-1 mt-1 ">
                                                                {project.topics.map((topic, i) => (
                                                                    <span key={i} className="px-2 py-1 bg-indigo-50 dark:bg-gray-700 dark:text-gray-200 text-indigo-700 text-xs rounded">
                                                                        {topic}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* Languages Display */}
                                                        {/* Show detailed language breakdown (always fetched from GitHub) */}
                                                        {project.languages && Object.keys(project.languages).length > 0 ? (
                                                            <div className="mt-3 ">
                                                                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-1">Languages</p>
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


                                                {/* View More / Actions */}
                                                {/* <div className="flex justify-between items-center mt-5 pt-4 border-t dark:border-gray-700 gap-2">
                                        <a
                                            href={project.htmlUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                                        >
                                            View More
                                        </a>


                                    </div> */}

                                                {/* Source Badge */}
                                                <div className="mt-4 border-t border-gray-500 pt-2 dark:border-gray-300 text-xs text-gray-400 dark:text-gray-400 text-center flex items-center justify-between flex-wrap gap-2">
                                                    {project.source === 'database' ? 'Custom Project' : 'From GitHub'}
                                                    <div className="flex items-center gap-4 ">
                                                        {(project.githubCreatedAt || project.createdAt || project.created_at) && (
                                                            <span className="cursor-default flex items-center gap-1 text-xs  text-gray-400" title="Created On">
                                                                Created-
                                                                {new Date(project.githubCreatedAt || project.createdAt || project.created_at).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                        {(<span>|</span>)}
                                                        {(project.githubUpdatedAt || project.updatedAt || project.updated_at) && (
                                                            <span className="cursor-default flex items-center gap-1 text-xs text-gray-400" title="Last Updated">
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
                        )}

                        {/* Contributions/Collaboration Section */}

                        {contributions.length > 0 && (
                            <div className="mt-12">
                                <div className="mb-8">
                                    <h2 className="text-2xl font-semibold mb-2 dark:text-white">Collaborations</h2>
                                </div>

                                <div className="grid gap-8 md:pl-12">
                                    {contributions.map((project, index) => (
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
                                                            <span className="cursor-default flex items-center gap-1 text-xs text-gray-400" title="Created On">
                                                                Created-
                                                                {new Date(project.createdAt || project.created_at).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                        {(project.createdAt || project.created_at) && (project.updatedAt || project.updated_at) && (<span className="text-gray-400">|</span>)}
                                                        {(project.updatedAt || project.updated_at) && (
                                                            <span className="cursor-default flex items-center gap-1 text-xs text-gray-400" title="Last Updated">
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
                                                            className="text-xs bg-gray-300 dark:bg-gray-600 text-gray-400 dark:text-gray-300 px-4 py-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
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
                            </div>
                        )}
                    </div>



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
        </div>
    );
}
