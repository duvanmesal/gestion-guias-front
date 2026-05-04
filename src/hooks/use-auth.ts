"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi, usersApi } from "@/core/api";
import { useAuthStore } from "@/app/stores/auth-store";
import { socketClient } from "@/core/socket/socket.client";
import type { LoginRequest, LogoutAllRequest } from "@/core/models/auth";

function resolveAuthenticatedEntry(user: { emailVerifiedAt?: string | null; profileStatus?: string | null }) {
  if (!user.emailVerifiedAt) return "/verify-needed";
  if (user.profileStatus !== "COMPLETE") return "/onboarding";
  return "/dashboard";
}

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
    meta: { suppressGlobalError: true },

    onSuccess: async (response) => {
      if (!response.data) return;

      // 1) Guardar sesión inicial (user parcial + token)
      const accessToken = response.data.tokens.accessToken
      setSession(response.data.user, accessToken);
      socketClient.connect(accessToken);

      // 2) Hidratar user real desde /users/me (emailVerifiedAt + profileStatus + IDs operativos)
      try {
        const me = await usersApi.getMe();

        if (me.data) {
          updateUser(me.data);
          queryClient.setQueryData(["me"], me.data);

          // 3) Decidir navegación con estado REAL
          navigate(resolveAuthenticatedEntry(me.data), { replace: true });
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
      socketClient.disconnect();
      clearSession();
      queryClient.clear();
      navigate("/login", { replace: true });
    },
  });

  const logoutAllMutation = useMutation({
    mutationFn: (data: LogoutAllRequest) => authApi.logoutAll(data),
    onSuccess: () => {
      socketClient.disconnect();
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
    isLoggingOutAll: logoutAllMutation.isPending,
    loginError: loginMutation.error,
  };
}
