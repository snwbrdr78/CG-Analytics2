const jwt = require('jsonwebtoken');
const { User, ApiKey, AuditLog } = require('../models');

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      role: user.role 
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

const authenticateToken = async (req, res, next) => {
  // First check for API key
  const apiKeyHeader = req.headers['x-api-key'];
  if (apiKeyHeader) {
    try {
      const validKey = await ApiKey.validateKey(apiKeyHeader);
      
      if (!validKey) {
        return res.status(401).json({ error: 'Invalid API key' });
      }

      // Check IP restrictions
      if (validKey.allowedIPs && validKey.allowedIPs.length > 0) {
        const clientIP = req.ip;
        if (!validKey.allowedIPs.includes(clientIP)) {
          await AuditLog.logAction({
            action: 'API key access from unauthorized IP',
            category: 'api_key',
            details: {
              keyId: validKey.id,
              clientIP,
              allowedIPs: validKey.allowedIPs
            },
            status: 'failure',
            ipAddress: clientIP,
            userAgent: req.get('user-agent')
          });
          return res.status(403).json({ error: 'Access denied from this IP' });
        }
      }

      // Load user
      const user = await User.findByPk(validKey.userId);
      if (!user || !user.isActive) {
        return res.status(401).json({ error: 'User account disabled' });
      }

      // Set user and api key in request
      req.user = user;
      req.apiKey = validKey;
      req.authMethod = 'api_key';
      
      // Update usage stats
      validKey.usage.total++;
      await validKey.save();

      return next();
    } catch (error) {
      console.error('API key auth error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Fall back to JWT token auth
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get fresh user data
    const user = await User.findByPk(decoded.id);
    if (!user || !user.isActive) {
      return res.status(403).json({ error: 'User not found or inactive' });
    }

    req.user = user;
    req.authMethod = 'jwt';
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Import role hierarchy check from roleAuth
const { hasRole } = require('./roleAuth');

const requireRole = (requiredRole) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!hasRole(req.user.role, requiredRole)) {
      // Log unauthorized access attempt
      await AuditLog.logAction({
        userId: req.user.id,
        action: 'Unauthorized access attempt',
        category: 'auth',
        details: {
          requiredRole,
          userRole: req.user.role,
          endpoint: req.originalUrl
        },
        status: 'failure',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: requiredRole,
        current: req.user.role
      });
    }

    next();
  };
};

// Optional auth - doesn't fail if no token, but adds user if present
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findByPk(decoded.id);
    if (user && user.isActive) {
      req.user = user;
    }
  } catch (error) {
    // Silently fail - this is optional auth
  }

  next();
};

module.exports = {
  generateToken,
  authenticateToken,
  requireRole,
  optionalAuth
};