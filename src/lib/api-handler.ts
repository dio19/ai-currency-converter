import { ZodError } from 'zod';
import { NextResponse } from 'next/server';
import type { LoggerPort } from '../domain/ports/logger-port';
import { logger } from '../infrastructure/adapters/console-logger';
import {
  AppError,
  UnexpectedApplicationError,
  ValidationError,
} from './exceptions';

/**
 * Higher-order function to standardize Route Handler error handling using RFC 7807.
 */
export function withErrorHandler<TArgs extends [Request, ...unknown[]]>(
  handler: (...args: TArgs) => Promise<Response>,
  dependencies: { logger: LoggerPort } = { logger }
) {
  return async (...args: TArgs): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      const responseError =
        error instanceof AppError
          ? error
          : error instanceof ZodError
            ? new ValidationError('Contract validation failed.', {
                issues: error.issues,
              })
            : new UnexpectedApplicationError(
                error instanceof Error ? error.message : 'Unknown Internal Server Error'
              );

      const [request] = args;
      const instance = new URL(request.url).pathname;

      dependencies.logger.error(
        `API_EXCEPTION_CAUGHT [${responseError.code}]`,
        {
          instance,
          method: request.method,
        },
        responseError
      );

      return NextResponse.json(responseError.toProblemDetails(instance), {
        status: responseError.status,
        headers: {
          'Content-Type': 'application/problem+json',
        },
      });
    }
  };
}
