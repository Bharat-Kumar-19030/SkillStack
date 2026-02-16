const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  username: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-zA-Z0-9_-]+$/,
  },
  email: { 
    type: String, 
    unique: true,
    sparse: true, // allows multiple null/undefined values
    trim: true,
    validate: {
      validator: function(v) {
        // Email can be null/undefined for OAuth users, but if provided, must not be empty string
        return v === null || v === undefined || v.length > 0;
      },
      message: 'Email cannot be an empty string'
    }
  },
  password: String, // hashed
  googleId: String,
  githubId: String,
  profileImage: String,
  collegeName:String,
  Branch:String,
  Bio:String,
  githubProfileLink:String,
  linkedInProfileLink:String,
  leetcodeProfileLink:String,
  gfgProfileLink:String,
  codeforcesProfileLink:String,
  hackerrankProfileLink:String,
  hackerearthProfileLink:String,
  websites: [{
    type: String
  }],
  
  // GitHub Integration Settings
  fetchPublicRepos: {
    type: Boolean,
    default: false
  },
  fetchPrivateRepos: {
    type: Boolean,
    default: false
  },
  fetchLanguages: {
    type: Boolean,
    default: true // By default, fetch detailed language stats
  },
  githubToken: {
    type: String,
    default: null,
    select: false // Don't return this field by default
  },
  hiddenGithubRepos: [{
    type: String, // Store GitHub repo URLs
  }],
  
  // Project Rankings (for custom ordering)
  projectRankings: {
    type: Map,
    of: Number,
    default: {}
  },
  contributionRankings: {
    type: Map,
    of: Number,
    default: {}
  },
  
  theme: {
    type: String,
    enum: ['light', 'dark'],
    default: 'light'
  },
  
  // Follow System
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // GitHub Stats (cached)
  totalCommits: {
    type: Number,
    default: 0
  },
  lastCommitDate: {
    type: Date,
    default: null
  }
  // add password / oauth fields as needed
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
