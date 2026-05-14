import { create } from "zustand"
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware"
import type { User } from "@/core/models/auth"

const AUTH_STORAGE_KEY = "auth-storage"
const AUTH_STORAGE_MODE_KEY = "auth-storage-mode"
type AuthStorageMode = "local" | "session"

function getBrowserStorage(mode: AuthStorageMode): Storage | undefined {
  if (typeof window === "undefined") return undefined
  return mode === "local" ? window.localStorage : window.sessionStorage
}

function setAuthPersistenceMode(mode: AuthStorageMode) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(AUTH_STORAGE_MODE_KEY, mode)
}

const authStorage: StateStorage = {
  getItem: (name) => {
    if (typeof window === "undefined") return null

    const mode = window.localStorage.getItem(AUTH_STORAGE_MODE_KEY)
    if (mode === "local" || mode === "session") {
      return getBrowserStorage(mode)?.getItem(name) ?? null
    }

    return window.sessionStorage.getItem(name) ?? window.localStorage.getItem(name)
  },
  setItem: (name, value) => {
    if (typeof window === "undefined") return

    const mode =
      window.localStorage.getItem(AUTH_STORAGE_MODE_KEY) === "local" ? "local" : "session"
    const target = getBrowserStorage(mode)
    const other = getBrowserStorage(mode === "local" ? "session" : "local")

    target?.setItem(name, value)
    other?.removeItem(name)
  },
  removeItem: (name) => {
    if (typeof window === "undefined") return
    window.localStorage.removeItem(name)
    window.sessionStorage.removeItem(name)
    window.localStorage.removeItem(AUTH_STORAGE_MODE_KEY)
  },
}

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  setSession: (user: User, accessToken: string, options?: { rememberMe?: boolean }) => void
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

      setSession: (user, accessToken, options) => {
        if (options) {
          setAuthPersistenceMode(options.rememberMe === true ? "local" : "session")
        }

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
        authStorage.removeItem(AUTH_STORAGE_KEY)
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
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => authStorage),
      // accessToken lives only in memory - never written to browser storage
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
)
