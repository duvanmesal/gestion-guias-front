import { io, type Socket } from "socket.io-client"
import { useAuthStore } from "@/app/stores/auth-store"

// Derive socket origin from VITE_API_URL (strip /api/v1 suffix)
const apiUrl = import.meta.env.VITE_API_URL as string | undefined
const socketUrl = apiUrl
  ? apiUrl.replace(/\/api\/v\d+\/?$/, "")
  : "http://localhost:3000"

let _socket: Socket | null = null

export const socketClient = {
  connect(token: string): void {
    if (_socket?.connected) return

    _socket = io(socketUrl, {
      path: "/socket.io",
      // Dynamic auth: always use latest token on reconnection attempts
      auth: (cb: (data: { token: string }) => void) => {
        const current = useAuthStore.getState().accessToken
        cb({ token: current ?? token })
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    })
  },

  disconnect(): void {
    _socket?.disconnect()
    _socket = null
  },

  getSocket(): Socket | null {
    return _socket
  },
}
