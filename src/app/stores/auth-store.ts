import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { User } from "@/core/models/auth"

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  setSession: (user: User, accessToken: string) => void
  setAccessToken: (accessToken: string) => void
  clearSession: () => void
  updateUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setSession: (user, accessToken) => {
        set({
          user,
          accessToken,
          isAuthenticated: true,
        })
      },

      setAccessToken: (accessToken) => {
        set({
          accessToken,
          isAuthenticated: true,
        })
      },

      clearSession: () => {
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        })
      },

      updateUser: (user) => {
        set({ user })
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => sessionStorage),
      // accessToken lives only in memory — never written to sessionStorage
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
)
