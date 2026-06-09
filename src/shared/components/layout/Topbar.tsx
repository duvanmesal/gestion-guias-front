"use client"

import { Menu, Anchor } from "lucide-react"
import { UserMenu } from "./UserMenu"
import { AlertCenter } from "./AlertCenter"

interface TopbarProps {
  onMenuClick: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
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
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.background =
                "rgba(var(--color-border), 0.05)"
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.background = "transparent"
            }}
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
        <div className="flex items-center gap-1.5">
          <AlertCenter />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
