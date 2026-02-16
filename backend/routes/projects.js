const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const User = require('../models/User');
const { projectUpload, handleCloudinaryUpload, } = require('../middleware/upload');
const cloudinary = require('../config/cloudinary'); // optional

// Middleware: placeholder for auth - replace with your auth middleware
function mockAuth(req, res, next) {
    // For now, we mock req.user. In real app, replace with JWT/session auth
    // Hardcode userId or find existing user
    req.user = { id: req.headers['x-user-id'] || null };
    next();
}

// Create project
router.post(
    '/',
    mockAuth,
    projectUpload, // multer middleware
    handleCloudinaryUpload,
    [
        body('projectName').notEmpty().withMessage('Project name is required'),
        body('githubUrl').optional().isURL().withMessage('Invalid GitHub URL'),
    ],
    async (req, res) => {
        // validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({ message: 'Authentication required (set x-user-id header for now).' });
            }

            const { projectName, shortDescription, githubUrl, liveDemoUrl, tags, isPublic, githubCreatedAt, githubUpdatedAt } = req.body;

            const newProject = new Project({
                owner: req.user.id,
                projectName,
                shortDescription,
                githubUrl,
                liveDemoUrl,
                tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
                isPublic: isPublic === 'true' || isPublic === true,
                githubCreatedAt: githubCreatedAt || null,
                githubUpdatedAt: githubUpdatedAt || null,
            });

            // files are available from req.files when using multer.fields
            newProject.thumbnailUrl = req.body.thumbnailUrl;
            newProject.demoVideoUrl = req.body.demoVideoUrl;

            await newProject.save();
            res.status(201).json(newProject);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// Get all projects for current user
router.get('/me', mockAuth, async (req, res) => {
    try {
        if (!req.user || !req.user.id) return res.status(401).json({ message: 'Auth required (set x-user-id header).' });

        const { sortBy } = req.query;
        
        // Fetch all projects first
        const projects = await Project.find({ owner: req.user.id });
        
        // Apply sorting based on criteria
        let sortedProjects;
        
        switch (sortBy) {
            case 'updatedAt':
                sortedProjects = projects.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                break;
                
            case 'name':
                sortedProjects = projects.sort((a, b) => a.projectName.localeCompare(b.projectName));
                break;
                
            case 'public':
                sortedProjects = projects.sort((a, b) => {
                    // Public projects first
                    if (a.isPublic === b.isPublic) {
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    }
                    return b.isPublic - a.isPublic; // true (1) comes before false (0)
                });
                break;
                
            case 'deployment':
                sortedProjects = projects.sort((a, b) => {
                    const hasDeployA = !!a.liveDemoUrl;
                    const hasDeployB = !!b.liveDemoUrl;
                    
                    if (hasDeployA === hasDeployB) {
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    }
                    // Projects WITH deployment come first
                    return (hasDeployB ? 1 : 0) - (hasDeployA ? 1 : 0);
                });
                break;
                
            case 'demo':
                sortedProjects = projects.sort((a, b) => {
                    const hasDemoA = !!a.demoVideoUrl;
                    const hasDemoB = !!b.demoVideoUrl;
                    
                    if (hasDemoA === hasDemoB) {
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    }
                    // Projects WITH demo video come first
                    return (hasDemoB ? 1 : 0) - (hasDemoA ? 1 : 0);
                });
                break;
                
            case 'createdAt':
            default:
                sortedProjects = projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
        }

        res.json(sortedProjects);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get projects by username (public access) - MUST be before /:id route
router.get('/from_username', async (req, res) => {
    try {
        const username = req.headers['x-user-name'];
        
        if (!username) {
            return res.status(400).json({ message: 'Username is required in x-user-name header' });
        }
        
        // Find user by username
        const user = await User.findOne({ username: username.toLowerCase() });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const { sortBy } = req.query;
        
        // Fetch all projects for this user
        const projects = await Project.find({ owner: user._id });
        
        // Apply sorting based on criteria
        let sortedProjects;
        
        switch (sortBy) {
            case 'updatedAt':
                sortedProjects = projects.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                break;
                
            case 'name':
                sortedProjects = projects.sort((a, b) => a.projectName.localeCompare(b.projectName));
                break;
                
            case 'public':
                sortedProjects = projects.sort((a, b) => {
                    if (a.isPublic === b.isPublic) {
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    }
                    return b.isPublic - a.isPublic;
                });
                break;
                
            case 'deployment':
                sortedProjects = projects.sort((a, b) => {
                    const hasDeployA = !!a.liveDemoUrl;
                    const hasDeployB = !!b.liveDemoUrl;
                    
                    if (hasDeployA === hasDeployB) {
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    }
                    return (hasDeployB ? 1 : 0) - (hasDeployA ? 1 : 0);
                });
                break;
                
            case 'demo':
                sortedProjects = projects.sort((a, b) => {
                    const hasDemoA = !!a.demoVideoUrl;
                    const hasDemoB = !!b.demoVideoUrl;
                    
                    if (hasDemoA === hasDemoB) {
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    }
                    return (hasDemoB ? 1 : 0) - (hasDemoA ? 1 : 0);
                });
                break;
                
            case 'createdAt':
            default:
                sortedProjects = projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
        }

        res.json(sortedProjects);
    } catch (err) {
        console.error('Error fetching projects by username:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get single project by id (public)
router.get('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id).populate('owner', 'name email profileImage');
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json(project);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update project (owner only)
router.put('/:id', mockAuth, projectUpload, handleCloudinaryUpload, async (req, res) => {
    try {
        if (!req.user || !req.user.id) return res.status(401).json({ message: 'Auth required (set x-user-id header).' });
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        if (project.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

        const { projectName, shortDescription, githubUrl, liveDemoUrl, tags, isPublic } = req.body;
        if (projectName) project.projectName = projectName;
        if (shortDescription) project.shortDescription = shortDescription;
        if (githubUrl) project.githubUrl = githubUrl;
        if (liveDemoUrl) project.liveDemoUrl = liveDemoUrl;
        if (typeof isPublic !== 'undefined') project.isPublic = (isPublic === 'true' || isPublic === true);
        if (tags) project.tags = tags.split(',').map(t => t.trim()).filter(Boolean);

        // DO NOT update githubCreatedAt and githubUpdatedAt - they should remain as originally fetched from GitHub

        // Update thumbnail if new file uploaded (URL set by middleware)
        if (req.body.thumbnailUrl) {
            console.log('Updating thumbnail to:', req.body.thumbnailUrl);
            project.thumbnailUrl = req.body.thumbnailUrl;
        }

        // Update demo video if new file uploaded (URL set by middleware)
        if (req.body.demoVideoUrl) {
            console.log('Updating demo video to:', req.body.demoVideoUrl);
            project.demoVideoUrl = req.body.demoVideoUrl;
        }

        await project.save();
        console.log('Project updated:', project);
        res.json(project);
    } catch (err) {
        console.error('Update error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Delete project
router.delete('/:id', mockAuth, async (req, res) => {
    try {
        if (!req.user || !req.user.id) return res.status(401).json({ message: 'Auth required (set x-user-id header).' });

        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        if (project.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

        // Delete files from Cloudinary if they exist
        try {
            if (project.thumbnailUrl) {
                // Extract public_id from Cloudinary URL
                const thumbnailMatch = project.thumbnailUrl.match(/\/student-projects\/thumbnails\/([^\/\.]+)/);
                if (thumbnailMatch) {
                    const publicId = `student-projects/thumbnails/${thumbnailMatch[1]}`;
                    await cloudinary.uploader.destroy(publicId);
                    console.log('Deleted thumbnail from Cloudinary:', publicId);
                }
            }

            if (project.demoVideoUrl) {
                // Extract public_id from Cloudinary URL
                const videoMatch = project.demoVideoUrl.match(/\/student-projects\/videos\/([^\/\.]+)/);
                if (videoMatch) {
                    const publicId = `student-projects/videos/${videoMatch[1]}`;
                    await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
                    console.log('Deleted video from Cloudinary:', publicId);
                }
            }
        } catch (cloudinaryError) {
            console.error('Error deleting from Cloudinary:', cloudinaryError);
            // Continue with project deletion even if Cloudinary deletion fails
        }

        await project.deleteOne();
        res.json({ message: 'Project deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
