const { YouTubePlaylists } = require('../../../models');

class PlaylistsModule {
  constructor(config) {
    this.apiService = config.apiService;
    this.siteId = config.siteId;
    this.accessToken = config.accessToken;
    this.youtubeChannelId = config.youtubeChannelId;
  }

  async syncPlaylists() {
    try {
      const response = await this.apiService.makeRequest('/playlists', {
        part: 'snippet,status,contentDetails',
        channelId: this.youtubeChannelId,
        maxResults: 50
      });

      let syncedCount = 0;
      let updatedCount = 0;

      for (const playlistItem of response.items || []) {
        const playlistData = {
          siteId: this.siteId,
          youtubePlaylistId: playlistItem.id,
          title: playlistItem.snippet.title,
          description: playlistItem.snippet.description,
          publishedAt: new Date(playlistItem.snippet.publishedAt),
          privacyStatus: playlistItem.status.privacyStatus,
          itemCount: playlistItem.contentDetails.itemCount,
          thumbnailUrl: playlistItem.snippet.thumbnails?.high?.url
        };

        const [playlist, created] = await YouTubePlaylists.upsert(playlistData);
        if (created) syncedCount++;
        else updatedCount++;
      }

      return { synced: syncedCount, updated: updatedCount };
    } catch (error) {
      console.error('Error syncing YouTube playlists:', error);
      throw error;
    }
  }

  async createPlaylist(playlistData) {
    try {
      const response = await this.apiService.makeRequest('/playlists', {
        part: 'snippet,status'
      }, 'POST', {
        snippet: {
          title: playlistData.title,
          description: playlistData.description || ''
        },
        status: {
          privacyStatus: playlistData.privacyStatus || 'private'
        }
      });

      // Save to database
      await YouTubePlaylists.create({
        siteId: this.siteId,
        youtubePlaylistId: response.id,
        title: playlistData.title,
        description: playlistData.description,
        privacyStatus: playlistData.privacyStatus || 'private',
        publishedAt: new Date()
      });

      return { playlistId: response.id, success: true };
    } catch (error) {
      console.error('Error creating YouTube playlist:', error);
      throw error;
    }
  }

  async getPlaylists() {
    try {
      return await YouTubePlaylists.findAll({
        where: { siteId: this.siteId },
        order: [['publishedAt', 'DESC']]
      });
    } catch (error) {
      console.error('Error getting YouTube playlists:', error);
      throw error;
    }
  }
}

module.exports = PlaylistsModule;