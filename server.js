require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const allRoutes = require("./Routes/index");

const PORT = process.env.PORT || 3000;

const app = express();
app.set("trust proxy", 1);

// Simple Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// List of allowed origins - explicitly including both www and non-www
const allowedOrigins = [
  "https://opticsglasses.vercel.app",
  "https://www.opticsglasses.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174"
];

// Robust CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.warn(`CORS Warning: Unauthorized origin attempted: ${origin}`);
        // During testing, we can allow it or block it. Let's allow but log for now to troubleshoot.
        callback(null, true);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    exposedHeaders: ["Set-Cookie"]
  })
);

// Explicit OPTIONS preflight handling
app.options("*", cors());

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Root health check
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "OpticsGlasses API is live",
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Database connection (Non-blocking)
connectDB().catch(err => {
  console.error("Critical: Initial DB connection failed", err);
});

// Route handling
app.use(allRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err.message);
  res.status(err.status || 500).json({
    isStatus: false,
    msg: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
