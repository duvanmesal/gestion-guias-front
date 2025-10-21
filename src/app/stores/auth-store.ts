import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "@/core/models/auth"

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  setSession: (user: User, accessToken: string) => void
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
      storage: {
        getItem: (name) => {
          const str = sessionStorage.getItem(name)
          return str ? JSON.parse(str) : null
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name)
        },
      },
    },
  ),
)
