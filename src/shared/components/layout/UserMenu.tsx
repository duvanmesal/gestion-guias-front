"use client"

import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronDown, LogOut, Moon, Sun, UserCircle2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  SUPERVISOR: "Supervisor",
  GUIA: "Guía",
}

function applyTheme(theme: "dark" | "light") {
  if (theme === "dark") document.documentElement.classList.add("dark")
  else document.documentElement.classList.remove("dark")
}

export function UserMenu() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [shown, setShown] = useState(false)
  const [reduce, setReduce] = useState(false)
  const [theme, setTheme] = useState<"dark" | "light">(
    () => (localStorage.getItem("theme") as "dark" | "light") || "light"
  )
  const containerRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduce(mq.matches)
    const h = () => setReduce(mq.matches)
    mq.addEventListener?.("change", h)
    return () => mq.removeEventListener?.("change", h)
  }, [])

  const DURATION = reduce ? 0 : 240

  // Drive mount/visibility so the menu can animate in and out.
  useEffect(() => {
    if (open) {
      if (closeTimer.current) clearTimeout(closeTimer.current)
      setMounted(true)
      requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)))
    } else {
      setShown(false)
      if (closeTimer.current) clearTimeout(closeTimer.current)
      closeTimer.current = setTimeout(() => setMounted(false), DURATION)
    }
  }, [open, DURATION])

  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current) }, [])

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    document.addEventListener("keydown", handleEsc)
    return () => {
      document.removeEventListener("mousedown", handleClick)
      document.removeEventListener("keydown", handleEsc)
    }
  }, [open])

  if (!user) return null

  const roleLabel = user.rol ? (ROLE_LABEL[user.rol] ?? user.rol) : null
  const displayName = user.nombres || user.email?.split("@")[0] || "Usuario"
  const initials = (() => {
    const first = (user.nombres ?? "").trim().charAt(0)
    const last = (user.apellidos ?? "").trim().charAt(0)
    const combo = `${first}${last}`.toUpperCase()
    if (combo) return combo
    return (user.email?.charAt(0) ?? "U").toUpperCase()
  })()

  const isDark = theme === "dark"

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark"
    setTheme(next)
    localStorage.setItem("theme", next)
  }

  const goProfile = () => {
    setOpen(false)
    navigate("/profile")
  }

  const handleLogout = () => {
    setOpen(false)
    logout()
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-xl transition-colors focus-ring"
        style={{
          background: open
            ? "rgba(var(--color-primary), 0.08)"
            : "rgba(var(--color-border), 0.03)",
          border: "1px solid rgba(var(--color-border), 0.06)",
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Abrir menu de usuario"
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
          style={{
            background: "var(--gradient-primary)",
            color: "white",
            letterSpacing: "-0.01em",
          }}
        >
          {initials}
        </div>
        <div className="hidden sm:flex flex-col items-start leading-none">
          <span
            className="text-sm font-semibold"
            style={{ color: "rgb(var(--color-fg))" }}
          >
            {displayName}
          </span>
          {roleLabel && (
            <span
              className="text-[11px] mt-0.5 font-medium"
              style={{ color: "rgb(var(--color-muted))" }}
            >
              {roleLabel}
            </span>
          )}
        </div>
        <ChevronDown
          className={`hidden sm:block w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          style={{ color: "rgb(var(--color-muted))" }}
        />
      </button>

      {mounted && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-72 rounded-2xl overflow-hidden z-50 menu-pop"
          style={{
            background: "rgb(var(--color-bg-elevated))",
            border: "1px solid rgba(var(--color-border), 0.08)",
            boxShadow: "var(--shadow-lg)",
            transformOrigin: "top right",
            opacity: shown ? 1 : 0,
            transform: shown ? "translateY(0) scale(1)" : "translateY(-10px) scale(0.95)",
            transition: `opacity ${DURATION}ms var(--ease-out-soft), transform ${DURATION}ms var(--ease-out-soft)`,
            willChange: "transform, opacity",
          }}
        >
          {/* Identity block */}
          <div
            className="flex items-center gap-3 px-4 py-3.5"
            style={{ borderBottom: "1px solid rgba(var(--color-border), 0.06)" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
              style={{ background: "var(--gradient-primary)", color: "white" }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p
                className="text-sm font-semibold truncate"
                style={{ color: "rgb(var(--color-fg))" }}
              >
                {[user.nombres, user.apellidos].filter(Boolean).join(" ") || displayName}
              </p>
              <p
                className="text-xs truncate"
                style={{ color: "rgb(var(--color-muted))" }}
              >
                {user.email}
              </p>
            </div>
          </div>

          {/* Items */}
          <div className="py-1.5">
            <MenuButton
              icon={<UserCircle2 className="w-4 h-4" />}
              label="Mi perfil"
              onClick={goProfile}
            />

            <MenuToggle
              icon={isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              label="Tema"
              valueLabel={isDark ? "Oscuro" : "Claro"}
              isOn={isDark}
              onClick={toggleTheme}
            />
          </div>

          {/* Divider + danger zone */}
          <div
            className="py-1.5"
            style={{ borderTop: "1px solid rgba(var(--color-border), 0.06)" }}
          >
            <MenuButton
              icon={<LogOut className="w-4 h-4" />}
              label="Cerrar sesión"
              tone="danger"
              onClick={handleLogout}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function MenuButton({
  icon,
  label,
  onClick,
  tone = "default",
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  tone?: "default" | "danger"
}) {
  const color =
    tone === "danger" ? "rgb(var(--color-danger))" : "rgb(var(--color-fg))"
  const hoverBg =
    tone === "danger"
      ? "rgba(var(--color-danger), 0.07)"
      : "rgba(var(--color-border), 0.04)"

  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="motion-list-item flex items-center gap-2.5 w-full px-3 py-2.5 mx-1 rounded-lg text-sm font-medium focus-ring text-left"
      style={{ color, width: "calc(100% - 8px)" }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.background = hoverBg
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.background = "transparent"
      }}
    >
      <span className="motion-icon shrink-0" style={{ color }}>
        {icon}
      </span>
      <span>{label}</span>
    </button>
  )
}

function MenuToggle({
  icon,
  label,
  valueLabel,
  isOn,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  valueLabel: string
  isOn: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="menuitemcheckbox"
      aria-checked={isOn}
      onClick={onClick}
      className="motion-list-item flex items-center justify-between gap-2 w-full px-3 py-2.5 mx-1 rounded-lg text-sm font-medium focus-ring text-left"
      style={{ color: "rgb(var(--color-fg))", width: "calc(100% - 8px)" }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.background =
          "rgba(var(--color-border), 0.04)"
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.background = "transparent"
      }}
    >
      <span className="flex items-center gap-2.5">
        <span className="motion-icon shrink-0" style={{ color: "rgb(var(--color-fg))" }}>
          {icon}
        </span>
        <span>{label}</span>
      </span>

      <span className="flex items-center gap-2">
        <span
          className="text-xs"
          style={{ color: "rgb(var(--color-muted))" }}
        >
          {valueLabel}
        </span>
        <span
          className="relative inline-block w-9 h-5 rounded-full transition-colors"
          style={{
            background: isOn
              ? "rgb(var(--color-primary))"
              : "rgba(var(--color-border), 0.18)",
          }}
        >
          <span
            className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white"
            style={{
              transform: isOn ? "translateX(16px)" : "translateX(0)",
              transition: "transform var(--motion-base) var(--ease-spring-soft)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
            }}
          />
        </span>
      </span>
    </button>
  )
}

