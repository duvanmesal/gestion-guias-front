"use client"

import { Menu, LogOut, User } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useNavigate } from "react-router-dom"
import { GlassButton } from "@/shared/components/glass/GlassButton"

interface TopbarProps {
  onMenuClick: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="glass fixed top-0 left-0 right-0 z-50 px-4 py-3 border-b border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors focus-ring"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5 text-[rgb(var(--color-fg))]" />
          </button>

          <h1 className="text-xl font-semibold text-[rgb(var(--color-fg))]">Gestión Guías</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 glass rounded-lg">
            <User className="w-4 h-4 text-[rgb(var(--color-fg)/0.6)]" />
            <span className="text-sm text-[rgb(var(--color-fg))]">{user?.email}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-[rgb(var(--color-primary)/0.2)] text-[rgb(var(--color-primary))]">
              {user?.rol}
            </span>
          </div>

          <GlassButton variant="ghost" size="sm" onClick={() => logout()}>
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Salir</span>
          </GlassButton>
        </div>
      </div>
    </header>
  )
}
