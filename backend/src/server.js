// backend/src/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// ----- Security Middleware -----
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// ----- Rate Limiting (applied to all /api routes) -----
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests from this IP' }
});
app.use('/api', limiter);

// ----- CORS: Allow your frontend -----
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://nomagro.com',
  'https://www.nomagro.com',
  'http://localhost:3000'
].filter(origin => origin && typeof origin === 'string' && origin.trim() !== '');

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.log(`CORS blocked: ${origin}`);
    return callback(new Error('CORS not allowed'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ----- Middleware -----
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ----- Root Health Check (REQUIRED for EB) -----
app.get('/', (req, res) => {
  res.status(200).send('Nomagro Backend is running 🚀');
});

// ----- API Health Check -----
app.get('/api/health', (req, res) => {
  res.status(200).json({
    ok: true,
    service: 'Nomagro Backend',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

// ----- Connect to MongoDB -----
const connectDB = require('./database/connection');

// ----- API Routes -----
try {
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/weather', require('./routes/weather'));
  app.use('/api/predictions', require('./routes/prediction'));
  app.use('/api/marketplace', require('./routes/marketplace'));
  app.use('/api/user', require('./routes/user'));
  app.use('/api/analytics', require('./routes/analytics'));
  app.use('/api/ml', require('./routes/ml'));
} catch (error) {
  console.error('Failed to load API routes:', error.message);
  app.use('/api*', (req, res) => {
    res.status(500).json({ error: 'API failed to start' });
  });
}

// ----- 404 for any /api/* route not matched -----
app.use('/api*', (req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// ----- Serve Frontend -----
app.use(express.static('public'));

// ----- Catch-all: Serve React App -----
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ----- Error Handling Middleware -----
app.use(require('./middleware/errorHandler'));

// ----- Start Server -----
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

// ✅ Handle DB connection errors
connectDB().then(() => {
  const server = app.listen(PORT, HOST, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Allowed origins: ${allowedOrigins.join(', ')}`);
    console.log(`📦 APIs: /api/auth/register, /api/predictions`);
    console.log(`🛡️  Security: Helmet + Rate Limiting enabled`);
    console.log(`📁 Static: Serving frontend from /public`);
  });

  // ✅ Prevent server from hanging
  server.on('error', (err) => {
    console.error('Server error:', err);
    process.exit(1);
  });
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});