// src/hooks/use-users.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { usersApi } from "@/core/api"
import type { UsersSearchParams, CreateUserRequest, UpdateUserRequest } from "@/core/models/users"

export function useUsers(params?: UsersSearchParams) {
  const queryClient = useQueryClient()

  // Search users with advanced filters (using /users/search endpoint)
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["users", params],
    queryFn: async () => {
      const response = await usersApi.searchUsers(params)
      return response
    },
    staleTime: 30_000, // 30 seconds
  })

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (data: CreateUserRequest) => usersApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) => usersApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => usersApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })

  return {
    users: data?.data || [],
    meta: data?.meta,
    isLoading,
    error,
    refetch,

    // mutations
    createUser: createUserMutation.mutate,
    updateUser: updateUserMutation.mutate,
    deleteUser: deleteUserMutation.mutate,

    // states
    isCreating: createUserMutation.isPending,
    isUpdating: updateUserMutation.isPending,
    isDeleting: deleteUserMutation.isPending,

    // errors
    createError: createUserMutation.error,
    updateError: updateUserMutation.error,
  }
}
