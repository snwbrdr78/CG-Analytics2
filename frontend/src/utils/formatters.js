/**
 * Number and currency formatting utilities
 */

/**
 * Format currency with proper comma separation and dollar sign
 * @param {number} value - The number to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value, decimals = 2) {
  if (value === null || value === undefined) return '$0.00'
  
  const number = parseFloat(value)
  if (isNaN(number)) return '$0.00'
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number)
}

/**
 * Format large numbers with K, M, B suffixes
 * @param {number} value - The number to format
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted number string
 */
export function formatCompactNumber(value, decimals = 1) {
  if (value === null || value === undefined) return '0'
  
  const number = parseFloat(value)
  if (isNaN(number)) return '0'
  
  if (Math.abs(number) < 1000) {
    return number.toFixed(0)
  }
  
  const units = ['K', 'M', 'B', 'T']
  const unitIndex = Math.floor(Math.log10(Math.abs(number)) / 3) - 1
  const unitValue = 1000 ** (unitIndex + 1)
  
  const formattedNumber = (number / unitValue).toFixed(decimals)
  return `${formattedNumber}${units[unitIndex]}`
}

/**
 * Format currency with smart abbreviation for large values
 * @param {number} value - The number to format
 * @param {boolean} forceCompact - Always use compact format
 * @returns {string} Formatted currency string
 */
export function formatSmartCurrency(value, forceCompact = false) {
  if (value === null || value === undefined) return '$0'
  
  const number = parseFloat(value)
  if (isNaN(number)) return '$0'
  
  // For values under 10k, show full currency
  if (Math.abs(number) < 10000 && !forceCompact) {
    return formatCurrency(number, number % 1 === 0 ? 0 : 2)
  }
  
  // For larger values, use compact format
  const compact = formatCompactNumber(number)
  return `$${compact}`
}

/**
 * Format number with comma separation
 * @param {number} value - The number to format
 * @param {number} decimals - Number of decimal places (default: 0)
 * @returns {string} Formatted number string
 */
export function formatNumber(value, decimals = 0) {
  if (value === null || value === undefined) return '0'
  
  const number = parseFloat(value)
  if (isNaN(number)) return '0'
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number)
}

/**
 * Format percentage
 * @param {number} value - The number to format (0-100)
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage string
 */
export function formatPercentage(value, decimals = 1) {
  if (value === null || value === undefined) return '0%'
  
  const number = parseFloat(value)
  if (isNaN(number)) return '0%'
  
  return `${number.toFixed(decimals)}%`
}

/**
 * Format time duration (seconds to human readable)
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration string
 */
export function formatDuration(seconds) {
  if (!seconds || seconds < 0) return '0s'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  } else {
    return `${secs}s`
  }
}

/**
 * Format views/engagement numbers with smart abbreviation
 * @param {number} value - The number to format
 * @returns {string} Formatted number string
 */
export function formatViews(value) {
  if (value === null || value === undefined) return '0'
  
  const number = parseFloat(value)
  if (isNaN(number)) return '0'
  
  // For values under 10k, show full number with commas
  if (Math.abs(number) < 10000) {
    return formatNumber(number)
  }
  
  // For larger values, use compact format
  return formatCompactNumber(number)
}

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @param {boolean} includeTime - Include time in format
 * @returns {string} Formatted date string
 */
export function formatDate(date, includeTime = false) {
  if (!date) return ''
  
  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) return ''
  
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }
  
  if (includeTime) {
    options.hour = '2-digit'
    options.minute = '2-digit'
  }
  
  return new Intl.DateTimeFormat('en-US', options).format(dateObj)
}

/**
 * Get appropriate decimal places based on value size
 * @param {number} value - The number to check
 * @returns {number} Recommended decimal places
 */
export function getSmartDecimals(value) {
  const absValue = Math.abs(value)
  if (absValue >= 1000) return 0
  if (absValue >= 100) return 1
  if (absValue >= 10) return 2
  return 2
}