import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { invitationsApi } from "@/core/api"
import type { CreateInvitationRequest, Invitation } from "@/core/models/invitations"

export function useInvitations() {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery<Invitation[]>({
    queryKey: ["invitations"],
    queryFn: () => invitationsApi.getInvitations(),
    staleTime: 30_000,
  })

  const createInvitationMutation = useMutation({
    mutationFn: (input: CreateInvitationRequest) => invitationsApi.createInvitation(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invitations"] }),
  })

  const resendInvitationMutation = useMutation({
    mutationFn: (id: string) => invitationsApi.resendInvitation(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invitations"] }),
  })

  return {
    invitations: data ?? [],
    isLoading,
    error,
    createInvitation: createInvitationMutation.mutate,
    resendInvitation: resendInvitationMutation.mutate,
    isCreating: createInvitationMutation.isPending,
    isResending: resendInvitationMutation.isPending,
  }
}
