const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const connectDB = require('./config/db');
const signupRouter = require('./routes/signupRouter');

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Connect to DB
connectDB();

// Routes
app.use('/', signupRouter);

// Simple health route
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'API is working' });
});

// Optional: quick DB-check route (shows mongoose readyState)
app.get('/api/db-status', (req, res) => {
  const state = mongoose.connection.readyState;
  res.json({ dbReadyState: state });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));