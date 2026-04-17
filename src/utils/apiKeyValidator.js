/**
 * API key validation and utility functions
 */

/**
 * Validate NASA API key format
 * NASA API keys are typically 40 character alphanumeric strings
 * 
 * @param {string} apiKey - The API key to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function isValidNasaApiKey(apiKey) {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }

  // NASA API keys are typically 40 characters of alphanumeric
  const apiKeyPattern = /^[a-zA-Z0-9]{40}$/;
  return apiKeyPattern.test(apiKey.trim());
}

/**
 * Get and validate NASA API key from environment
 * 
 * @returns {Object} { key: string, isValid: boolean, error: string|null }
 */
export function getValidatedApiKey() {
  const apiKey = import.meta.env.VITE_NASA_API_KEY;

  if (!apiKey) {
    return {
      key: null,
      isValid: false,
      error: 'NASA API key is not configured. Please set VITE_NASA_API_KEY environment variable.',
    };
  }

  if (!isValidNasaApiKey(apiKey)) {
    return {
      key: null,
      isValid: false,
      error: `Invalid NASA API key format. Expected 40 alphanumeric characters, got ${apiKey.length}.`,
    };
  }

  return {
    key: apiKey,
    isValid: true,
    error: null,
  };
}

/**
 * Check if we have a valid API key for operations
 * Throws an error if key is invalid
 * 
 * @returns {string} The validated API key
 * @throws {Error} If API key is invalid
 */
export function requireValidApiKey() {
  const validation = getValidatedApiKey();
  
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  return validation.key;
}
