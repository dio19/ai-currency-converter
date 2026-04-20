import { describe, it, expect, vi } from 'vitest';
import { withErrorHandler } from './api-handler';
import { AppError } from './exceptions';
import { ZodError } from 'zod';

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, init) => ({ data, status: init.status })),
  },
}));

describe('withErrorHandler', () => {
  it('should call the handler and return its result on success', async () => {
    const successResult = { ok: true };
    const handler = vi.fn().mockResolvedValue(successResult);
    const wrapped = withErrorHandler(handler);

    const request = new Request('https://example.com/test');
    const result = await wrapped(request);
    expect(handler).toHaveBeenCalledWith(request);
    expect(result).toBe(successResult);
  });

  it('should handle AppError correctly', async () => {
    const appError = new AppError('Logic Failure', 403, 'FORBIDDEN');
    const handler = vi.fn().mockRejectedValue(appError);
    const wrapped = withErrorHandler(handler);

    const result = (await wrapped(new Request('https://example.com/test'))) as unknown as {
      status: number;
      data: { code: string };
    };
    expect(result.status).toBe(403);
    expect(result.data.code).toBe('FORBIDDEN');
  });

  it('should handle ZodError by converting it to ValidationError', async () => {
    const zodError = new ZodError([]);
    const handler = vi.fn().mockRejectedValue(zodError);
    const wrapped = withErrorHandler(handler);

    const result = (await wrapped(new Request('https://example.com/test'))) as unknown as {
      status: number;
      data: { code: string; detail: string };
    };
    expect(result.status).toBe(400);
    expect(result.data.code).toBe('VALIDATION_ERROR');
    expect(result.data.detail).toContain('Contract validation failed');
  });

  it('should handle generic Errors as INTERNAL_SERVER_ERROR', async () => {
    const genericError = new Error('Database down');
    const handler = vi.fn().mockRejectedValue(genericError);
    const wrapped = withErrorHandler(handler);

    const result = (await wrapped(new Request('https://example.com/test'))) as unknown as {
      status: number;
      data: { code: string; detail: string };
    };
    expect(result.status).toBe(500);
    expect(result.data.code).toBe('INTERNAL_SERVER_ERROR');
    expect(result.data.detail).toBe('Database down');
  });
});
