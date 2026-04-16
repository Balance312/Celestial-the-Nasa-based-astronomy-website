const NASA_API_BASE = "https://api.nasa.gov/planetary/apod";
const DEFAULT_TIMEOUT_MS = 5000;
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000;

const CACHE_MAX_AGE = {
  apodByDate: 1000 * 60 * 60 * 24 * 30,
  apodToday: 1000 * 60 * 60 * 24,
  gallery: 1000 * 60 * 10,
};

const getTodayDateString = () => new Date().toISOString().split("T")[0];

const readCache = (key, maxAgeMs) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    if (!parsed.timestamp || Date.now() - parsed.timestamp > maxAgeMs) {
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
};

const writeCache = (key, data) => {
  try {
    localStorage.setItem(
      key,
      JSON.stringify({
        timestamp: Date.now(),
        data,
      }),
    );
  } catch {
    // Ignore quota/storage errors silently and continue with network result.
  }
};

const fetchJsonWithTimeout = async (url, { signal, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) => {
  const timeoutController = new AbortController();
  const timer = setTimeout(() => timeoutController.abort(), timeoutMs);

  if (signal) {
    signal.addEventListener("abort", () => timeoutController.abort(), { once: true });
  }

  try {
    const response = await fetch(url, { signal: timeoutController.signal });

    if (!response.ok) {
      throw new Error(`NASA API error: ${response.status}`);
    }

    return response.json();
  } finally {
    clearTimeout(timer);
  }
};

const fetchWithRetry = async (url, { signal, timeoutMs = DEFAULT_TIMEOUT_MS, retries = MAX_RETRIES } = {}) => {
  let lastError;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fetchJsonWithTimeout(url, { signal, timeoutMs });
    } catch (error) {
      lastError = error;
      
      // Check if error is retryable (network error, 503, 502, 429, timeout)
      const isRetryable = 
        error.name === 'AbortError' ||
        error.message.includes('503') ||
        error.message.includes('502') ||
        error.message.includes('429') ||
        error.message.includes('Failed to fetch');
      
      if (!isRetryable || attempt === retries) {
        break;
      }
      
      // Exponential backoff: 1s, 2s, 4s
      const delayMs = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  throw lastError;
};

export const getApodByDate = async (apiKey, date, options = {}) => {
  const { signal, preferCache = true } = options;
  const cacheKey = `nasa:apod:date:${date}`;

  if (preferCache) {
    const cached = readCache(cacheKey, CACHE_MAX_AGE.apodByDate);
    if (cached) {
      return cached;
    }
  }

  const data = await fetchWithRetry(
    `${NASA_API_BASE}?api_key=${apiKey}&date=${date}`,
    { signal },
  );

  writeCache(cacheKey, data);
  return data;
};

export const getTodayApod = async (apiKey, options = {}) => {
  const { signal, preferCache = true } = options;
  const today = getTodayDateString();
  const cacheKey = `nasa:apod:today:${today}`;

  if (preferCache) {
    const cached = readCache(cacheKey, CACHE_MAX_AGE.apodToday);
    if (cached) {
      return cached;
    }
  }

  const data = await fetchWithRetry(`${NASA_API_BASE}?api_key=${apiKey}`, { signal });

  writeCache(cacheKey, data);
  return data;
};

export const getRandomGallery = async (apiKey, count = 12, options = {}) => {
  const { signal, preferCache = true } = options;
  const cacheKey = `nasa:apod:gallery:${count}`;

  if (preferCache) {
    const cached = readCache(cacheKey, CACHE_MAX_AGE.gallery);
    if (cached) {
      return cached;
    }
  }

  const data = await fetchWithRetry(
    `${NASA_API_BASE}?api_key=${apiKey}&count=${count}`,
    { signal },
  );

  writeCache(cacheKey, data);
  return data;
};

// Clear API cache - removes all NASA APOD cache keys from localStorage
export const clearApiCache = () => {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('nasa:apod:')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
};

// Clear a specific cache key
export const clearCacheKey = (key) => {
  localStorage.removeItem(key);
};
