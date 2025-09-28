import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import signupRouter from '../routes/signupRouter.js';
import serverless from 'serverless-http';

dotenv.config();

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

// Connect to MongoDB
async function startServer() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

startServer();

// Export for Vercel serverless
export default serverless(app);