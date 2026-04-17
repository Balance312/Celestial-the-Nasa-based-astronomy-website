import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getNasaApiKey, validateApiKey } from '../../utils/apiConfig.js';

describe('apiConfig', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe('getNasaApiKey', () => {
    it('should return API key from environment', () => {
      const key = getNasaApiKey();
      expect(key).toBe('test-api-key');
    });

    it('should throw error if API key not configured', () => {
      const originalKey = process.env.VITE_NASA_API_KEY;
      delete process.env.VITE_NASA_API_KEY;

      expect(() => getNasaApiKey()).toThrow();

      process.env.VITE_NASA_API_KEY = originalKey;
    });
  });

  describe('validateApiKey', () => {
    it('should return true if key is valid', () => {
      const result = validateApiKey();
      expect(result).toBe(true);
    });

    it('should throw error if key is invalid', () => {
      const originalKey = process.env.VITE_NASA_API_KEY;
      delete process.env.VITE_NASA_API_KEY;

      expect(() => validateApiKey()).toThrow();

      process.env.VITE_NASA_API_KEY = originalKey;
    });
  });
});
