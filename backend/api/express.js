const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const signupRouter = require('../routes/signupRouter');
const loginRouter = require('../routes/loginRouter');

dotenv.config({ quiet: true });

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Routes
app.get('/', (req, res) => res.send('CSS'));
app.use('/signup', signupRouter);
app.use('/login', loginRouter);

// Connect to MongoDB
async function startServer() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
  }
}

startServer();

module.exports = app;