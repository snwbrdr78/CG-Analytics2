const fs = require('fs');
const { parse } = require('csv-parse');
const dayjs = require('dayjs');

class FacebookCSVParser {
  constructor() {
    // Map Facebook column names to our database fields
    this.columnMapping = {
      'Post ID': 'postId',
      'Page ID': 'pageId',
      'Page name': 'pageName',
      'Title': 'title',
      'Description': 'description',
      'Duration (sec)': 'duration',
      'Publish time': 'publishTime',
      'Caption type': 'captionType',
      'Permalink': 'permalink',
      'Post type': 'postType',
      'Custom labels': 'assetTag',
      'Date': 'reportDate',
      'Reactions, Comments and Shares': 'totalEngagement',
      'Reactions': 'reactions',
      'Comments': 'comments',
      'Shares': 'shares',
      'Seconds viewed': 'secondsViewed',
      'Average Seconds viewed': 'avgSecondsViewed',
      'Estimated earnings (USD)': 'estimatedEarnings',
      'Approximate content monetization earnings': 'approximateEarnings',
      'Qualified Views': 'qualifiedViews',
      '3-Second Video Views': 'threeSecondViews',
      '1-Minute Video Views': 'oneMinuteViews'
    };
  }

  async parseFile(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      const parser = parse({
        columns: true,
        skip_empty_lines: true,
        trim: true,
        cast: (value, context) => {
          // Auto-cast numbers
          if (context.header) return value;
          if (value === '' || value === 'N/A') return null;
          
          const num = Number(value.replace(/[$,]/g, ''));
          if (!isNaN(num) && value.match(/^[\d$,.-]+$/)) {
            return num;
          }
          return value;
        }
      });

      parser.on('readable', function() {
        let record;
        while ((record = parser.read()) !== null) {
          results.push(record);
        }
      });

      parser.on('error', function(err) {
        reject(err);
      });

      parser.on('end', function() {
        resolve(results);
      });

      fs.createReadStream(filePath).pipe(parser);
    });
  }

  transformRow(row) {
    const transformed = {};
    
    // Map columns using our mapping
    for (const [fbColumn, ourField] of Object.entries(this.columnMapping)) {
      if (row[fbColumn] !== undefined) {
        transformed[ourField] = row[fbColumn];
      }
    }

    // Parse dates
    if (transformed.publishTime) {
      transformed.publishTime = this.parseDate(transformed.publishTime);
    }
    if (transformed.reportDate) {
      transformed.reportDate = this.parseDate(transformed.reportDate);
    }

    // Determine which earnings column to use
    transformed.earnings = this.getEarnings(row, transformed);

    // Normalize post type
    if (transformed.postType) {
      transformed.postType = this.normalizePostType(transformed.postType);
    }

    // Extract quarter from date range if available
    transformed.quarterRange = this.extractQuarter(row);

    return transformed;
  }

  parseDate(dateStr) {
    if (!dateStr) return null;
    
    // Handle various Facebook date formats
    const formats = [
      'YYYY-MM-DD HH:mm:ss',
      'YYYY-MM-DD',
      'MM/DD/YYYY HH:mm:ss',
      'MM/DD/YYYY'
    ];

    for (const format of formats) {
      const parsed = dayjs(dateStr, format);
      if (parsed.isValid()) {
        return parsed.toDate();
      }
    }
    
    // Fallback to JS Date parsing
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  }

  getEarnings(row, transformed) {
    // Use approximate earnings for posts after April 2025
    if (transformed.publishTime && dayjs(transformed.publishTime).isAfter('2025-04-01')) {
      return transformed.approximateEarnings || 0;
    }
    // Use estimated earnings for older posts
    return transformed.estimatedEarnings || transformed.approximateEarnings || 0;
  }

  normalizePostType(type) {
    const normalized = type.toLowerCase();
    if (normalized.includes('video')) return 'Video';
    if (normalized.includes('reel')) return 'Reel';
    if (normalized.includes('photo')) return 'Photo';
    return type;
  }

  extractQuarter(row) {
    // Try to extract from filename or date range columns
    const dateStr = row['Date'] || '';
    const match = dateStr.match(/(\d{4})-(\d{2})/);
    if (match) {
      const year = match[1];
      const month = parseInt(match[2]);
      const quarter = Math.ceil(month / 3);
      return `${year}-Q${quarter}`;
    }
    return null;
  }

  async processFile(filePath) {
    try {
      const rawData = await this.parseFile(filePath);
      const transformed = rawData.map(row => this.transformRow(row));
      
      // Group by post for lifetime aggregation
      const postGroups = this.groupByPost(transformed);
      
      return {
        raw: transformed,
        aggregated: postGroups,
        metadata: {
          totalRows: rawData.length,
          uniquePosts: Object.keys(postGroups).length,
          dateRange: this.getDateRange(transformed)
        }
      };
    } catch (error) {
      throw new Error(`Failed to process CSV: ${error.message}`);
    }
  }

  groupByPost(rows) {
    const groups = {};
    
    for (const row of rows) {
      if (!row.postId) continue;
      
      if (!groups[row.postId]) {
        groups[row.postId] = {
          ...row,
          snapshots: []
        };
      }
      
      // Add snapshot data
      groups[row.postId].snapshots.push({
        date: row.reportDate,
        earnings: row.earnings,
        qualifiedViews: row.qualifiedViews,
        secondsViewed: row.secondsViewed,
        engagement: {
          reactions: row.reactions,
          comments: row.comments,
          shares: row.shares
        }
      });
      
      // Update lifetime totals (take max values)
      groups[row.postId].lifetimeEarnings = Math.max(
        groups[row.postId].lifetimeEarnings || 0,
        row.earnings || 0
      );
      groups[row.postId].lifetimeQualifiedViews = Math.max(
        groups[row.postId].lifetimeQualifiedViews || 0,
        row.qualifiedViews || 0
      );
      groups[row.postId].lifetimeSecondsViewed = Math.max(
        groups[row.postId].lifetimeSecondsViewed || 0,
        row.secondsViewed || 0
      );
    }
    
    return groups;
  }

  getDateRange(rows) {
    const dates = rows
      .map(r => r.reportDate)
      .filter(d => d)
      .map(d => new Date(d));
    
    if (dates.length === 0) return null;
    
    return {
      start: new Date(Math.min(...dates)),
      end: new Date(Math.max(...dates))
    };
  }
}

module.exports = FacebookCSVParser;