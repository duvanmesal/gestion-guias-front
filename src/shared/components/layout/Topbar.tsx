"use client"

import { Menu, LogOut, User, Bell } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useNavigate } from "react-router-dom"
import { GlassButton } from "@/shared/components/glass/GlassButton"
import { ThemeToggle } from "./ThemeToggle"

interface TopbarProps {
  onMenuClick: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="glass-strong fixed top-0 left-0 right-0 z-50 px-4 py-3 border-b border-white/10 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2.5 rounded-xl hover:bg-white/10 transition-all focus-ring group relative overflow-hidden"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5 text-[rgb(var(--color-fg))] transition-transform group-hover:scale-110 relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-[rgb(var(--color-primary)/0.2)] to-[rgb(var(--color-accent)/0.2)] opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold bg-gradient-to-r from-[rgb(var(--color-primary))] to-[rgb(var(--color-accent))] bg-clip-text text-transparent">
              Gestión Guías
            </h1>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-[rgb(var(--color-primary))] status-indicator" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-3 px-4 py-2 glass rounded-xl border border-white/10 hover-lift">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[rgb(var(--color-primary)/0.3)] to-[rgb(var(--color-accent)/0.2)] flex items-center justify-center border border-white/10">
              <User className="w-4 h-4 text-[rgb(var(--color-primary))]" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-[rgb(var(--color-fg))]">{user?.email}</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-gradient-to-r from-[rgb(var(--color-primary)/0.2)] to-[rgb(var(--color-accent)/0.15)] text-[rgb(var(--color-primary))] font-semibold inline-block w-fit border border-[rgb(var(--color-primary)/0.2)]">
                {user?.rol}
              </span>
            </div>
          </div>

          <ThemeToggle />

          <button
            className="p-2.5 rounded-xl glass hover:bg-white/10 transition-all focus-ring group relative border border-white/5"
            aria-label="Notificaciones"
          >
            <Bell className="w-4 h-4 text-[rgb(var(--color-fg)/0.7)] group-hover:text-[rgb(var(--color-fg))] transition-colors" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[rgb(var(--color-danger))] rounded-full border border-[rgb(var(--color-bg))]" />
          </button>

          <GlassButton
            variant="ghost"
            size="sm"
            onClick={() => logout()}
            className="hover:bg-red-500/10 hover:text-red-400 hover:border-red-400/20 border border-white/5"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Salir</span>
          </GlassButton>
        </div>
      </div>
    </header>
  )
}
