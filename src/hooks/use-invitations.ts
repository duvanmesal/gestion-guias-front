import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { invitationsApi } from "@/core/api"
import type { CreateInvitationRequest } from "@/core/models/invitations"

export function useInvitations() {
  const queryClient = useQueryClient()

  // Get invitations query
  const { data, isLoading, error } = useQuery({
    queryKey: ["invitations"],
    queryFn: async () => {
      const response = await invitationsApi.getInvitations()
      return response.data
    },
    staleTime: 30000,
  })

  // Create invitation mutation
  const createInvitationMutation = useMutation({
    mutationFn: (data: CreateInvitationRequest) => invitationsApi.createInvitation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] })
    },
  })

  // Resend invitation mutation
  const resendInvitationMutation = useMutation({
    mutationFn: (id: string) => invitationsApi.resendInvitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] })
    },
  })

  return {
    invitations: data || [],
    isLoading,
    error,
    createInvitation: createInvitationMutation.mutate,
    resendInvitation: resendInvitationMutation.mutate,
    isCreating: createInvitationMutation.isPending,
    isResending: resendInvitationMutation.isPending,
  }
}
