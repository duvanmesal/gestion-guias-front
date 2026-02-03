import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { usersApi } from "@/core/api"
import { useAuthStore } from "@/app/stores/auth-store"
import type { UpdateMeRequest, UserMeResponse } from "@/core/models/users"

export function useMe() {
  const queryClient = useQueryClient()
  const { isAuthenticated, updateUser } = useAuthStore()

  // Get current user query with operational IDs
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const response = await usersApi.getMe()
      return response.data
    },
    enabled: isAuthenticated,
    staleTime: 60000, // 1 minute
  })

  // Update current user mutation (basic data: nombres, apellidos, telefono)
  const updateMeMutation = useMutation({
    mutationFn: (payload: UpdateMeRequest) => usersApi.updateMe(payload),
    onSuccess: (response) => {
      if (response.data) {
        // Update cache
        queryClient.setQueryData(["me"], response.data)
        // Update store with basic user data (cast to User type)
        updateUser(response.data as any)
      }
      queryClient.invalidateQueries({ queryKey: ["me"] })
    },
  })

  return {
    me: data as UserMeResponse | undefined,
    isLoading,
    error,
    refetch,
    // Update me
    updateMe: updateMeMutation.mutate,
    updateMeAsync: updateMeMutation.mutateAsync,
    isUpdating: updateMeMutation.isPending,
    updateError: updateMeMutation.error,
  }
}
