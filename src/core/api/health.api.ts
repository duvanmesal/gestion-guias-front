import { http } from "./http"
import type { ApiResponse } from "@/core/models/api"

interface HealthResponse {
  status: string
  db?: string
}

export const healthApi = {
  // Health check
  async check(): Promise<ApiResponse<HealthResponse>> {
    const response = await http.get<ApiResponse<HealthResponse>>("/health")
    return response.data
  },

  // Readiness check
  async ready(): Promise<ApiResponse<HealthResponse>> {
    const response = await http.get<ApiResponse<HealthResponse>>("/health/ready")
    return response.data
  },
}
