// API Response Wrapper
export interface ApiResponse<T> {
  data: T | null
  meta: MetaPage | null
  error: ApiError | null
}

// Pagination Metadata
export interface MetaPage {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

// Standard API Error
export interface ApiError {
  code: string
  message: string
  details?: unknown
}

// Error Codes
export enum ErrorCode {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_STATE = "INVALID_STATE",
  UNAUTHORIZED = "UNAUTHORIZED",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  INVALID_REFRESH = "INVALID_REFRESH",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",
  EMAIL_IN_USE = "EMAIL_IN_USE",
  RATE_LIMITED = "RATE_LIMITED",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
}
