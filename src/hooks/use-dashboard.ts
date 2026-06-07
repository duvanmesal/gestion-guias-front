// src/hooks/use-dashboard.ts
import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { dashboardApi } from "@/core/api/dashboard.api"
import type { DashboardOverviewParams } from "@/core/models/dashboard"

export function useDashboardOverview(options?: { enabled?: boolean; params?: DashboardOverviewParams }) {
  const tzOffsetMinutes = useMemo(() => {
    try { return -new Date().getTimezoneOffset() } catch { return -300 }
  }, [])

  const params: DashboardOverviewParams = {
    tzOffsetMinutes,
    upcomingLimit: 8,
    rangeDays: 30,
    ...options?.params,
  }

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["dashboard-overview", params],
    queryFn: () => dashboardApi.getOverview(params),
    staleTime: 10_000,
    enabled: options?.enabled ?? true,
  })

  return {
    overview: data?.data ?? null,
    isLoading,
    error,
    refetch,
  }
}
