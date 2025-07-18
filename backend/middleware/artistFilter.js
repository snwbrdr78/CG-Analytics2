const { Op } = require('sequelize');

// Middleware to apply artist filtering for users with artist role
const applyArtistFilter = (modelName) => {
  return (req, res, next) => {
    // Only apply filter if user has artist role
    if (req.user && req.user.role === 'artist' && req.user.artistId) {
      // Store the artist filter in the request for use in routes
      req.artistFilter = {
        artistId: req.user.artistId
      };
      
      // For queries that need to filter by artist
      req.applyArtistFilter = (where = {}) => {
        if (modelName === 'Post' || modelName === 'Delta' || modelName === 'Reports') {
          // Posts and related data filter by artistId
          return {
            ...where,
            artistId: req.user.artistId
          };
        } else if (modelName === 'Artist') {
          // Artists can only see their own artist record
          return {
            ...where,
            id: req.user.artistId
          };
        }
        return where;
      };
      
      // For include queries that need artist filtering
      req.getArtistInclude = () => {
        if (modelName === 'Post') {
          return {
            model: require('../models').Artist,
            where: { id: req.user.artistId },
            required: true
          };
        }
        return null;
      };
    } else {
      // For non-artist users, no filtering
      req.applyArtistFilter = (where) => where;
      req.getArtistInclude = () => null;
    }
    
    next();
  };
};

// Check if user can access a specific artist's data
const canAccessArtist = (req, artistId) => {
  if (!req.user) return false;
  
  // Non-artist roles can access all artists
  if (req.user.role !== 'artist') return true;
  
  // Artist role can only access their own artist
  return req.user.artistId === artistId;
};

// Middleware to check artist access for specific routes
const checkArtistAccess = async (req, res, next) => {
  if (req.user && req.user.role === 'artist') {
    const artistId = req.params.artistId || req.body.artistId || req.query.artistId;
    
    if (artistId && artistId !== req.user.artistId) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'You can only access data for your associated artist'
      });
    }
  }
  
  next();
};

module.exports = {
  applyArtistFilter,
  canAccessArtist,
  checkArtistAccess
};