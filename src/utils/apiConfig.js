/**
 * Centralized API configuration
 * Single source of truth for NASA API key and validation
 */

import { API_ERROR_MESSAGES } from '../constants/apod.js';

/**
 * Get NASA API key from environment
 * @returns {string} The API key
 * @throws {Error} If API key is not configured
 */
export const getNasaApiKey = () => {
  const key = import.meta.env.VITE_NASA_API_KEY;
  
  if (!key) {
    throw new Error(API_ERROR_MESSAGES.CONFIGURED);
  }
  
  return key;
};

/**
 * Validate API key is configured before making requests
 * Provides early failure with helpful error message
 * @returns {boolean} True if key is valid
 * @throws {Error} If key is missing
 */
export const validateApiKey = () => {
  getNasaApiKey(); // This will throw if not configured
  return true;
};
