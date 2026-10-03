import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { setFallbackActive } from './localDb.js';

import authRoutes from './routes/authRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import userRoutes from './routes/userRoutes.js';
import insightRoutes from './routes/insightRoutes.js';
import errorHandler from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);
app.use('/api/insights', insightRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/campusfix';

  mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 1500 })
    .then(() => {
      console.log(`✅ Connected to MongoDB at ${mongoUri}`);
      app.listen(PORT, () => console.log(`🚀 CampusFix backend running on http://localhost:${PORT}`));
    })
    .catch((err) => {
      console.warn(`⚡ Local MongoDB not available: ${err.message}`);
      console.log('📦 Automatically starting with local JSON database (backend/data/db.json)...');
      setFallbackActive(true);
      app.listen(PORT, () => console.log(`🚀 CampusFix backend running on http://localhost:${PORT} [Local DB Mode]`));
    });
}

export default app;
