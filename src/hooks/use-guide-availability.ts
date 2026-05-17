import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { useAuthStore } from "@/app/stores/auth-store"
import { usersApi } from "@/core/api/users.api"

export const guideAvailabilityKeys = {
  mine: ["guide-availability", "me"] as const,
}

export function useGuideAvailability(options?: { enabled?: boolean }) {
  const queryClient = useQueryClient()
  const updateUser = useAuthStore((s) => s.updateUser)
  const user = useAuthStore((s) => s.user)

  const query = useQuery({
    queryKey: guideAvailabilityKeys.mine,
    queryFn: () => usersApi.getMyAvailability(),
    staleTime: 30_000,
    enabled: options?.enabled ?? true,
  })

  const mutation = useMutation({
    mutationFn: (disponible: boolean) => usersApi.updateMyAvailability(disponible),
    onSuccess: (response) => {
      if (response.data && user) {
        updateUser({
          ...user,
          disponibleParaTurnos: response.data.disponibleParaTurnos,
          disponibilidadUpdatedAt: response.data.disponibilidadUpdatedAt,
          pendingPenalty: response.data.pendingPenalty,
          turnoAssignmentMode: response.data.turnoAssignmentMode ?? user.turnoAssignmentMode,
        })
      }
      queryClient.invalidateQueries({ queryKey: guideAvailabilityKeys.mine })
      queryClient.invalidateQueries({ queryKey: ["me"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] })
      queryClient.invalidateQueries({ queryKey: ["users-guides"] })
    },
  })

  return {
    availability: query.data?.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    setAvailability: mutation.mutate,
    setAvailabilityAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  }
}
