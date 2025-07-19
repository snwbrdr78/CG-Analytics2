'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add fields to Sites table
    await queryInterface.addColumn('Sites', 'scope', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'OAuth scopes/permissions granted'
    });
    
    await queryInterface.addColumn('Sites', 'webhookUrl', {
      type: Sequelize.STRING(500),
      allowNull: true,
      comment: 'Platform webhook endpoint'
    });
    
    await queryInterface.addColumn('Sites', 'webhookSecret', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Webhook verification secret'
    });
    
    await queryInterface.addColumn('Sites', 'businessAccountId', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Business/Ad account ID'
    });
    
    await queryInterface.addColumn('Sites', 'followerCount', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Current follower/subscriber count'
    });
    
    await queryInterface.addColumn('Sites', 'profileImageUrl', {
      type: Sequelize.STRING(500),
      allowNull: true,
      comment: 'Profile/avatar image URL'
    });
    
    await queryInterface.addColumn('Sites', 'coverImageUrl', {
      type: Sequelize.STRING(500),
      allowNull: true,
      comment: 'Cover/banner image URL'
    });
    
    await queryInterface.addColumn('Sites', 'bio', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Channel/page description'
    });
    
    await queryInterface.addColumn('Sites', 'apiQuota', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'API call quota limit'
    });
    
    await queryInterface.addColumn('Sites', 'apiQuotaReset', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'When API quota resets'
    });
    
    // Add fields to Posts table
    await queryInterface.addColumn('Posts', 'thumbnailUrl', {
      type: Sequelize.STRING(500),
      allowNull: true,
      comment: 'Video/post thumbnail URL'
    });
    
    await queryInterface.addColumn('Posts', 'videoUrl', {
      type: Sequelize.STRING(500),
      allowNull: true,
      comment: 'Direct video URL'
    });
    
    await queryInterface.addColumn('Posts', 'aspectRatio', {
      type: Sequelize.STRING(20),
      allowNull: true,
      comment: 'Media aspect ratio (e.g., 16:9)'
    });
    
    await queryInterface.addColumn('Posts', 'resolution', {
      type: Sequelize.STRING(20),
      allowNull: true,
      comment: 'Video resolution (e.g., 1920x1080)'
    });
    
    await queryInterface.addColumn('Posts', 'hashtags', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of hashtags used'
    });
    
    await queryInterface.addColumn('Posts', 'mentions', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of mentioned accounts'
    });
    
    await queryInterface.addColumn('Posts', 'crosspostingStatus', {
      type: Sequelize.JSONB,
      allowNull: true,
      comment: 'Cross-posting status by platform'
    });
    
    await queryInterface.addColumn('Posts', 'originalPlatform', {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: 'Original platform if cross-posted'
    });
    
    await queryInterface.addColumn('Posts', 'monetizationStatus', {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: 'Platform monetization eligibility'
    });
    
    await queryInterface.addColumn('Posts', 'restrictedCountries', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'Countries where content is restricted'
    });
    
    await queryInterface.addColumn('Posts', 'contentCategory', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'Platform content category'
    });
    
    await queryInterface.addColumn('Posts', 'audioCopyright', {
      type: Sequelize.JSONB,
      allowNull: true,
      comment: 'Audio copyright claims info'
    });
    
    await queryInterface.addColumn('Posts', 'privacyStatus', {
      type: Sequelize.ENUM('public', 'private', 'unlisted'),
      allowNull: true,
      defaultValue: 'public',
      comment: 'Content privacy setting'
    });
    
    // Add fields to Snapshots table
    await queryInterface.addColumn('Snapshots', 'impressions', {
      type: Sequelize.BIGINT,
      allowNull: true,
      defaultValue: 0,
      comment: 'Total impressions'
    });
    
    await queryInterface.addColumn('Snapshots', 'reach', {
      type: Sequelize.BIGINT,
      allowNull: true,
      defaultValue: 0,
      comment: 'Unique reach count'
    });
    
    await queryInterface.addColumn('Snapshots', 'saves', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Save/bookmark count'
    });
    
    await queryInterface.addColumn('Snapshots', 'profileVisits', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Profile visits from post'
    });
    
    await queryInterface.addColumn('Snapshots', 'avgWatchPercentage', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Average watch percentage'
    });
    
    await queryInterface.addColumn('Snapshots', 'viewsByCountry', {
      type: Sequelize.JSONB,
      allowNull: true,
      comment: 'Views breakdown by country'
    });
    
    await queryInterface.addColumn('Snapshots', 'demographicData', {
      type: Sequelize.JSONB,
      allowNull: true,
      comment: 'Age, gender, location breakdown'
    });
    
    await queryInterface.addColumn('Snapshots', 'trafficSource', {
      type: Sequelize.JSONB,
      allowNull: true,
      comment: 'Traffic source breakdown'
    });
    
    await queryInterface.addColumn('Snapshots', 'deviceType', {
      type: Sequelize.JSONB,
      allowNull: true,
      comment: 'Device type breakdown'
    });
    
    await queryInterface.addColumn('Snapshots', 'subscribersGained', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Subscribers gained (YouTube)'
    });
    
    await queryInterface.addColumn('Snapshots', 'estimatedCpm', {
      type: Sequelize.DECIMAL(10, 4),
      allowNull: true,
      comment: 'Estimated CPM rate'
    });
    
    // Add fields to Deltas table
    await queryInterface.addColumn('Deltas', 'viewsDelta', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Change in view count'
    });
    
    await queryInterface.addColumn('Deltas', 'reactionsDelta', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Change in reactions'
    });
    
    await queryInterface.addColumn('Deltas', 'commentsDelta', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Change in comments'
    });
    
    await queryInterface.addColumn('Deltas', 'sharesDelta', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Change in shares'
    });
    
    await queryInterface.addColumn('Deltas', 'impressionsDelta', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Change in impressions'
    });
    
    await queryInterface.addColumn('Deltas', 'reachDelta', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Change in reach'
    });
    
    await queryInterface.addColumn('Deltas', 'growthRate', {
      type: Sequelize.DECIMAL(10, 4),
      allowNull: true,
      comment: 'Growth rate percentage'
    });
    
    // Add fields to Artists table
    await queryInterface.addColumn('Artists', 'socialMediaHandles', {
      type: Sequelize.JSONB,
      allowNull: true,
      comment: 'Social media handles by platform'
    });
    
    await queryInterface.addColumn('Artists', 'primaryPlatform', {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: 'Main platform for the artist'
    });
    
    await queryInterface.addColumn('Artists', 'verifiedPlatforms', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'List of verified platform names'
    });
    
    // Create new tables
    await queryInterface.createTable('SyncLogs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      siteId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Sites',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      syncType: {
        type: Sequelize.ENUM('full', 'incremental', 'webhook'),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('started', 'completed', 'failed'),
        allowNull: false,
        defaultValue: 'started'
      },
      startedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      completedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      recordsProcessed: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      recordsFailed: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      errorMessage: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      errorDetails: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      nextCursor: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'Pagination cursor for next sync'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
    
    await queryInterface.createTable('WebhookEvents', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      siteId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Sites',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      platform: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      eventType: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      eventData: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'processed', 'failed'),
        allowNull: false,
        defaultValue: 'pending'
      },
      processedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      retryCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      errorMessage: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
    
    // Add indexes for new fields
    await queryInterface.addIndex('Posts', ['hashtags'], {
      using: 'gin',
      name: 'posts_hashtags_gin_idx'
    });
    
    await queryInterface.addIndex('Posts', ['mentions'], {
      using: 'gin',
      name: 'posts_mentions_gin_idx'
    });
    
    await queryInterface.addIndex('Posts', ['monetizationStatus'], {
      name: 'posts_monetization_status_idx'
    });
    
    await queryInterface.addIndex('Posts', ['privacyStatus'], {
      name: 'posts_privacy_status_idx'
    });
    
    await queryInterface.addIndex('Snapshots', ['impressions'], {
      name: 'snapshots_impressions_idx'
    });
    
    await queryInterface.addIndex('Snapshots', ['reach'], {
      name: 'snapshots_reach_idx'
    });
    
    await queryInterface.addIndex('SyncLogs', ['siteId', 'status'], {
      name: 'sync_logs_site_status_idx'
    });
    
    await queryInterface.addIndex('SyncLogs', ['startedAt'], {
      name: 'sync_logs_started_at_idx'
    });
    
    await queryInterface.addIndex('WebhookEvents', ['siteId', 'status'], {
      name: 'webhook_events_site_status_idx'
    });
    
    await queryInterface.addIndex('WebhookEvents', ['platform', 'eventType'], {
      name: 'webhook_events_platform_type_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove indexes
    await queryInterface.removeIndex('WebhookEvents', 'webhook_events_platform_type_idx');
    await queryInterface.removeIndex('WebhookEvents', 'webhook_events_site_status_idx');
    await queryInterface.removeIndex('SyncLogs', 'sync_logs_started_at_idx');
    await queryInterface.removeIndex('SyncLogs', 'sync_logs_site_status_idx');
    await queryInterface.removeIndex('Snapshots', 'snapshots_reach_idx');
    await queryInterface.removeIndex('Snapshots', 'snapshots_impressions_idx');
    await queryInterface.removeIndex('Posts', 'posts_privacy_status_idx');
    await queryInterface.removeIndex('Posts', 'posts_monetization_status_idx');
    await queryInterface.removeIndex('Posts', 'posts_mentions_gin_idx');
    await queryInterface.removeIndex('Posts', 'posts_hashtags_gin_idx');
    
    // Drop new tables
    await queryInterface.dropTable('WebhookEvents');
    await queryInterface.dropTable('SyncLogs');
    
    // Remove columns from Artists
    await queryInterface.removeColumn('Artists', 'verifiedPlatforms');
    await queryInterface.removeColumn('Artists', 'primaryPlatform');
    await queryInterface.removeColumn('Artists', 'socialMediaHandles');
    
    // Remove columns from Deltas
    await queryInterface.removeColumn('Deltas', 'growthRate');
    await queryInterface.removeColumn('Deltas', 'reachDelta');
    await queryInterface.removeColumn('Deltas', 'impressionsDelta');
    await queryInterface.removeColumn('Deltas', 'sharesDelta');
    await queryInterface.removeColumn('Deltas', 'commentsDelta');
    await queryInterface.removeColumn('Deltas', 'reactionsDelta');
    await queryInterface.removeColumn('Deltas', 'viewsDelta');
    
    // Remove columns from Snapshots
    await queryInterface.removeColumn('Snapshots', 'estimatedCpm');
    await queryInterface.removeColumn('Snapshots', 'subscribersGained');
    await queryInterface.removeColumn('Snapshots', 'deviceType');
    await queryInterface.removeColumn('Snapshots', 'trafficSource');
    await queryInterface.removeColumn('Snapshots', 'demographicData');
    await queryInterface.removeColumn('Snapshots', 'viewsByCountry');
    await queryInterface.removeColumn('Snapshots', 'avgWatchPercentage');
    await queryInterface.removeColumn('Snapshots', 'profileVisits');
    await queryInterface.removeColumn('Snapshots', 'saves');
    await queryInterface.removeColumn('Snapshots', 'reach');
    await queryInterface.removeColumn('Snapshots', 'impressions');
    
    // Remove columns from Posts
    await queryInterface.removeColumn('Posts', 'privacyStatus');
    await queryInterface.removeColumn('Posts', 'audioCopyright');
    await queryInterface.removeColumn('Posts', 'contentCategory');
    await queryInterface.removeColumn('Posts', 'restrictedCountries');
    await queryInterface.removeColumn('Posts', 'monetizationStatus');
    await queryInterface.removeColumn('Posts', 'originalPlatform');
    await queryInterface.removeColumn('Posts', 'crosspostingStatus');
    await queryInterface.removeColumn('Posts', 'mentions');
    await queryInterface.removeColumn('Posts', 'hashtags');
    await queryInterface.removeColumn('Posts', 'resolution');
    await queryInterface.removeColumn('Posts', 'aspectRatio');
    await queryInterface.removeColumn('Posts', 'videoUrl');
    await queryInterface.removeColumn('Posts', 'thumbnailUrl');
    
    // Remove columns from Sites
    await queryInterface.removeColumn('Sites', 'apiQuotaReset');
    await queryInterface.removeColumn('Sites', 'apiQuota');
    await queryInterface.removeColumn('Sites', 'bio');
    await queryInterface.removeColumn('Sites', 'coverImageUrl');
    await queryInterface.removeColumn('Sites', 'profileImageUrl');
    await queryInterface.removeColumn('Sites', 'followerCount');
    await queryInterface.removeColumn('Sites', 'businessAccountId');
    await queryInterface.removeColumn('Sites', 'webhookSecret');
    await queryInterface.removeColumn('Sites', 'webhookUrl');
    await queryInterface.removeColumn('Sites', 'scope');
  }
};