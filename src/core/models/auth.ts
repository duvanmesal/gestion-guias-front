// User Roles
export enum Rol {
  SUPER_ADMIN = "SUPER_ADMIN",
  SUPERVISOR = "SUPERVISOR",
  GUIA = "GUIA",
}

// Document Types
export enum DocumentType {
  CC = "CC",
  CE = "CE",
  PASAPORTE = "PASAPORTE",
}

// Platform Types
export enum Platform {
  WEB = "WEB",
  MOBILE = "MOBILE",
}

// User Entity
export interface User {
  id: string
  email: string
  nombres: string | null
  apellidos: string | null
  rol: Rol
  activo: boolean
  telefono?: string | null
  documentType?: DocumentType | null
  documentNumber?: string | null
  emailVerifiedAt?: string | null
  createdAt: string
  updatedAt: string
}

// Change Password Request
export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

// Forgot Password Request
export interface ForgotPasswordRequest {
  email: string
}

// Reset Password Request
export interface ResetPasswordRequest {
  token: string
  newPassword: string
}

// Verify Email Request
export interface VerifyEmailRequest {
  email: string
}

// Verify Email Confirm Request
export interface VerifyEmailConfirmRequest {
  token: string
}

// Session Entity
export interface Session {
  id: string
  userId: string
  platform: Platform
  userAgent?: string | null
  ip?: string | null
  createdAt: string
  lastActivityAt?: string | null
}

// Authentication Tokens
export interface Tokens {
  accessToken: string
  accessTokenExpiresIn: number
  refreshToken?: string
  refreshTokenExpiresAt: string
}

// Login Request
export interface LoginRequest {
  email: string
  password: string
  deviceId?: string
  platform?: Platform
}

// Login Response
export interface LoginResponse {
  user: User
  tokens: Tokens
  session: Session
}

// Refresh Response
export interface RefreshResponse {
  tokens: Tokens
  session: { id: string }
}

// Logout All Request
export interface LogoutAllRequest {
  verification: { method: "password"; password: string } | { method: "mfa"; code: string }
}
