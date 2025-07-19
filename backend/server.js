const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const uploadCheckRoutes = require('./routes/uploadCheck');
const artistRoutes = require('./routes/artists');
const postRoutes = require('./routes/posts');
const analyticsRoutes = require('./routes/analytics');
const reportsRoutes = require('./routes/reports');
const adminRoutes = require('./routes/admin');
const videoReelsRoutes = require('./routes/videoReels');
const contentMatchingRoutes = require('./routes/contentMatching');
const facebookRoutes = require('./routes/facebook');
const instagramRoutes = require('./routes/instagram');
const youtubeRoutes = require('./routes/youtube');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session for OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || 'cg-analytics-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 15 // 15 minutes
  }
}));

// Disable caching for API responses
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.csv') {
      return cb(new Error('Only CSV files are allowed'));
    }
    cb(null, true);
  }
});

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Serve static files from frontend build
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Serve test file
app.get('/test-login', (req, res) => {
  res.sendFile(path.join(__dirname, '../test-login.html'));
});

// Routes
app.use('/api/auth', authRoutes);

// Protected routes - require authentication
app.use('/api/upload', authenticateToken, upload.single('file'), uploadRoutes);
app.use('/api/upload-check', authenticateToken, upload.single('file'), uploadCheckRoutes);
app.use('/api/artists', authenticateToken, artistRoutes);
app.use('/api/posts', authenticateToken, postRoutes);
app.use('/api/analytics', authenticateToken, analyticsRoutes);
app.use('/api/reports', authenticateToken, reportsRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);
app.use('/api/video-reels', authenticateToken, videoReelsRoutes);
app.use('/api/content-matching', authenticateToken, contentMatchingRoutes);
app.use('/api/facebook', facebookRoutes);
app.use('/api/instagram', instagramRoutes);
app.use('/api/youtube', youtubeRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Version endpoint
app.get('/api/version', (req, res) => {
  try {
    const version = require('../version.json');
    res.json({ version: version.version });
  } catch (error) {
    res.json({ version: '1.0.0' });
  }
});

// Debug endpoint - moved before static files
app.get('/api/debug', (req, res) => {
  console.log('Debug endpoint hit');
  res.json({ 
    status: 'ok',
    headers: req.headers,
    origin: req.get('origin'),
    referer: req.get('referer'),
    url: req.url,
    method: req.method
  });
});

// Serve frontend for all non-API routes (must be last)
app.get('*', (req, res) => {
  // Only serve index.html for non-API routes
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  } else {
    res.status(404).json({ error: 'API endpoint not found' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Database connection and server start
async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync database models
    // Temporarily disabled due to migration issues
    // if (process.env.NODE_ENV === 'development') {
    //   await sequelize.sync({ alter: true });
    //   console.log('Database models synchronized.');
    // }
    
    // Initialize Facebook sync queue if Redis is available
    try {
      const { scheduleRecurringSyncs, cleanOldJobs } = require('./queues/facebookSyncQueue');
      await scheduleRecurringSyncs();
      
      // Clean old jobs every day
      setInterval(cleanOldJobs, 24 * 60 * 60 * 1000);
      
      console.log('Facebook sync queue initialized');
    } catch (error) {
      console.warn('Facebook sync queue not initialized (Redis may not be available):', error.message);
    }
    
    // Start server - listen on all network interfaces
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on http://0.0.0.0:${PORT}`);
      console.log(`Accessible from network at http://<your-ip>:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}

startServer();