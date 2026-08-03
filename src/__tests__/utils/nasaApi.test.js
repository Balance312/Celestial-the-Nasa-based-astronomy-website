import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getApodByDate,
  getTodayApod,
  getRandomGallery,
  getEpicLatest,
  getEpicByDate,
  getEpicImageUrl,
  clearApiCache,
} from '../../utils/nasaApi.js';

const MOCK_API_KEY = 'test-api-key-12345';

const mockApodResponse = {
  title: 'Test Image',
  date: '2024-01-15',
  url: 'https://example.com/image.jpg',
  hdurl: 'https://example.com/image_hd.jpg',
  explanation: 'A test image.',
  media_type: 'image',
};

const mockGalleryResponse = [
  { title: 'Image 1', date: '2024-01-01', url: 'https://example.com/1.jpg', media_type: 'image' },
  { title: 'Image 2', date: '2024-01-02', url: 'https://example.com/2.jpg', media_type: 'image' },
];

const mockEpicResponse = [
  { image: 'epic_1', date: '2024-01-15T12:00:00', time: '12:00:00' },
];

describe('nasaApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('getApodByDate', () => {
    it('should fetch APOD data for a specific date', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockApodResponse),
      });

      const result = await getApodByDate(MOCK_API_KEY, '2024-01-15', { preferCache: false });

      expect(result).toEqual(mockApodResponse);
      expect(fetch).toHaveBeenCalledTimes(1);
      const [url] = fetch.mock.calls[0];
      expect(url).toContain('api_key=test-api-key-12345');
      expect(url).toContain('date=2024-01-15');
    });

    it('should return cached data when available', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockApodResponse),
      });

      await getApodByDate(MOCK_API_KEY, '2024-01-15', { preferCache: true });
      vi.clearAllMocks();

      const result = await getApodByDate(MOCK_API_KEY, '2024-01-15', { preferCache: true });
      expect(result).toEqual(mockApodResponse);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should skip cache when preferCache is false', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockApodResponse),
      });

      await getApodByDate(MOCK_API_KEY, '2024-01-15', { preferCache: true });
      vi.clearAllMocks();

      await getApodByDate(MOCK_API_KEY, '2024-01-15', { preferCache: false });
      expect(fetch).toHaveBeenCalled();
    });
  });

  describe('getTodayApod', () => {
    it('should fetch today APOD data', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockApodResponse),
      });

      const result = await getTodayApod(MOCK_API_KEY, { preferCache: false });

      expect(result).toEqual(mockApodResponse);
      expect(fetch).toHaveBeenCalledTimes(1);
      const [url] = fetch.mock.calls[0];
      expect(url).toContain('api.nasa.gov/planetary/apod');
    });
  });

  describe('getRandomGallery', () => {
    it('should fetch random gallery with specified count', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockGalleryResponse),
      });

      const result = await getRandomGallery(MOCK_API_KEY, 5, { preferCache: false });

      expect(result).toEqual(mockGalleryResponse);
      expect(fetch).toHaveBeenCalledTimes(1);
      const [url] = fetch.mock.calls[0];
      expect(url).toContain('count=5');
    });
  });

  describe('getEpicLatest', () => {
    it('should fetch latest EPIC data', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockEpicResponse),
      });

      const result = await getEpicLatest(MOCK_API_KEY, { preferCache: false });

      expect(result).toEqual(mockEpicResponse);
      expect(fetch).toHaveBeenCalledTimes(1);
      const [url] = fetch.mock.calls[0];
      expect(url).toContain('EPIC/api/natural');
    });
  });

  describe('getEpicByDate', () => {
    it('should fetch EPIC data for a specific date', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockEpicResponse),
      });

      const result = await getEpicByDate(MOCK_API_KEY, '2024-01-15', { preferCache: false });

      expect(result).toEqual(mockEpicResponse);
      expect(fetch).toHaveBeenCalledTimes(1);
      const [url] = fetch.mock.calls[0];
      expect(url).toContain('date/2024-01-15');
    });
  });

  describe('getEpicImageUrl', () => {
    it('should construct correct EPIC image URL', () => {
      const date = '2024-01-15T12:00:00';
      const image = { image: 'epic_1a' };

      const url = getEpicImageUrl(date, image, MOCK_API_KEY);

      expect(url).toContain('EPIC/archive/natural/2024/01/15');
      expect(url).toContain('png/epic_1a.png');
      expect(url).toContain(`api_key=${MOCK_API_KEY}`);
    });

    it('should construct URL without API key when not provided', () => {
      const date = '2024-01-15T12:00:00';
      const image = { image: 'epic_1a' };

      const url = getEpicImageUrl(date, image);

      expect(url).toContain('EPIC/archive/natural/2024/01/15');
      expect(url).not.toContain('api_key=');
    });
  });

  describe('clearApiCache', () => {
    it('should remove all NASA cache keys from localStorage', () => {
      localStorage.setItem('nasa:apod:date:2024-01-01', '{"data":"test1"}');
      localStorage.setItem('nasa:apod:today:2024-01-15', '{"data":"test2"}');
      localStorage.setItem('nasa:epic:latest', '{"data":"test3"}');
      localStorage.setItem('other-key', 'should remain');

      clearApiCache();

      expect(localStorage.getItem('nasa:apod:date:2024-01-01')).toBeNull();
      expect(localStorage.getItem('nasa:apod:today:2024-01-15')).toBeNull();
      expect(localStorage.getItem('nasa:epic:latest')).toBe('{"data":"test3"}');
      expect(localStorage.getItem('other-key')).toBe('should remain');
    });
  });

  describe('error handling', () => {
    it('should throw on non-ok response', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(
        getApodByDate(MOCK_API_KEY, '2024-01-15', { preferCache: false }),
      ).rejects.toThrow();
    });
  });
});
