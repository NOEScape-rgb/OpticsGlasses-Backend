const jwt = require("jsonwebtoken");
const User = require("../models/User");
const SECRET_KEY = process.env.SECRET_KEY;

if (!SECRET_KEY) {
  throw new Error("JWT_SECRET is not configured");
}

// 1. Authentication Middleware
// Responsible ONLY for validating identity
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let token;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7);
      console.log("AUTH: Found token in Authorization header");
    } else {
      token = req.cookies?.token || req.cookies?.adminToken;
      if (token) {
        console.log(`AUTH: Found token in ${req.cookies?.token ? 'cookies' : 'admin cookies'}`);
      } else {
        console.log("AUTH: No token found in cookies. All cookies:", req.cookies);
      }
    }

    if (!token) {
      console.log("AUTH FAIL: No token provided");
      return res.status(401).json({ msg: "No token provided" });
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // Attach user to request
    return next(); // Proceed to the next function
  } catch (err) {
    console.log("AUTH FAIL: JWT Verification Error:", err.message);
    return res.status(401).json({ msg: "Invalid or expired token" });
  }
};

// 2. Authorization: User Match
// Assumes verifyToken has already run
const verifyUser = (req, res, next) => {
  // We don't need to check for token here, verifyToken did it already
  if (!req.user) {
    return res.status(401).json({ msg: "Not Authenticated" });
  }

  if (req.params.username && req.user.username !== req.params.username) {
    return res.status(403).json({ msg: "Forbidden: not your account" });
  }

  next();
};

// 3. Authorization: Admin Check
// Assumes verifyToken has already run
const verifyAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ msg: "Not Authenticated" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Forbidden: Admin access required" });
  }

  next();
};

// 4. Admin Token Verification Middleware
// Identical to verifyToken but looks for 'adminToken' cookie
const verifyAdminToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let token;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    } else {
      token = req.cookies?.adminToken;
    }

    if (!token) {
      console.log("ADMIN AUTH FAIL: No adminToken found");
      return res.status(401).json({ msg: "No admin token provided" });
    }

    const decoded = jwt.verify(token, SECRET_KEY);

    // CRITICAL: Ensure the token actually belongs to an admin
    if (decoded.role !== "admin") {
      console.log("ADMIN AUTH FAIL: User is not an admin", decoded);
      return res.status(403).json({ msg: "Forbidden: Admin access required" });
    }

    req.user = decoded;
    return next();
  } catch (err) {
    console.log("ADMIN AUTH FAIL: JWT Error:", err.message);
    return res.status(401).json({ msg: "Invalid or expired admin token" });
  }
};

// 5. Check if user is verified
const verifyVerification = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ msg: "Not Authenticated" });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        isStatus: false,
        msg: "Please verify your email/phone before performing this action.",
        requireVerification: true
      });
    }

    next();
  } catch (err) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

module.exports = {
  verifyToken,
  verifyUser,
  verifyAdmin,
  verifyAdminToken,
  verifyVerification,
};