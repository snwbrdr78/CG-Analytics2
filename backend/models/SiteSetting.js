const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SiteSetting = sequelize.define('SiteSetting', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  siteId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Sites',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  settingKey: {
    type: DataTypes.STRING,
    allowNull: false
  },
  settingValue: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  settingType: {
    type: DataTypes.ENUM('boolean', 'string', 'number', 'json'),
    defaultValue: 'string'
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['siteId', 'settingKey']
    }
  ]
});

// Helper method to get typed value
SiteSetting.prototype.getValue = function() {
  switch (this.settingType) {
    case 'boolean':
      return this.settingValue === 'true';
    case 'number':
      return parseFloat(this.settingValue);
    case 'json':
      try {
        return JSON.parse(this.settingValue);
      } catch {
        return null;
      }
    default:
      return this.settingValue;
  }
};

// Helper method to set typed value
SiteSetting.prototype.setValue = function(value) {
  switch (this.settingType) {
    case 'boolean':
      this.settingValue = value.toString();
      break;
    case 'number':
      this.settingValue = value.toString();
      break;
    case 'json':
      this.settingValue = JSON.stringify(value);
      break;
    default:
      this.settingValue = value;
  }
};

module.exports = SiteSetting;