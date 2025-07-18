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
      '1-Minute Video Views': 'oneMinuteViews',
      'Views': 'views'
    };
  }

  async parseFile(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      const parser = parse({
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true, // Handle UTF-8 BOM
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

    // Handle views data - only for videos and reels
    if (transformed.postType === 'Video' || transformed.postType === 'Reel') {
      const viewsResult = this.getViewsData(row, transformed);
      transformed.views = viewsResult.views;
      transformed.viewsSource = viewsResult.source;
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
    let totalEarnings = 0;
    
    // Known earnings columns
    const knownEarningsColumns = [
      'estimatedEarnings',
      'approximateEarnings'
    ];
    
    // Add up all known earnings columns
    knownEarningsColumns.forEach(col => {
      if (transformed[col] && !isNaN(transformed[col])) {
        totalEarnings += parseFloat(transformed[col]);
      }
    });
    
    // If no earnings found in known columns, search for other potential earnings columns
    if (totalEarnings === 0) {
      // Look for any column containing "earning" or "revenue" or "monetization"
      for (const [key, value] of Object.entries(row)) {
        const lowerKey = key.toLowerCase();
        if ((lowerKey.includes('earning') || 
             lowerKey.includes('revenue') || 
             lowerKey.includes('monetization')) &&
            !lowerKey.includes('estimated') &&
            !lowerKey.includes('approximate') &&
            value && !isNaN(value)) {
          console.log(`Found potential earnings column: "${key}" with value: ${value}`);
          totalEarnings += parseFloat(String(value).replace(/[$,]/g, ''));
        }
      }
    }
    
    return totalEarnings;
  }

  normalizePostType(type) {
    const normalized = type.toLowerCase();
    if (normalized.includes('video')) return 'Video';
    if (normalized.includes('reel')) return 'Reel';
    if (normalized.includes('photo')) return 'Photo';
    return type;
  }

  getViewsData(row, transformed) {
    // Check if we have a direct "Views" column
    if (transformed.views !== undefined && transformed.views !== null) {
      return {
        views: transformed.views,
        source: 'views'
      };
    }
    
    // Fallback to 1-minute video views
    if (transformed.oneMinuteViews !== undefined && transformed.oneMinuteViews !== null) {
      return {
        views: transformed.oneMinuteViews,
        source: '1-minute'
      };
    }
    
    // No views data available
    return {
      views: 0,
      source: 'none'
    };
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
      
      // Log column headers from first row
      if (rawData.length > 0) {
        const headers = Object.keys(rawData[0]);
        console.log('\n📊 CSV Column Analysis:');
        console.log('Total columns:', headers.length);
        
        // Check for earnings columns
        const earningsColumns = headers.filter(h => 
          h.toLowerCase().includes('earning') || 
          h.toLowerCase().includes('revenue') ||
          h.toLowerCase().includes('monetization')
        );
        
        if (earningsColumns.length > 0) {
          console.log('Earnings columns found:', earningsColumns);
          
          // Sample values from first row
          earningsColumns.forEach(col => {
            console.log(`  ${col}: ${rawData[0][col]}`);
          });
        } else {
          console.log('⚠️  No standard earnings columns found');
        }
        
        // Check for views columns
        const viewsColumns = headers.filter(h => 
          h === 'Views' || 
          h === '1-Minute Video Views' ||
          h.toLowerCase().includes('view')
        );
        
        if (viewsColumns.length > 0) {
          console.log('\nViews columns found:', viewsColumns);
          const hasDirectViews = headers.includes('Views');
          const has1MinuteViews = headers.includes('1-Minute Video Views');
          
          if (hasDirectViews) {
            console.log('✅ Using "Views" column for video/reel view counts');
          } else if (has1MinuteViews) {
            console.log('⚠️  "Views" column not found, will use "1-Minute Video Views" as fallback');
          }
        }
      }
      
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