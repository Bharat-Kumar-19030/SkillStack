const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();
const passport = require("passport");
const cookieParser = require("cookie-parser");

router.use(cookieParser()); // ensure cookie parser available if needed

// SIGNUP route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set cookie (same as login/OAuth)
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ 
      message: "User created successfully", 
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if user has a password (OAuth users might not have one)
    if (!user.password) {
      return res.status(401).json({ message: "Please login with Google or GitHub" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set cookie (same as OAuth)
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ 
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * Helper: set token cookie and redirect.
 * - cookie is HTTP-only, secure in production, sameSite lax.
 */
function setTokenAndRedirect(res, token, redirectTo = "/") {
  const isProd = process.env.NODE_ENV === "production";
  // Set cookie for 7 days
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  // Redirect to frontend. You can choose a path like /dashboard
  const client = process.env.CLIENT_URL || "http://localhost:5173";
  res.redirect(`${client}${redirectTo}`);
}

/**
 * Middleware to verify JWT from Authorization header OR cookie.
 */
function verifyTokenFromReq(req) {
  // Prefer Authorization header
  const authHeader = req.headers["authorization"];
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }
  // Fallback to cookie
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  return null;
}

function authRequired(req, res, next) {
  const token = verifyTokenFromReq(req);
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
}

/* ---------- OAuth routes ---------- */

// Google start
router.get(
  "/google",
  (req, res, next) => {
    const redirectPath = req.query.redirect || '/';
    // Store in state parameter (OAuth allows this)
    req.authInfo = { redirectPath };
    // Pass state to passport
    passport.authenticate("google", { 
      session: false, 
      scope: ["profile", "email"],
      state: redirectPath // Pass redirect path in state
    })(req, res, next);
  }
);

// Google callback — set cookie and redirect
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${process.env.CLIENT_URL}/login` }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id, email: req.user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
    // Get redirect path from state parameter
    const redirectPath = req.query.state || '/';
    setTokenAndRedirect(res, token, redirectPath);
  }
);

// GitHub start
router.get("/github", 
  (req, res, next) => {
    const redirectPath = req.query.redirect || '/';
    passport.authenticate("github", { 
      session: false, 
      scope: ["user:email"],
      state: redirectPath
    })(req, res, next);
  }
);

// GitHub callback — set cookie and redirect
router.get(
  "/github/callback",
  passport.authenticate("github", { session: false, failureRedirect: `${process.env.CLIENT_URL}/login` }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id, email: req.user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
    const redirectPath = req.query.state || '/';
    setTokenAndRedirect(res, token, redirectPath);
  }
);

/* ---------- Utility route for frontend ---------- */

// Returns current logged-in user (reads token from cookie or Authorization header)
router.get("/me", authRequired, async (req, res) => {
  try {
    const token= req.cookies.token;
    if(!token){
      return res.status(401).json({ message: "No token" });
    }
    const decoded=jwt.verify(token,process.env.JWT_SECRET)
    const user=await User.findById(decoded.id).select("-password -__v"); // -password -__v to exclude sensitive fields
    if(!user){
      return res.status(404).json({message:"user not found"})
    }
    // console.log("user",user);
    res.json({user});
  } catch (err) {
    console.error("GET /me error:", err);
    res.status(401).json({ message: "Invalid token" });
  }
});

// Optional: logout endpoint to clear cookie
router.post("/logout", (req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "lax" });
  res.json({ message: "Logged out" });
  
});

module.exports = router;
