export class AppError extends Error {
  readonly httpStatus: number = 500;
  readonly code: string = "internal_error";
  readonly details?: unknown;

  constructor(message: string, details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  override readonly httpStatus = 400;
  override readonly code = "validation_error";
}

export class UnauthorizedError extends AppError {
  override readonly httpStatus = 401;
  override readonly code = "unauthorized";
}

export class ForbiddenError extends AppError {
  override readonly httpStatus = 403;
  override readonly code = "forbidden";
}

export class NotFoundError extends AppError {
  override readonly httpStatus = 404;
  override readonly code = "not_found";
}

export class ConflictError extends AppError {
  override readonly httpStatus = 409;
  override readonly code: string;

  constructor(message: string, code = "conflict", details?: unknown) {
    super(message, details);
    this.code = code;
  }
}

export class PaymentError extends AppError {
  override readonly httpStatus = 402;
  override readonly code = "payment_failed";
}
