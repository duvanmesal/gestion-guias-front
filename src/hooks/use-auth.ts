"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { authApi } from "@/core/api"
import { useAuthStore } from "@/app/stores/auth-store"
import type { LoginRequest, LogoutAllRequest } from "@/core/models/auth"

export function useAuth() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, isAuthenticated, setSession, clearSession } = useAuthStore()

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      if (response.data) {
        setSession(response.data.user, response.data.tokens.accessToken)
        navigate("/dashboard")
      }
    },
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      clearSession()
      queryClient.clear()
      navigate("/login")
    },
  })

  // Logout all mutation
  const logoutAllMutation = useMutation({
    mutationFn: (data: LogoutAllRequest) => authApi.logoutAll(data),
    onSuccess: () => {
      clearSession()
      queryClient.clear()
      navigate("/login")
    },
  })

  // Get current user query
  const { data: meData, isLoading: isLoadingMe } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const response = await authApi.me()
      return response.data
    },
    enabled: isAuthenticated,
    staleTime: 60000, // 1 minute
  })

  return {
    user: meData || user,
    isAuthenticated,
    isLoading: isLoadingMe,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    logoutAll: logoutAllMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
  }
}
