"use client"

import { Menu, LogOut, User, Anchor } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { ThemeToggle } from "./ThemeToggle"

interface TopbarProps {
  onMenuClick: () => void
}

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  SUPERVISOR: "Supervisor",
  GUIA: "Guía",
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout } = useAuth()
  const roleLabel = user?.rol ? (ROLE_LABEL[user.rol] ?? user.rol) : null

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 px-4"
      style={{
        height: 64,
        display: "flex",
        alignItems: "center",
        background: "rgb(var(--color-bg-elevated))",
        borderBottom: "1px solid rgba(var(--color-border), 0.07)",
        boxShadow: "0 1px 8px rgba(var(--color-border), 0.05)",
      }}
    >
      <div className="flex items-center justify-between w-full">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-xl transition-colors focus-ring"
            style={{ color: "rgb(var(--color-fg))" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(var(--color-border), 0.05)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div
              className="hidden sm:flex w-8 h-8 rounded-xl items-center justify-center"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Anchor className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1
                className="text-base font-bold leading-tight"
                style={{ color: "rgb(var(--color-fg))", letterSpacing: "-0.01em" }}
              >
                CORPOTURISMO
              </h1>
              <p
                className="hidden sm:block text-xs leading-none"
                style={{ color: "rgb(var(--color-muted))", marginTop: 1 }}
              >
                Sistema de Gestion
              </p>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* User chip */}
          {user && (
            <div
              className="hidden sm:flex items-center gap-2.5 px-3 py-2 rounded-xl"
              style={{
                background: "rgba(var(--color-border), 0.03)",
                border: "1px solid rgba(var(--color-border), 0.06)",
              }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(var(--color-primary), 0.1)" }}
              >
                <User className="w-3.5 h-3.5" style={{ color: "rgb(var(--color-primary))" }} />
              </div>
              <div className="flex flex-col leading-none">
                <span
                  className="text-sm font-semibold"
                  style={{ color: "rgb(var(--color-fg))" }}
                >
                  {user.nombres || user.email?.split("@")[0]}
                </span>
                {roleLabel && (
                  <span
                    className="text-xs mt-0.5 font-medium"
                    style={{ color: "rgb(var(--color-primary))" }}
                  >
                    {roleLabel}
                  </span>
                )}
              </div>
            </div>
          )}

          <ThemeToggle />

          {/* Logout */}
          <button
            onClick={() => logout()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all focus-ring active:scale-95"
            style={{ color: "rgb(var(--color-danger))" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(var(--color-danger), 0.07)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>
    </header>
  )
}
