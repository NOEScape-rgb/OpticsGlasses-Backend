require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const allRoutes = require("./Routes/index");

const PORT = process.env.PORT || 3000;

// Correct typing for Express app
const app = express();

app.use(cors());
app.use(express.json());
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
