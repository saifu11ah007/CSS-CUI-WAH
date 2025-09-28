const express = require("express");
const serverless = require("serverless-http");
const signupRouter = require("../routes/signupRouter"); // Adjust path to your signupRouter
const connectDB = require("../config/db"); // Assuming you have a DB connection

const app = express();

// Middleware
app.use(express.json());

// Connect to database (e.g., MongoDB)
connectDB(); // Ensure this is defined in config/db.js

// Routes
app.use("/api/signup", signupRouter); // Your existing signup routes
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Express on Vercel 🔥" });
});

// Export for Vercel serverless
module.exports.handler = serverless(app);