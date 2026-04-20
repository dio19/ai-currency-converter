import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { logger } from './logger';

describe('Logger', () => {
  let consoleLogSpy: MockInstance;
  let consoleWarnSpy: MockInstance;
  let consoleErrorSpy: MockInstance;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should log info messages to console.log', () => {
    logger.info('Test info message', { key: 'value' });
    expect(consoleLogSpy).toHaveBeenCalled();
    const lastCall = JSON.parse(String(consoleLogSpy.mock.calls[0][0])) as {
      level: string;
      message: string;
      context: { key: string };
    };
    expect(lastCall.level).toBe('info');
    expect(lastCall.message).toBe('Test info message');
    expect(lastCall.context.key).toBe('value');
  });

  it('should log warn messages to console.warn', () => {
    logger.warn('Test warn message');
    expect(consoleWarnSpy).toHaveBeenCalled();
    const lastCall = JSON.parse(String(consoleWarnSpy.mock.calls[0][0])) as {
      level: string;
      message: string;
    };
    expect(lastCall.level).toBe('warn');
    expect(lastCall.message).toBe('Test warn message');
  });

  it('should log error messages to console.error', () => {
    const testError = new Error('Structural Failure');
    logger.error('Test error message', undefined, testError);
    expect(consoleErrorSpy).toHaveBeenCalled();
    const lastCall = JSON.parse(String(consoleErrorSpy.mock.calls[0][0])) as {
      level: string;
      message: string;
      error: { message: string; name: string };
    };
    expect(lastCall.level).toBe('error');
    expect(lastCall.message).toBe('Test error message');
    expect(lastCall.error.name).toBe('Error');
    expect(lastCall.error.message).toBe('Structural Failure');
  });

  it('should log debug messages only in non-production environments', () => {
    vi.stubEnv('NODE_ENV', 'development');
    logger.debug('Debug message');
    expect(consoleLogSpy).toHaveBeenCalled();
    
    consoleLogSpy.mockClear();
    
    vi.stubEnv('NODE_ENV', 'production');
    logger.debug('Hidden debug');
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });
});
