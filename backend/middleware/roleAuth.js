const { AuditLog } = require('../models');

// Role hierarchy
const roleHierarchy = {
  super_admin: 5,
  admin: 4,
  editor: 3,
  analyst: 2,
  api_user: 1
};

// Check if user has required role
const hasRole = (userRole, requiredRole) => {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

// Middleware to check role permissions
const requireRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
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
    } catch (error) {
      console.error('Role auth middleware error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

// Middleware to check specific permissions
const requirePermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Define permissions for each role
      const permissions = {
        super_admin: {
          users: ['create', 'read', 'update', 'delete'],
          api_keys: ['create', 'read', 'update', 'delete'],
          sites: ['create', 'read', 'update', 'delete'],
          posts: ['create', 'read', 'update', 'delete'],
          artists: ['create', 'read', 'update', 'delete'],
          reports: ['create', 'read', 'update', 'delete'],
          system: ['read', 'update']
        },
        admin: {
          users: ['create', 'read', 'update'],
          api_keys: ['create', 'read', 'update', 'delete'],
          sites: ['create', 'read', 'update', 'delete'],
          posts: ['create', 'read', 'update', 'delete'],
          artists: ['create', 'read', 'update', 'delete'],
          reports: ['create', 'read', 'update', 'delete'],
          system: ['read']
        },
        editor: {
          users: ['read'],
          api_keys: [],
          sites: ['read'],
          posts: ['create', 'read', 'update'],
          artists: ['create', 'read', 'update'],
          reports: ['create', 'read'],
          system: []
        },
        analyst: {
          users: [],
          api_keys: [],
          sites: ['read'],
          posts: ['read'],
          artists: ['read'],
          reports: ['read'],
          system: []
        },
        api_user: {
          users: [],
          api_keys: ['read'], // Can only read their own
          sites: ['read'],
          posts: ['read'],
          artists: ['read'],
          reports: ['read'],
          system: []
        }
      };

      const userPermissions = permissions[req.user.role] || {};
      const resourcePermissions = userPermissions[resource] || [];

      if (!resourcePermissions.includes(action)) {
        await AuditLog.logAction({
          userId: req.user.id,
          action: 'Permission denied',
          category: 'auth',
          details: {
            resource,
            action,
            userRole: req.user.role,
            endpoint: req.originalUrl
          },
          status: 'failure',
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        });

        return res.status(403).json({ 
          error: 'Permission denied',
          resource,
          action,
          role: req.user.role
        });
      }

      next();
    } catch (error) {
      console.error('Permission middleware error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

// Middleware for API key authentication
const authenticateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return next(); // Continue to normal auth
    }

    const { ApiKey, User } = require('../models');
    const validKey = await ApiKey.validateKey(apiKey);
    
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

    // Check rate limit
    // TODO: Implement rate limiting with Redis

    // Load user
    const user = await User.findByPk(validKey.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User account disabled' });
    }

    // Set user and api key in request
    req.user = user;
    req.apiKey = validKey;
    
    // Update usage stats
    validKey.usage.total++;
    await validKey.save();

    next();
  } catch (error) {
    console.error('API key auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  requireRole,
  requirePermission,
  authenticateApiKey,
  hasRole
};