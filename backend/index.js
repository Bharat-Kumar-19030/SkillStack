require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const projectsRoute = require('./routes/projects');
const profileRoute= require('./routes/users')
const githubRoute= require('./routes/RepoDetails')
const publicRoute = require('./routes/publicRoutes')
const leetcodeRoute = require('./routes/leetcode')
const app = express();
const cookieParser = require("cookie-parser");
const passport = require("passport");
require("./config/passport");

// CORS must be configured BEFORE other middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-user-name']
}));

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

app.use("/api/auth", require("./routes/auth"));

// static uploads if local storage (optional)
app.use('/uploads', express.static('uploads'));

// connect to MongoDB with better error handling and timeout
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 30000, // Timeout after 30s instead of 5s
  socketTimeoutMS: 1000*60*60,
})
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => {
  console.error('MongoDB connection error:', err.message);
});

app.get('/', (req, res) => res.send('Project API running'));

// routes
app.use('/api/projects', projectsRoute);


// optional: user route placeholder
app.use('/api/users', profileRoute);
app.use('/api/github', githubRoute);
app.use('/api', publicRoute);
app.use('/api/leetcode', leetcodeRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));
