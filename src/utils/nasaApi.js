import { staleWhileRevalidate, invalidateCache } from './requestManager.js';

const NASA_API_BASE = "https://api.nasa.gov/planetary/apod";
const EPIC_API_BASE = "https://api.nasa.gov/EPIC/api/natural";
const NASA_SEARCH_BASE = "https://images-api.nasa.gov";
const DEFAULT_TIMEOUT_MS = 5000;
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000;

const CACHE_MAX_AGE = {
  apodByDate: 1000 * 60 * 60 * 24 * 30,
  apodToday: 1000 * 60 * 60 * 24,
  gallery: 1000 * 60 * 10,
  epic: 1000 * 60 * 60 * 6,
  search: 1000 * 60 * 5,
};

const getTodayDateString = () => new Date().toISOString().split("T")[0];

// ── localStorage persistent cache ──

const readCache = (key, maxAgeMs) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    if (!parsed.timestamp || Date.now() - parsed.timestamp > maxAgeMs) return null;
    return parsed.data;
  } catch {
    return null;
  }
};

const writeCache = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), data }));
  } catch {
    // Ignore quota/storage errors silently
  }
};

// ── Fetch primitives ──

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

      const isRetryable =
        error.name === 'AbortError' ||
        error.message.includes('503') ||
        error.message.includes('502') ||
        error.message.includes('429') ||
        error.message.includes('Failed to fetch');

      if (!isRetryable || attempt === retries) break;

      const delayMs = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
};

// ── APOD API ──

export const getApodByDate = async (apiKey, date, options = {}) => {
  const { signal, preferCache = true } = options;
  const cacheKey = `nasa:apod:date:${date}`;

  if (preferCache) {
    const cached = readCache(cacheKey, CACHE_MAX_AGE.apodByDate);
    if (cached) return cached;
  } else {
    invalidateCache(cacheKey);
  }

  return staleWhileRevalidate(
    cacheKey,
    async () => {
      const data = await fetchWithRetry(
        `${NASA_API_BASE}?api_key=${apiKey}&date=${date}`,
        { signal },
      );
      writeCache(cacheKey, data);
      return data;
    },
    CACHE_MAX_AGE.apodByDate,
  );
};

export const getTodayApod = async (apiKey, options = {}) => {
  const { signal, preferCache = true } = options;
  const today = getTodayDateString();
  const cacheKey = `nasa:apod:today:${today}`;

  if (preferCache) {
    const cached = readCache(cacheKey, CACHE_MAX_AGE.apodToday);
    if (cached) return cached;
  }

  return staleWhileRevalidate(
    cacheKey,
    async () => {
      const data = await fetchWithRetry(`${NASA_API_BASE}?api_key=${apiKey}`, { signal });
      writeCache(cacheKey, data);
      return data;
    },
    CACHE_MAX_AGE.apodToday,
  );
};

export const getRandomGallery = async (apiKey, count = 12, options = {}) => {
  const { signal, preferCache = true } = options;
  const cacheKey = `nasa:apod:gallery:${count}`;

  if (!preferCache) {
    invalidateCache(cacheKey);
  }

  if (preferCache) {
    const cached = readCache(cacheKey, CACHE_MAX_AGE.gallery);
    if (cached) return cached;
  }

  return staleWhileRevalidate(
    cacheKey,
    async () => {
      const data = await fetchWithRetry(
        `${NASA_API_BASE}?api_key=${apiKey}&count=${count}`,
        { signal },
      );
      writeCache(cacheKey, data);
      return data;
    },
    CACHE_MAX_AGE.gallery,
  );
};

// ── NASA Image & Video Library Search ──

export const searchNasaLibrary = async (query, options = {}) => {
  const { signal, page = 1, mediaType = 'image' } = options;
  const cacheKey = `nasa:search:${query}:${mediaType}:p${page}`;

  return staleWhileRevalidate(
    cacheKey,
    async () => {
      const url = `${NASA_SEARCH_BASE}/search?q=${encodeURIComponent(query)}&page=${page}&media_type=${mediaType}`;
      const data = await fetchWithRetry(url, { signal, timeoutMs: 8000 });
      return data;
    },
    CACHE_MAX_AGE.search,
  );
};

// ── EPIC API ──

export const getEpicLatest = async (apiKey, options = {}) => {
  const { signal, preferCache = true } = options;
  const cacheKey = `nasa:epic:latest`;

  if (preferCache) {
    const cached = readCache(cacheKey, CACHE_MAX_AGE.epic);
    if (cached) return cached;
  }

  return staleWhileRevalidate(
    cacheKey,
    async () => {
      const data = await fetchWithRetry(
        `${EPIC_API_BASE}?api_key=${apiKey}&limit=20`,
        { signal },
      );
      writeCache(cacheKey, data);
      return data;
    },
    CACHE_MAX_AGE.epic,
  );
};

export const getEpicByDate = async (apiKey, date, options = {}) => {
  const { signal, preferCache = true } = options;
  const cacheKey = `nasa:epic:date:${date}`;

  if (preferCache) {
    const cached = readCache(cacheKey, CACHE_MAX_AGE.epic);
    if (cached) return cached;
  }

  return staleWhileRevalidate(
    cacheKey,
    async () => {
      const data = await fetchWithRetry(
        `${EPIC_API_BASE}/date/${date}?api_key=${apiKey}`,
        { signal },
      );
      writeCache(cacheKey, data);
      return data;
    },
    CACHE_MAX_AGE.epic,
  );
};

export const getEpicImageUrl = (date, image, apiKey = '') => {
  const year = date.slice(0, 4);
  const month = date.slice(5, 7);
  const day = date.slice(8, 10);
  const imageFileName = image.image || 'epic_image';

  const url = `https://api.nasa.gov/EPIC/archive/natural/${year}/${month}/${day}/png/${imageFileName}.png`;
  return apiKey ? `${url}?api_key=${apiKey}` : url;
};

// ── Cache management ──

export const clearApiCache = () => {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('nasa:')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
  invalidateCache();
};

export const clearCacheKey = (key) => {
  localStorage.removeItem(key);
  invalidateCache(key);
};
