import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { operationalConfigApi } from "@/core/api/operational-config.api"
import type { TurnoAssignmentMode } from "@/core/models/auth"

export const operationalConfigKeys = {
  root: ["operational-config"] as const,
}

export function useOperationalConfig(options?: { enabled?: boolean }) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: operationalConfigKeys.root,
    queryFn: () => operationalConfigApi.get(),
    staleTime: 30_000,
    enabled: options?.enabled ?? true,
  })

  const updateModeMutation = useMutation({
    mutationFn: (mode: TurnoAssignmentMode) =>
      operationalConfigApi.updateTurnoAssignmentMode({ mode }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: operationalConfigKeys.root })
      queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] })
      queryClient.invalidateQueries({ queryKey: ["me"] })
      queryClient.invalidateQueries({ queryKey: ["users-guides"] })
    },
  })

  return {
    config: query.data?.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    updateMode: updateModeMutation.mutate,
    updateModeAsync: updateModeMutation.mutateAsync,
    isUpdatingMode: updateModeMutation.isPending,
  }
}
