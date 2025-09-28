const express = require("express");
const serverless = require("serverless-http");
const signupRouter = require("../routes/signupRouter.js");
const connectDB = require("../config/db.js");

const app = express();

// Middleware
app.use(express.json());

// Connect to database (e.g., MongoDB)
connectDB();

// Routes
app.use("/api/signup", signupRouter);
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Express on Vercel 🔥" });
});

// Export for Vercel serverless (CommonJS style)
module.exports.handler = serverless(app);