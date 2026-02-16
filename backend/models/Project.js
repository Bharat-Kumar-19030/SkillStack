const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  projectName: { type: String, required: true },
  shortDescription: { type: String },
  githubUrl: { type: String },
  liveDemoUrl: { type: String },

  // Tags / tech stack as array for easy filtering
  tags: [String],

  // File URLs (Cloudinary or local)
  thumbnailUrl: { type: String },
  demoVideoUrl: { type: String },

  // Optional meta fetched from GitHub (populated later)
  githubMeta: {
    languageStats: Object, // { JS: 12345, CSS: 432 }
    stars: Number,
    forks: Number, 
    openIssues: Number,
    defaultBranch: String,
    readmeHtml: String, // could store sanitized rendered README if desired
  },

  // GitHub timestamps (should not change on edit)
  githubCreatedAt: { type: Date },
  githubUpdatedAt: { type: Date },

  // visibility / published flags
  isPublic: { type: Boolean, default: true },

}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);
