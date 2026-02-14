// src/core/api/dashboard.api.ts
import { http } from "./http"
import type { ApiResponse } from "@/core/models/api"

export const dashboardApi = {
  async getOverview(): Promise<ApiResponse<any>> {
    const response = await http.get<ApiResponse<any>>("/dashboard/overview")
    return response.data
  },
}
