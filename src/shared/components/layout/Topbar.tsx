"use client"

import { Menu, LogOut, User, Compass } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { GlassButton } from "@/shared/components/glass/GlassButton"
import { ThemeToggle } from "./ThemeToggle"

interface TopbarProps {
  onMenuClick: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout } = useAuth()

  return (
    <header className="glass-strong fixed top-0 left-0 right-0 z-50 px-4 py-3 border-b border-[rgb(var(--color-border)/0.06)]">
      <div className="flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2.5 rounded-xl hover:bg-[rgb(var(--color-glass-hover)/0.5)] transition-colors focus-ring"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5 text-[rgb(var(--color-fg))]" />
          </button>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex w-8 h-8 rounded-lg bg-[rgb(var(--color-primary))] items-center justify-center">
              <Compass className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[rgb(var(--color-fg))]">
                CORPOTURISMO
              </h1>
              <p className="hidden sm:block text-xs text-[rgb(var(--color-muted))] -mt-0.5">
                Sistema de Gestion
              </p>
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* User info - Desktop */}
          <div className="hidden sm:flex items-center gap-3 px-4 py-2 glass-subtle rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-[rgb(var(--color-primary)/0.15)] flex items-center justify-center">
              <User className="w-4 h-4 text-[rgb(var(--color-primary))]" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-[rgb(var(--color-fg))]">
                {user?.nombres || user?.email?.split("@")[0]}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-[rgb(var(--color-accent)/0.15)] text-[rgb(var(--color-accent))] font-semibold inline-block w-fit">
                {user?.rol}
              </span>
            </div>
          </div>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Logout button */}
          <GlassButton
            variant="ghost"
            size="sm"
            onClick={() => logout()}
            className="text-[rgb(var(--color-danger))] hover:bg-[rgb(var(--color-danger)/0.1)]"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Salir</span>
          </GlassButton>
        </div>
      </div>
    </header>
  )
}
