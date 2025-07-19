const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Artist = sequelize.define('Artist', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  royaltyRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  email: {
    type: DataTypes.STRING,
    validate: {
      isEmail: true
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  },
  notes: {
    type: DataTypes.TEXT
  },
  // Social media presence
  socialMediaHandles: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Social media handles by platform'
  },
  primaryPlatform: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Main platform for the artist'
  },
  verifiedPlatforms: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
    comment: 'List of verified platform names'
  }
}, {
  timestamps: true
});

module.exports = Artist;