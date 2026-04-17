import { describe, it, expect } from 'vitest';
import {
  APOD_START_DATE,
  VIDEO_ASPECT_RATIO,
  CACHE_KEYS,
  API_ERROR_MESSAGES,
  DATE_MESSAGES,
  MOBILE_PATTERN,
} from '../../constants/apod.js';

describe('apod constants', () => {
  it('should have valid APOD start date', () => {
    expect(APOD_START_DATE).toBe('1995-06-16');
  });

  it('should have video aspect ratio', () => {
    expect(VIDEO_ASPECT_RATIO).toBe('16/9');
  });

  it('should have cache keys defined', () => {
    expect(CACHE_KEYS.FAVORITES).toBe('celestialFavorites');
  });

  it('should have all required error messages', () => {
    expect(API_ERROR_MESSAGES.UNAVAILABLE).toBeDefined();
    expect(API_ERROR_MESSAGES.NETWORK).toBeDefined();
    expect(API_ERROR_MESSAGES.RATE_LIMIT).toBeDefined();
  });

  it('should have all required date messages', () => {
    expect(DATE_MESSAGES.BEFORE_START).toBeDefined();
    expect(DATE_MESSAGES.FUTURE).toBeDefined();
  });

  it('should have valid mobile detection pattern', () => {
    expect(MOBILE_PATTERN.test('iPhone')).toBe(true);
    expect(MOBILE_PATTERN.test('Android')).toBe(true);
    expect(MOBILE_PATTERN.test('Windows')).toBe(false);
  });
});
