const jwt = require("jsonwebtoken");
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
      token = req.cookies?.token;
      if (token) {
        console.log("AUTH: Found token in cookies");
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
      token = req.cookies?.adminToken; // Check specific admin cookie
    }

    if (!token) {
      return res.status(401).json({ msg: "No admin token provided" });
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // Attach user to request
    return next();
  } catch (err) {
    return res.status(401).json({ msg: "Invalid or expired admin token" });
  }
};

module.exports = {
  verifyToken,
  verifyUser,
  verifyAdmin,
  verifyAdminToken,
};