const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User, ApiKey, Site, AuditLog, Post, Artist } = require('../models');
const { requireRole, requirePermission } = require('../middleware/roleAuth');
const { Op } = require('sequelize');

// All admin routes require at least admin role
router.use(requireRole('admin'));

// ==================== USER MANAGEMENT ====================

// Get all users
router.get('/users', requirePermission('users', 'read'), async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search, isActive } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) {
      where[Op.or] = [
        { username: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password'] }
    });

    await AuditLog.logAction({
      userId: req.user.id,
      action: 'View users list',
      category: 'user_management',
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      users,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create new user
router.post('/users', requirePermission('users', 'create'), async (req, res) => {
  try {
    const { username, email, password, role, isActive } = req.body;

    // Validate role hierarchy - can't create users with higher roles
    const roleHierarchy = {
      super_admin: 5,
      admin: 4,
      editor: 3,
      analyst: 2,
      api_user: 1
    };

    if (roleHierarchy[role] > roleHierarchy[req.user.role]) {
      return res.status(403).json({ 
        error: 'Cannot create user with higher role than your own' 
      });
    }

    const user = await User.create({
      username,
      email,
      password,
      role,
      isActive: isActive !== false
    });

    await AuditLog.logAction({
      userId: req.user.id,
      action: 'Create user',
      category: 'user_management',
      entityType: 'User',
      entityId: user.id,
      details: { username, email, role },
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('Create user error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
router.put('/users/:id', requirePermission('users', 'update'), async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role, isActive } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Can't modify super_admin unless you are super_admin
    if (user.role === 'super_admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Cannot modify super admin' });
    }

    const updates = {};
    if (username) updates.username = username;
    if (email) updates.email = email;
    if (role) updates.role = role;
    if (isActive !== undefined) updates.isActive = isActive;

    await user.update(updates);

    await AuditLog.logAction({
      userId: req.user.id,
      action: 'Update user',
      category: 'user_management',
      entityType: 'User',
      entityId: user.id,
      details: updates,
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
router.delete('/users/:id', requireRole('super_admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Can't delete yourself
    if (user.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    await user.destroy();

    await AuditLog.logAction({
      userId: req.user.id,
      action: 'Delete user',
      category: 'user_management',
      entityType: 'User',
      entityId: id,
      details: { username: user.username, email: user.email },
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ==================== API KEY MANAGEMENT ====================

// Get all API keys
router.get('/api-keys', requirePermission('api_keys', 'read'), async (req, res) => {
  try {
    const { page = 1, limit = 20, userId, isActive } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (userId) where.userId = userId;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const { count, rows: apiKeys } = await ApiKey.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        attributes: ['id', 'username', 'email']
      }]
    });

    res.json({
      apiKeys,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Get API keys error:', error);
    res.status(500).json({ error: 'Failed to fetch API keys' });
  }
});

// Create API key
router.post('/api-keys', requirePermission('api_keys', 'create'), async (req, res) => {
  try {
    const { name, userId, permissions, rateLimit, expiresIn, allowedIPs } = req.body;

    // Generate API key
    const key = 'cg_' + crypto.randomBytes(32).toString('hex');

    const expiresAt = expiresIn ? 
      new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000) : 
      null;

    const apiKey = await ApiKey.create({
      name,
      key,
      userId: userId || req.user.id,
      permissions: permissions || { read: true, write: false, delete: false },
      rateLimit: rateLimit || 1000,
      expiresAt,
      allowedIPs: allowedIPs || []
    });

    await AuditLog.logAction({
      userId: req.user.id,
      action: 'Create API key',
      category: 'api_key',
      entityType: 'ApiKey',
      entityId: apiKey.id,
      details: { name, userId: apiKey.userId },
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    // Return the full key only once
    res.status(201).json({
      ...apiKey.toJSON(),
      key // Full key shown only on creation
    });
  } catch (error) {
    console.error('Create API key error:', error);
    res.status(500).json({ error: 'Failed to create API key' });
  }
});

// Update API key
router.put('/api-keys/:id', requirePermission('api_keys', 'update'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, permissions, rateLimit, isActive, allowedIPs } = req.body;

    const apiKey = await ApiKey.findByPk(id);
    if (!apiKey) {
      return res.status(404).json({ error: 'API key not found' });
    }

    const updates = {};
    if (name) updates.name = name;
    if (permissions) updates.permissions = permissions;
    if (rateLimit) updates.rateLimit = rateLimit;
    if (isActive !== undefined) updates.isActive = isActive;
    if (allowedIPs) updates.allowedIPs = allowedIPs;

    await apiKey.update(updates);

    await AuditLog.logAction({
      userId: req.user.id,
      action: 'Update API key',
      category: 'api_key',
      entityType: 'ApiKey',
      entityId: apiKey.id,
      details: updates,
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json(apiKey);
  } catch (error) {
    console.error('Update API key error:', error);
    res.status(500).json({ error: 'Failed to update API key' });
  }
});

// Delete API key
router.delete('/api-keys/:id', requirePermission('api_keys', 'delete'), async (req, res) => {
  try {
    const { id } = req.params;

    const apiKey = await ApiKey.findByPk(id);
    if (!apiKey) {
      return res.status(404).json({ error: 'API key not found' });
    }

    await apiKey.destroy();

    await AuditLog.logAction({
      userId: req.user.id,
      action: 'Delete API key',
      category: 'api_key',
      entityType: 'ApiKey',
      entityId: id,
      details: { name: apiKey.name },
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ message: 'API key deleted successfully' });
  } catch (error) {
    console.error('Delete API key error:', error);
    res.status(500).json({ error: 'Failed to delete API key' });
  }
});

// ==================== SITE MANAGEMENT ====================

// Get all sites
router.get('/sites', requirePermission('sites', 'read'), async (req, res) => {
  try {
    const { page = 1, limit = 20, platform, syncStatus } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (platform) where.platform = platform;
    if (syncStatus) where.syncStatus = syncStatus;

    const { count, rows: sites } = await Site.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        as: 'addedBy',
        attributes: ['id', 'username', 'email']
      }]
    });

    res.json({
      sites,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Get sites error:', error);
    res.status(500).json({ error: 'Failed to fetch sites' });
  }
});

// Add new site
router.post('/sites', requirePermission('sites', 'create'), async (req, res) => {
  try {
    const { name, platform, platformId, accessToken, settings } = req.body;

    const site = await Site.create({
      name,
      platform: platform || 'facebook',
      platformId,
      accessToken,
      addedByUserId: req.user.id,
      settings: settings || {
        autoSync: true,
        syncInterval: 'daily',
        dataRetention: 90,
        notifications: {
          syncErrors: true,
          newContent: false
        }
      }
    });

    await AuditLog.logAction({
      userId: req.user.id,
      action: 'Add site',
      category: 'site_management',
      entityType: 'Site',
      entityId: site.id,
      details: { name, platform, platformId },
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(201).json(site);
  } catch (error) {
    console.error('Add site error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Site already exists' });
    }
    res.status(500).json({ error: 'Failed to add site' });
  }
});

// Update site
router.put('/sites/:id', requirePermission('sites', 'update'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, settings, syncStatus, accessToken } = req.body;

    const site = await Site.findByPk(id);
    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }

    const updates = {};
    if (name) updates.name = name;
    if (settings) updates.settings = { ...site.settings, ...settings };
    if (syncStatus) updates.syncStatus = syncStatus;
    if (accessToken) updates.accessToken = accessToken;

    await site.update(updates);

    await AuditLog.logAction({
      userId: req.user.id,
      action: 'Update site',
      category: 'site_management',
      entityType: 'Site',
      entityId: site.id,
      details: updates,
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json(site);
  } catch (error) {
    console.error('Update site error:', error);
    res.status(500).json({ error: 'Failed to update site' });
  }
});

// Delete site and associated data
router.delete('/sites/:id', requirePermission('sites', 'delete'), async (req, res) => {
  try {
    const { id } = req.params;
    const { deleteData = false } = req.query;

    const site = await Site.findByPk(id);
    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }

    if (deleteData) {
      // Delete all posts associated with this site
      await Post.destroy({ where: { siteId: id } });
    }

    await site.destroy();

    await AuditLog.logAction({
      userId: req.user.id,
      action: 'Delete site',
      category: 'site_management',
      entityType: 'Site',
      entityId: id,
      details: { name: site.name, deleteData },
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ message: 'Site deleted successfully' });
  } catch (error) {
    console.error('Delete site error:', error);
    res.status(500).json({ error: 'Failed to delete site' });
  }
});

// ==================== AUDIT LOGS ====================

// Get audit logs
router.get('/audit-logs', requirePermission('system', 'read'), async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      userId, 
      category, 
      status,
      startDate,
      endDate 
    } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (userId) where.userId = userId;
    if (category) where.category = category;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const { count, rows: logs } = await AuditLog.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        attributes: ['id', 'username', 'email']
      }]
    });

    res.json({
      logs,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// ==================== SYSTEM STATS ====================

// Get system statistics
router.get('/stats', async (req, res) => {
  try {
    const [
      userCount,
      activeUserCount,
      apiKeyCount,
      siteCount,
      postCount,
      artistCount
    ] = await Promise.all([
      User.count(),
      User.count({ where: { isActive: true } }),
      ApiKey.count({ where: { isActive: true } }),
      Site.count({ where: { isActive: true } }),
      Post.count(),
      Artist.count()
    ]);

    const recentActivity = await AuditLog.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        attributes: ['username']
      }]
    });

    res.json({
      stats: {
        users: { total: userCount, active: activeUserCount },
        apiKeys: apiKeyCount,
        sites: siteCount,
        posts: postCount,
        artists: artistCount
      },
      recentActivity
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;