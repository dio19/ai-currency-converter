import { describe, it, expect } from 'vitest';
import { AppError, ValidationError, ExternalApiError, RateLimitError } from './exceptions';

describe('Exceptions', () => {
  describe('AppError', () => {
    it('should correctly initialize with default values', () => {
      const error = new AppError('Custom Error');
      expect(error.message).toBe('Custom Error');
      expect(error.status).toBe(500);
      expect(error.code).toBe('INTERNAL_ERROR');
      expect(error.severity).toBe('error');
    });

    it('should correctly format to JSON following RFC 7807', () => {
      const details = { field: 'amount', reason: 'negative' };
      const error = new AppError('Bad Input', 400, 'BAD_REQUEST', 'warning', details);
      const json = error.toJSON();
      
      expect(json.status).toBe(400);
      expect(json.code).toBe('BAD_REQUEST');
      expect(json.detail).toBe('Bad Input');
      expect(json.severity).toBe('warning');
      expect(json.field).toBe('amount');
    });
  });

  describe('Specific Error Classes', () => {
    it('ValidationError should have status 400', () => {
      const error = new ValidationError('Invalid email');
      expect(error.status).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
    });

    it('ExternalApiError should have status 502', () => {
      const error = new ExternalApiError('Timeout');
      expect(error.status).toBe(502);
    });

    it('RateLimitError should have status 429', () => {
      const error = new RateLimitError();
      expect(error.status).toBe(429);
      expect(error.message).toContain('Too many requests');
    });
  });
});
