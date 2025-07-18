const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const https = require('https');
const http = require('http');
const fs = require('fs');
require('dotenv').config();

const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const artistRoutes = require('./routes/artists');
const postRoutes = require('./routes/posts');
const analyticsRoutes = require('./routes/analytics');
const reportsRoutes = require('./routes/reports');
const adminRoutes = require('./routes/admin');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const HTTP_PORT = process.env.HTTP_PORT || 80;
const HTTPS_PORT = process.env.HTTPS_PORT || 443;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Serve static files from frontend build
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Routes
app.use('/api/auth', authRoutes);

// Protected routes - require authentication
app.use('/api/upload', authenticateToken, upload.single('file'), uploadRoutes);
app.use('/api/artists', authenticateToken, artistRoutes);
app.use('/api/posts', authenticateToken, postRoutes);
app.use('/api/analytics', authenticateToken, analyticsRoutes);
app.use('/api/reports', authenticateToken, reportsRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);

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

// Serve frontend for all non-API routes (must be last)
app.get('*', (req, res) => {
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
    
    // Create HTTP server
    const httpServer = http.createServer(app);
    
    // Start HTTP server on port 80
    httpServer.listen(HTTP_PORT, '0.0.0.0', () => {
      console.log(`HTTP Server is running on http://0.0.0.0:${HTTP_PORT}`);
      console.log(`Accessible from network at http://172.31.20.69:${HTTP_PORT}`);
    });
    
    // Check if SSL certificates exist
    const sslDir = path.join(__dirname, '../ssl');
    const keyPath = path.join(sslDir, 'server.key');
    const certPath = path.join(sslDir, 'server.cert');
    
    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
      // Create HTTPS server
      const httpsOptions = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath)
      };
      
      const httpsServer = https.createServer(httpsOptions, app);
      
      // Start HTTPS server on port 443
      httpsServer.listen(HTTPS_PORT, '0.0.0.0', () => {
        console.log(`HTTPS Server is running on https://0.0.0.0:${HTTPS_PORT}`);
        console.log(`Accessible from network at https://172.31.20.69:${HTTPS_PORT}`);
      });
    } else {
      console.log('SSL certificates not found. HTTPS server not started.');
      console.log('To enable HTTPS, run: npm run setup:ssl');
    }
    
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}

startServer();