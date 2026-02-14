// src/hooks/use-guides.ts
import { useQuery } from "@tanstack/react-query"
import { usersApi } from "@/core/api"
import type { GuidesLookupParams, GuideLookupItem } from "@/core/api/users.api"

export function useGuidesLookup(params?: GuidesLookupParams) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["users-guides", params],
    queryFn: () => usersApi.getGuidesLookup(params),
    staleTime: 30_000,
  })

  return {
    guides: (data?.data ?? []) as GuideLookupItem[],
    meta: data?.meta,
    isLoading,
    error,
    refetch,
  }
}
