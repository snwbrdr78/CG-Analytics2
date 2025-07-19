class InsightsModule {
  constructor(apiService) {
    this.api = apiService;
  }

  async getPageInsights(pageId, options = {}) {
    const {
      metrics = [
        'page_impressions',
        'page_impressions_unique',
        'page_engaged_users',
        'page_post_engagements',
        'page_video_views',
        'page_daily_follows',
        'page_daily_unfollows',
        'page_fans',
        'page_fans_locale',
        'page_fans_city',
        'page_fans_country',
        'page_fans_gender_age',
        'page_views_total',
        'page_video_complete_views_30s',
        'page_video_repeat_views'
      ],
      period = 'day',
      since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      until = new Date()
    } = options;

    const pageToken = await this.api.getPageToken(pageId);
    const params = {
      metric: metrics.join(','),
      period,
      since: Math.floor(since.getTime() / 1000),
      until: Math.floor(until.getTime() / 1000),
      access_token: pageToken
    };

    const response = await this.api.makeRequest(`/${pageId}/insights`, 'GET', null, params);
    return this.processInsights(response.data);
  }

  async getVideoInsights(videoId, options = {}) {
    const {
      metrics = [
        'total_video_impressions',
        'total_video_views',
        'total_video_complete_views',
        'total_video_10s_views',
        'total_video_30s_views',
        'total_video_avg_time_watched',
        'total_video_view_total_time',
        'total_video_views_clicked_to_play',
        'total_video_views_sound_on',
        'total_video_retention_graph',
        'total_video_reactions_by_type_total'
      ]
    } = options;

    const params = {
      metric: metrics.join(',')
    };

    const response = await this.api.makeRequest(`/${videoId}/video_insights`, 'GET', null, params);
    return this.processInsights(response.data);
  }

  async getAudienceInsights(pageId) {
    const insights = await this.getPageInsights(pageId, {
      metrics: [
        'page_fans_locale',
        'page_fans_city',
        'page_fans_country',
        'page_fans_gender_age',
        'page_fans_online'
      ],
      period: 'lifetime'
    });

    return {
      demographics: {
        locale: insights.page_fans_locale || {},
        city: insights.page_fans_city || {},
        country: insights.page_fans_country || {},
        genderAge: insights.page_fans_gender_age || {}
      },
      onlineActivity: insights.page_fans_online || {}
    };
  }

  async getContentPerformance(pageId, options = {}) {
    const { days = 30 } = options;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get all posts
    const posts = await this.api.posts.syncPosts(pageId, { since, limit: 250 });
    
    // Aggregate performance metrics
    const performance = {
      totalPosts: 0,
      totalViews: 0,
      totalEngagement: 0,
      avgEngagementRate: 0,
      topPerformers: [],
      contentTypeBreakdown: {},
      bestPostingTimes: {},
      engagementTrends: []
    };

    // Process each post
    for (const post of posts) {
      performance.totalPosts++;
      
      // Add to content type breakdown
      const type = post.postType || 'other';
      if (!performance.contentTypeBreakdown[type]) {
        performance.contentTypeBreakdown[type] = {
          count: 0,
          totalViews: 0,
          totalEngagement: 0
        };
      }
      
      performance.contentTypeBreakdown[type].count++;
      performance.contentTypeBreakdown[type].totalViews += post.views || 0;
      performance.contentTypeBreakdown[type].totalEngagement += post.engagement || 0;
    }

    return performance;
  }

  async getRealtimeMetrics(pageId) {
    const params = {
      fields: 'talking_about_count,were_here_count,fan_count,unread_message_count,unread_notif_count'
    };

    return await this.api.makeRequest(`/${pageId}`, 'GET', null, params);
  }

  async exportInsights(pageId, format = 'json', options = {}) {
    const insights = await this.getPageInsights(pageId, options);
    
    switch (format) {
      case 'csv':
        return this.convertToCSV(insights);
      case 'excel':
        return this.convertToExcel(insights);
      default:
        return insights;
    }
  }

  processInsights(data) {
    const processed = {};
    
    data.forEach(insight => {
      const { name, period, values } = insight;
      
      processed[name] = {
        period,
        data: values.map(v => ({
          value: v.value,
          date: v.end_time
        }))
      };
      
      // Add summary statistics
      const numbers = values.map(v => typeof v.value === 'number' ? v.value : 0);
      processed[name].summary = {
        total: numbers.reduce((a, b) => a + b, 0),
        average: numbers.length ? numbers.reduce((a, b) => a + b, 0) / numbers.length : 0,
        min: Math.min(...numbers),
        max: Math.max(...numbers)
      };
    });
    
    return processed;
  }

  convertToCSV(data) {
    const rows = [];
    rows.push('Metric,Period,Date,Value');
    
    Object.entries(data).forEach(([metric, info]) => {
      info.data.forEach(point => {
        rows.push(`${metric},${info.period},${point.date},${point.value}`);
      });
    });
    
    return rows.join('\n');
  }

  async getBenchmarks(pageId, industryCategory) {
    // Compare page performance against industry benchmarks
    const pageInsights = await this.getPageInsights(pageId);
    
    // This would typically call a benchmark API or database
    const benchmarks = {
      engagementRate: {
        industry: 0.09, // 9% average
        page: this.calculateEngagementRate(pageInsights)
      },
      videoCompletionRate: {
        industry: 0.30, // 30% average
        page: this.calculateVideoCompletionRate(pageInsights)
      },
      responseTime: {
        industry: 3600, // 1 hour in seconds
        page: pageInsights.page_response_time?.summary?.average || 0
      }
    };
    
    return benchmarks;
  }

  calculateEngagementRate(insights) {
    const engagement = insights.page_engaged_users?.summary?.total || 0;
    const reach = insights.page_impressions_unique?.summary?.total || 1;
    return engagement / reach;
  }

  calculateVideoCompletionRate(insights) {
    const completeViews = insights.page_video_complete_views_30s?.summary?.total || 0;
    const totalViews = insights.page_video_views?.summary?.total || 1;
    return completeViews / totalViews;
  }
}

module.exports = InsightsModule;