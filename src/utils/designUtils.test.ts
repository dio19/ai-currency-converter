import { describe, it, expect } from 'vitest';
import { cn } from './designUtils';

describe('designUtils', () => {
  describe('cn', () => {
    it('should join class names with spaces', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
    });

    it('should filter out falsy values', () => {
      expect(cn('class1', null, 'class2', undefined, false, '', 'class3')).toBe('class1 class2 class3');
    });

    it('should return an empty string if no valid classes are provided', () => {
      expect(cn(null, undefined, false)).toBe('');
    });
  });
});
