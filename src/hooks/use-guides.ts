// src/hooks/use-guides.ts
import { useQuery } from "@tanstack/react-query"
import { usersApi } from "@/core/api"
import type { GuidesLookupParams, GuideLookupItem } from "@/core/api/users.api"

export function useGuidesLookup(params?: GuidesLookupParams & { enabled?: boolean }) {
  const { enabled = true, ...queryParams } = params ?? {}
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["users-guides", queryParams],
    queryFn: () => usersApi.getGuidesLookup(queryParams),
    staleTime: 30_000,
    enabled,
  })

  return {
    guides: (data?.data ?? []) as GuideLookupItem[],
    meta: data?.meta,
    isLoading,
    error,
    refetch,
  }
}
