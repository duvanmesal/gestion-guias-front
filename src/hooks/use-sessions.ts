import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { authApi } from "@/core/api"

export function useSessions() {
  const queryClient = useQueryClient()

  // Get sessions query
  const { data, isLoading, error } = useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      const response = await authApi.getSessions()
      return response.data
    },
    staleTime: 60000, // 1 minute
  })

  // Delete session mutation
  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId: string) => authApi.deleteSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] })
    },
  })

  return {
    sessions: data || [],
    isLoading,
    error,
    deleteSession: deleteSessionMutation.mutate,
    isDeletingSession: deleteSessionMutation.isPending,
  }
}
