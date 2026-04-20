export {
  ApplicationError as AppError,
  ContractValidationError as ValidationError,
  ExternalDependencyError as ExternalApiError,
  RateLimitError,
  UnexpectedApplicationError,
  type ErrorSeverity,
  type ProblemDetails,
} from '../shared/errors/application-error';
