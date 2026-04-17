import { describe, it, expect } from 'vitest';
import { sanitizeFilename } from '../../utils/downloadHandler.js';

describe('downloadHandler', () => {
  describe('sanitizeFilename', () => {
    it('should remove special characters', () => {
      const result = sanitizeFilename('Hello! @#$% World.jpg');
      expect(result).toMatch(/^[a-z0-9-]+$/);
    });

    it('should convert to lowercase', () => {
      const result = sanitizeFilename('HELLO WORLD');
      expect(result).toBe('hello-world');
    });

    it('should replace spaces with hyphens', () => {
      const result = sanitizeFilename('Hello World Test');
      expect(result).toBe('hello-world-test');
    });

    it('should handle empty string', () => {
      const result = sanitizeFilename('');
      expect(result).toBe('nasa-image');
    });

    it('should use default filename for null', () => {
      const result = sanitizeFilename(null);
      expect(result).toBe('nasa-image');
    });

    it('should trim whitespace', () => {
      const result = sanitizeFilename('  hello  world  ');
      expect(result).toBe('hello-world');
    });

    it('should handle real APOD titles', () => {
      const result = sanitizeFilename('Pillars of Creation in Visible Light');
      expect(result).toBe('pillars-of-creation-in-visible-light');
    });
  });
});
