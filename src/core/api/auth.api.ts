import { http } from "./http"
import type { ApiResponse } from "@/core/models/api"
import type { LoginRequest, LoginResponse, RefreshResponse, LogoutAllRequest, User, Session } from "@/core/models/auth"

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
}
