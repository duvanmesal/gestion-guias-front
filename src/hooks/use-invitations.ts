import { useState } from "react"
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

  // Get invitation by email mutation
  const getByEmailMutation = useMutation({
    mutationFn: (email: string) => invitationsApi.getByEmail(email),
  })

  // Resend invitation by email mutation
  const resendByEmailMutation = useMutation({
    mutationFn: (email: string) => invitationsApi.resendByEmail(email),
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
    // By email operations
    getByEmail: getByEmailMutation.mutateAsync,
    isSearchingByEmail: getByEmailMutation.isPending,
    searchedInvitation: getByEmailMutation.data,
    searchByEmailError: getByEmailMutation.error,
    resendByEmail: resendByEmailMutation.mutate,
    resendByEmailAsync: resendByEmailMutation.mutateAsync,
    isResendingByEmail: resendByEmailMutation.isPending,
  }
}
