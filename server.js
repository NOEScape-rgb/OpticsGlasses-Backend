require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const allRoutes = require("./Routes/index");

const PORT = process.env.PORT || 3000;

// Correct typing for Express app
const app = express();
app.set("trust proxy", 1); // Trust first proxy (required for Vercel/Heroku cookies)

const cookieParser = require("cookie-parser");

const allowedOrigins = [
  process.env.FRONT_END_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "https://optics-glasses-frontend.vercel.app",
  "https://opticsglasses.vercel.app",
  "https://www.opticsglasses.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.some(o => o && origin.startsWith(o))) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked for origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  })
);

// Add explicit OPTIONS handling for preflight
app.options("*", cors());

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Health check / Root route
app.get("/", (req, res) => {
  res.json({ status: "success", message: "OpticsGlasses API is running" });
});

const path = require("path");

// db connection
connectDB();




// route
app.use(allRoutes);

// global error handler - MUST be after routes
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR CAPTURED:", err);
  res.status(err.status || 500).json({
    isStatus: false,
    msg: err.message || "Internal Server Error",
    stack: err.stack
  });
});

// Export the app for Vercel
module.exports = app;

// Only listen if running directly (not in Vercel/Serverless)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
