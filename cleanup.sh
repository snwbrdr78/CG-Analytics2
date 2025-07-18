#!/bin/bash

# Comedy Genius Analytics Cleanup Script
# Removes temporary files and old logs

echo "Starting cleanup..."

# Clean up log files older than 7 days
if [ -d "logs" ]; then
    echo "Cleaning up old log files..."
    find logs -name "*.log" -type f -mtime +7 -delete 2>/dev/null
    
    # Truncate current log files if they're too large (>10MB)
    for log in logs/*.log; do
        if [ -f "$log" ]; then
            size=$(du -b "$log" | cut -f1)
            if [ "$size" -gt 10485760 ]; then
                echo "Truncating large log file: $log"
                echo "$(tail -n 1000 "$log")" > "$log"
            fi
        fi
    done
fi

# Remove temporary files
echo "Removing temporary files..."
find . -name "*.tmp" -o -name "*.temp" -o -name "*~" -o -name ".DS_Store" -type f -delete 2>/dev/null

# Clean up node_modules cache
echo "Cleaning npm cache..."
npm cache clean --force 2>/dev/null || true

# Remove old PM2 logs
echo "Cleaning PM2 logs..."
pm2 flush 2>/dev/null || true

# Clean up upload directory (files older than 30 days)
if [ -d "backend/uploads" ]; then
    echo "Cleaning old upload files..."
    find backend/uploads -name "*.csv" -type f -mtime +30 -delete 2>/dev/null
fi

# Remove empty directories
echo "Removing empty directories..."
find . -type d -empty -not -path "./.git/*" -delete 2>/dev/null

# Show disk usage after cleanup
echo ""
echo "Cleanup completed!"
echo "Current disk usage:"
du -sh . 2>/dev/null

echo ""
echo "Log directory size:"
du -sh logs/ 2>/dev/null || echo "No logs directory"