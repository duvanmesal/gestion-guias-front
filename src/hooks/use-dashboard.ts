// src/hooks/use-dashboard.ts
import { useQuery } from "@tanstack/react-query"
import { dashboardApi } from "@/core/api/dashboard.api"

export function useDashboardOverview(options?: { enabled?: boolean }) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: () => dashboardApi.getOverview(),
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
