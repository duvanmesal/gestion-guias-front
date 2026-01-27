import { http } from "./http"
import type { ApiResponse } from "@/core/models/api"
import type {
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  LogoutAllRequest,
  User,
  Session,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  VerifyEmailConfirmRequest,
} from "@/core/models/auth"

export const authApi = {
  // Login
  async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await http.post<ApiResponse<LoginResponse>>("/auth/login", data)
    return response.data
  },

  // Refresh token (WEB: uses httpOnly cookie)
  async refresh(): Promise<ApiResponse<RefreshResponse>> {
    const response = await http.post<ApiResponse<RefreshResponse>>(
      "/auth/refresh",
      {},
      {
        withCredentials: true,
      },
    )
    return response.data
  },

  // Logout current session
  async logout(): Promise<void> {
    await http.post("/auth/logout")
  },

  // Logout all sessions
  async logoutAll(data: LogoutAllRequest): Promise<void> {
    await http.post("/auth/logout-all", data)
  },

  // Get current user
  async me(): Promise<ApiResponse<User>> {
    const response = await http.get<ApiResponse<User>>("/auth/me")
    return response.data
  },

  // Get user sessions
  async getSessions(): Promise<ApiResponse<Session[]>> {
    const response = await http.get<ApiResponse<Session[]>>("/auth/sessions")
    return response.data
  },

  // Delete specific session
  async deleteSession(sessionId: string): Promise<void> {
    await http.delete(`/auth/sessions/${sessionId}`)
  },

  // Change password (authenticated user)
  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<{ message: string }>> {
    const response = await http.post<ApiResponse<{ message: string }>>("/auth/change-password", data)
    return response.data
  },

  // Forgot password (request reset link)
  async forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse<{ message: string }>> {
    const response = await http.post<ApiResponse<{ message: string }>>("/auth/forgot-password", data)
    return response.data
  },

  // Reset password (using token from email)
  async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse<{ message: string }>> {
    const response = await http.post<ApiResponse<{ message: string }>>("/auth/reset-password", data)
    return response.data
  },

  // Request email verification
  async requestEmailVerification(data: VerifyEmailRequest): Promise<ApiResponse<{ message: string }>> {
    const response = await http.post<ApiResponse<{ message: string }>>("/auth/verify-email/request", data)
    return response.data
  },

  // Confirm email verification
  async confirmEmailVerification(data: VerifyEmailConfirmRequest): Promise<ApiResponse<{ message: string }>> {
    const response = await http.post<ApiResponse<{ message: string }>>("/auth/verify-email/confirm", data)
    return response.data
  },
}
