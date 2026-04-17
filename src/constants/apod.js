/**
 * APOD (Astronomy Picture of the Day) Constants
 * Centralized constants to avoid magic numbers throughout the app
 */

// Date constants
export const APOD_START_DATE = '1995-06-16';
export const VIDEO_ASPECT_RATIO = '16/9';
export const VIDEO_IFRAME_HEIGHT = 600;

// Cache constants
export const CACHE_KEYS = {
  FAVORITES: 'celestialFavorites',
};

// API error messages
export const API_ERROR_MESSAGES = {
  UNAVAILABLE: 'NASA API temporarily unavailable. Please try again later.',
  BAD_GATEWAY: 'Bad gateway error from NASA API. Please try again in a few moments.',
  RATE_LIMIT: 'API rate limit reached. Please wait a moment before trying again.',
  NETWORK: 'Network error. Please check your connection and try again.',
  NOT_FOUND: 'Media not found for the selected date.',
  CONFIGURED: 'NASA API key is not configured. Please check your .env file.',
};

// Date range validation messages
export const DATE_MESSAGES = {
  BEFORE_START: 'APOD photos started on June 16, 1995. Please select a date from June 16, 1995 onwards.',
  FUTURE: 'Cannot select future dates. Please select today or an earlier date.',
};

// Responsive image sizes for srcset optimization
export const IMAGE_SIZES = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';

// Loading and timeout settings
export const TIMEOUT_MS = 5000;
export const MAX_RETRIES = 3;
export const INITIAL_RETRY_DELAY_MS = 1000;

// Gallery settings
export const GALLERY_ITEMS_COUNT = 8;
export const MODAL_CLOSE_DELAY = 300; // ms for animation

// Video player settings
export const VIDEO_IFRAME_ATTRS = {
  ALLOW: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
  SANDBOX: 'allow-scripts allow-same-origin allow-popups allow-presentation',
};

// Mobile device detection pattern
export const MOBILE_PATTERN = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
