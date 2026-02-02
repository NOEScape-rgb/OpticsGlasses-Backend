require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const allRoutes = require("./Routes/index");

const PORT = process.env.PORT || 3000;

// Correct typing for Express app
const app = express();

const cookieParser = require("cookie-parser");

app.use(
  cors({
    origin: [process.env.FRONT_END_URL, "http://localhost:5173", "http://localhost:5174"], // Allow local dev ports
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const path = require("path");

// db connection
connectDB();



// route
app.use(allRoutes);

// Export the app for Vercel
module.exports = app;

// Only listen if running directly (not in Vercel/Serverless)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
