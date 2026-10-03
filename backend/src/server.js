import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

import authRoutes from './routes/authRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import userRoutes from './routes/userRoutes.js';
import insightRoutes from './routes/insightRoutes.js';
import errorHandler from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ================================
// Middleware
// ================================

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json());

// Static uploads
app.use(
  '/uploads',
  express.static(path.join(__dirname, '../uploads'))
);

// ================================
// Routes
// ================================

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);
app.use('/api/insights', insightRoutes);

// ================================
// Error Handler
// ================================

app.use(errorHandler);

// ================================
// MongoDB Connection
// ================================

const mongoUri = process.env.MONGODB_URI;

let isConnected = false;

async function connectDB() {
  if (isConnected) {
    return;
  }

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not configured');
  }

  await mongoose.connect(mongoUri);

  isConnected = true;

  console.log('✅ Connected to MongoDB');
}

// ================================
// Vercel Serverless Handler
// ================================

export default async function handler(req, res) {
  try {
    await connectDB();

    return app(req, res);
  } catch (error) {
    console.error('❌ Backend error:', error);

    return res.status(500).json({
      success: false,
      message: 'Database connection failed',
    });
  }
}