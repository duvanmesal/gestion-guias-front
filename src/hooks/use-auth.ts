"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi, usersApi } from "@/core/api";
import { useAuthStore } from "@/app/stores/auth-store";
import type { LoginRequest, LogoutAllRequest } from "@/core/models/auth";

export function useAuth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    user,
    isAuthenticated,
    setSession,
    clearSession,
    updateUser,
  } = useAuthStore();

  /**
   * =========================
   * LOGIN
   * =========================
   */
  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),

    onSuccess: async (response) => {
      if (!response.data) return;

      // 1) Guardar sesión inicial (user parcial + token)
      setSession(
        response.data.user,
        response.data.tokens.accessToken
      );

      // 2) Hidratar user real desde /auth/me (emailVerifiedAt + flags reales)
      try {
        const me = await authApi.me();

        if (me.data) {
          updateUser(me.data);

          // 3) Decidir navegación con estado REAL
          if (me.data.emailVerifiedAt) {
            navigate("/dashboard", { replace: true });
          } else {
            navigate("/verify-needed", { replace: true });
          }
        } else {
          navigate("/dashboard", { replace: true });
        }
      } catch {
        // fallback seguro (evita loops)
        navigate("/dashboard", { replace: true });
      }
    },
  });

  /**
   * =========================
   * LOGOUT
   * =========================
   */
  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      clearSession();
      queryClient.clear();
      navigate("/login", { replace: true });
    },
  });

  const logoutAllMutation = useMutation({
    mutationFn: (data: LogoutAllRequest) => authApi.logoutAll(data),
    onSuccess: () => {
      clearSession();
      queryClient.clear();
      navigate("/login", { replace: true });
    },
  });

  /**
   * =========================
   * GET /users/me
   * (identidad real + IDs operativos)
   * =========================
   */
  const {
    data: meData,
    isLoading: isLoadingMe,
  } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const response = await usersApi.getMe();
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 60_000, // 1 minuto
  });

  /**
   * =========================
   * 🔑 SINCRONIZACIÓN CRÍTICA
   * =========================
   * Cada vez que /users/me cambia,
   * actualizamos el auth-store.
   * Esto evita:
   * - loops de verificación
   * - emailVerifiedAt desactualizado
   * - roles/IDs operativos incorrectos
   */
  useEffect(() => {
    if (meData) {
      updateUser(meData);
    }
  }, [meData, updateUser]);

  /**
   * =========================
   * API PÚBLICA DEL HOOK
   * =========================
   */
  return {
    user: meData || user,
    isAuthenticated,
    isLoading: isLoadingMe,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    logoutAll: logoutAllMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
  };
}
