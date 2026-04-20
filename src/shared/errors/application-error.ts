export type ErrorSeverity = 'error' | 'warning' | 'info';

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  code: string;
  severity: ErrorSeverity;
  [key: string]: unknown;
}

type ErrorDetails = Readonly<Record<string, unknown>>;

interface ApplicationErrorOptions {
  status: number;
  code: string;
  title?: string;
  severity?: ErrorSeverity;
  details?: ErrorDetails;
}

const DEFAULT_ERROR_DOCS_BASE_URL = 'https://app.currency-converter.com/errors';

export class ApplicationError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly title: string;
  public readonly severity: ErrorSeverity;
  public readonly details?: ErrorDetails;

  constructor(message: string, options: ApplicationErrorOptions);
  constructor(
    message: string,
    status?: number,
    code?: string,
    severity?: ErrorSeverity,
    details?: ErrorDetails
  );
  constructor(
    message: string,
    optionsOrStatus: ApplicationErrorOptions | number = 500,
    code = 'INTERNAL_ERROR',
    severity: ErrorSeverity = 'error',
    details?: ErrorDetails
  ) {
    super(message);
    const options: ApplicationErrorOptions =
      typeof optionsOrStatus === 'number'
        ? {
            status: optionsOrStatus,
            code,
            severity,
            details,
          }
        : optionsOrStatus;

    this.name = new.target.name;
    this.status = options.status;
    this.code = options.code;
    this.title = options.title ?? this.name;
    this.severity = options.severity ?? 'error';
    this.details = options.details;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toProblemDetails(instance?: string): ProblemDetails {
    return {
      type: `${DEFAULT_ERROR_DOCS_BASE_URL}/${this.code.toLowerCase()}`,
      title: this.title,
      status: this.status,
      detail: this.message,
      instance,
      code: this.code,
      severity: this.severity,
      ...(this.details ?? {}),
    };
  }

  toJSON(instance?: string): ProblemDetails {
    return this.toProblemDetails(instance);
  }
}

export class ContractValidationError extends ApplicationError {
  constructor(message: string, details?: ErrorDetails) {
    super(message, {
      status: 400,
      code: 'VALIDATION_ERROR',
      title: 'Contract Validation Failed',
      severity: 'warning',
      details,
    });
  }
}

export class ExternalDependencyError extends ApplicationError {
  constructor(message: string, details?: ErrorDetails) {
    super(message, {
      status: 502,
      code: 'UPSTREAM_API_ERROR',
      title: 'External Dependency Failed',
      severity: 'error',
      details,
    });
  }
}

export class RateLimitError extends ApplicationError {
  constructor() {
    super('Too many requests. Please try again later.', {
      status: 429,
      code: 'RATE_LIMIT_EXCEEDED',
      title: 'Rate Limit Exceeded',
      severity: 'warning',
    });
  }
}

export class UnexpectedApplicationError extends ApplicationError {
  constructor(message = 'Unknown Internal Server Error', details?: ErrorDetails) {
    super(message, {
      status: 500,
      code: 'INTERNAL_SERVER_ERROR',
      title: 'Internal Server Error',
      severity: 'error',
      details,
    });
  }
}
