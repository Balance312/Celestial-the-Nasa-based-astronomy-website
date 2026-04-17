/**
 * Centralized logging utility for consistent error tracking
 * Can be extended to send logs to monitoring service (Sentry, DataDog, etc.)
 */

const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
};

/**
 * Format log message with timestamp and level
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {any} data - Additional data to log
 * @returns {string} Formatted log message
 */
function formatLog(level, message, data) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level}]`;
  return data ? `${prefix} ${message} - ${JSON.stringify(data)}` : `${prefix} ${message}`;
}

/**
 * Log debug message
 * @param {string} message - Log message
 * @param {any} data - Additional data
 */
export function logDebug(message, data) {
  if (import.meta.env.DEV) {
    console.debug(formatLog(LOG_LEVELS.DEBUG, message, data));
  }
}

/**
 * Log info message
 * @param {string} message - Log message
 * @param {any} data - Additional data
 */
export function logInfo(message, data) {
  console.info(formatLog(LOG_LEVELS.INFO, message, data));
}

/**
 * Log warning message
 * @param {string} message - Log message
 * @param {any} data - Additional data
 */
export function logWarn(message, data) {
  console.warn(formatLog(LOG_LEVELS.WARN, message, data));
}

/**
 * Log error message
 * @param {string} message - Log message
 * @param {Error} error - Error object or additional data
 */
export function logError(message, error) {
  console.error(formatLog(LOG_LEVELS.ERROR, message, error));
  
  // In production, could send to monitoring service here
  // Example: Sentry.captureException(error);
}

/**
 * Create a standardized error message for API failures
 * @param {Error} error - The error object
 * @returns {string} User-friendly error message
 */
export function getApiErrorMessage(error) {
  if (error.message.includes('503')) {
    return 'NASA API temporarily unavailable. Retrying... If this persists, please try again later.';
  }
  if (error.message.includes('502')) {
    return 'Bad gateway error from NASA API. Please try again in a few moments.';
  }
  if (error.message.includes('429')) {
    return 'API rate limit reached. Please wait a moment before trying again.';
  }
  if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
    return 'Network error. Please check your connection and try again.';
  }
  if (error.message.includes('401') || error.message.includes('403')) {
    return 'Invalid or expired API key. Please check your configuration.';
  }
  return 'An error occurred while fetching data. Please try again.';
}
