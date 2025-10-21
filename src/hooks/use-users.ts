import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { usersApi } from "@/core/api"
import type { UsersQueryParams, CreateUserRequest, UpdateUserRequest } from "@/core/models/users"

export function useUsers(params?: UsersQueryParams) {
  const queryClient = useQueryClient()

  // Get users list query
  const { data, isLoading, error } = useQuery({
    queryKey: ["users", params],
    queryFn: async () => {
      const response = await usersApi.getUsers(params)
      return response
    },
    staleTime: 30000, // 30 seconds
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
    createUser: createUserMutation.mutate,
    updateUser: updateUserMutation.mutate,
    deleteUser: deleteUserMutation.mutate,
    isCreating: createUserMutation.isPending,
    isUpdating: updateUserMutation.isPending,
    isDeleting: deleteUserMutation.isPending,
    createError: createUserMutation.error,
    updateError: updateUserMutation.error,
  }
}
