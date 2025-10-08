const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const signupRouter = require('../routes/signupRouter');
const loginRouter = require('../routes/loginRouter');

dotenv.config({ quiet: true }); // Suppress extra logs

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Routes
app.get('/', (req, res) => res.send('CSS'));
app.use('/signup', signupRouter);
app.use('/login', loginRouter);
// Connect to MongoDB (this runs on cold start)
async function startServer() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    // Don't exit(1) in serverless—log and let it fail gracefully
  }
}

startServer();

// Export the raw Express app for Vercel (default export)
module.exports = app;