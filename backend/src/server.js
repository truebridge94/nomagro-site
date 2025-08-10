import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

import connectDB from './database/connection.js';
import logger from './utils/logger.js';
import errorHandler from './middleware/errorHandler.js';
import rateLimiter from './middleware/rateLimiter.js';
import { startCronJobs } from './services/cronJobs.js';

// Route imports
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import weatherRoutes from './routes/weather.js';
import predictionRoutes from './routes/predictions.js';
import marketplaceRoutes from './routes/marketplace.js';
import mlRoutes from './routes/ml.js';
import analyticsRoutes from './routes/analytics.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Connect to database
if (process.env.MONGODB_URI) {
  connectDB();
} else {
  logger.warn('MongoDB URI not provided, running without database');
}

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(rateLimiter);

// Static files
app.use('/uploads', express.static('uploads'));

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
  });
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Make io available to routes
app.set('io', io);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/weather', weatherRoutes);
app.use('/api/v1/predictions', predictionRoutes);
app.use('/api/v1/marketplace', marketplaceRoutes);
app.use('/api/v1/ml', mlRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling
app.use(errorHandler);

// Start cron jobs
if (process.env.NODE_ENV !== 'production') {
  startCronJobs();
} else {
  logger.info('Cron jobs disabled in production');
}

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

export default app;