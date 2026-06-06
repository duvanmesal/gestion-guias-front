// src/core/api/dashboard.api.ts
import { http } from "./http"
import type { ApiResponse } from "@/core/models/api"
import type { DashboardOverview, DashboardOverviewParams } from "@/core/models/dashboard"

export const dashboardApi = {
  async getOverview(params?: DashboardOverviewParams): Promise<ApiResponse<DashboardOverview>> {
    const search = new URLSearchParams()
    if (params?.date) search.set("date", params.date)
    if (params?.tzOffsetMinutes !== undefined) search.set("tzOffsetMinutes", String(params.tzOffsetMinutes))
    if (params?.upcomingLimit !== undefined) search.set("upcomingLimit", String(params.upcomingLimit))
    if (params?.availableAtencionesLimit !== undefined) search.set("availableAtencionesLimit", String(params.availableAtencionesLimit))
    const qs = search.toString()
    const response = await http.get<ApiResponse<DashboardOverview>>(`/dashboard/overview${qs ? `?${qs}` : ""}`)
    return response.data
  },
}
