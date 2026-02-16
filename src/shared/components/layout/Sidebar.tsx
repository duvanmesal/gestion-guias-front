"use client"

import React from "react"
import { NavLink, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  UserPlus,
  User,
  X,
  ChevronRight,
  MapPin,
  Ship,
  Compass,
  Anchor,
  Clock,
  Activity,
  AlertTriangle,
  CalendarClock,
  Sparkles,
  Ticket,
  Play,
  Info,
} from "lucide-react"

import { useAuthStore } from "@/app/stores/auth-store"
import { Rol } from "@/core/models/auth"
import { useDashboardOverview } from "@/hooks/use-dashboard"

type WidgetTone = "neutral" | "info" | "success" | "warning" | "danger"
type WidgetType = "card" | "list" | "kpi" | "cta" | "alert"

type DashboardWidget = {
  id: string
  type: WidgetType
  title: string
  subtitle?: string
  tone?: WidgetTone
  icon?: string
  data?: any
  actions?: Array<{
    label: string
    action: "navigate" | "api"
    to?: string
    endpoint?: string
    method?: "POST" | "PATCH"
    body?: any
  }>
}

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

function toneToStyles(tone: WidgetTone | undefined) {
  switch (tone) {
    case "success":
      return {
        badgeBg: "bg-[rgb(var(--color-success)/0.14)]",
        badgeText: "text-[rgb(var(--color-success))]",
        ring: "focus:ring-[rgb(var(--color-success)/0.25)]",
      }
    case "warning":
      return {
        badgeBg: "bg-[rgb(var(--color-warning)/0.14)]",
        badgeText: "text-[rgb(var(--color-warning))]",
        ring: "focus:ring-[rgb(var(--color-warning)/0.25)]",
      }
    case "danger":
      return {
        badgeBg: "bg-[rgb(var(--color-danger)/0.14)]",
        badgeText: "text-[rgb(var(--color-danger))]",
        ring: "focus:ring-[rgb(var(--color-danger)/0.25)]",
      }
    case "info":
      return {
        badgeBg: "bg-[rgb(var(--color-accent)/0.14)]",
        badgeText: "text-[rgb(var(--color-accent))]",
        ring: "focus:ring-[rgb(var(--color-accent)/0.25)]",
      }
    default:
      return {
        badgeBg: "bg-[rgb(var(--color-glass-hover)/0.5)]",
        badgeText: "text-[rgb(var(--color-fg)/0.8)]",
        ring: "focus:ring-[rgb(var(--color-border)/0.25)]",
      }
  }
}

function iconFromKey(key?: string) {
  switch (key) {
    case "radar":
      return Activity
    case "alert-triangle":
      return AlertTriangle
    case "calendar-clock":
      return CalendarClock
    case "sparkles":
      return Sparkles
    case "ticket":
      return Ticket
    case "play":
      return Play
    case "info":
      return Info
    default:
      return Info
  }
}

function Clickable({
  to,
  onNavigate,
  className,
  children,
  ariaLabel,
}: {
  to?: string
  onNavigate: (to: string) => void
  className?: string
  children: React.ReactNode
  ariaLabel?: string
}) {
  if (!to) return <div className={className}>{children}</div>

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onClick={() => onNavigate(to)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onNavigate(to)
        }
      }}
      className={`${className ?? ""} cursor-pointer`}
    >
      {children}
    </div>
  )
}

function SidebarWidgetCard({
  widget,
  onNavigate,
}: {
  widget: DashboardWidget
  onNavigate: (to: string) => void
}) {
  const styles = toneToStyles(widget.tone)
  const Icon = iconFromKey(widget.icon)

  const primaryAction = widget.actions?.find((a) => a.action === "navigate" && a.to)
  const clickableTo = primaryAction?.to

  const summary = (() => {
    if (widget.type === "kpi") {
      const d = widget.data ?? {}
      const pairs: Array<[string, any]> = [
        ["Recaladas", d.recaladasHoy ?? d.recaladas],
        ["Atenciones", d.atencionesHoy ?? d.atenciones],
        ["Turnos", d.turnosTotal ?? d.turnos],
      ].filter(([, v]) => typeof v === "number") as any

      if (pairs.length) {
        return (
          <div className="grid grid-cols-3 gap-2 mt-3">
            {pairs.slice(0, 3).map(([k, v]) => (
              <div key={k} className="glass-subtle rounded-lg px-2 py-2">
                <p className="text-[10px] text-[rgb(var(--color-muted))] truncate">{k}</p>
                <p className="text-sm font-bold text-[rgb(var(--color-fg))]">{v}</p>
              </div>
            ))}
          </div>
        )
      }
    }

    if (widget.type === "alert") {
      const items = widget.data?.items
      if (Array.isArray(items) && items.length) {
        return (
          <div className="mt-3 space-y-1">
            {items.slice(0, 2).map((it: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between gap-2 text-xs">
                <span className="text-[rgb(var(--color-fg)/0.85)] truncate">
                  {it.label ?? "Alerta"}
                </span>
                {typeof it.count === "number" && (
                  <span className={`px-2 py-0.5 rounded-full ${styles.badgeBg} ${styles.badgeText}`}>
                    {it.count}
                  </span>
                )}
              </div>
            ))}
          </div>
        )
      }
    }

    if (widget.type === "list") {
      const items = widget.data?.items
      if (Array.isArray(items) && items.length) {
        return (
          <div className="mt-3 space-y-2">
            {items.slice(0, 2).map((it: any, idx: number) => (
              <div key={idx} className="text-xs text-[rgb(var(--color-fg)/0.85)]">
                <p className="truncate">{it.title ?? it.text ?? "Item"}</p>
                {it.at && (
                  <p className="text-[10px] text-[rgb(var(--color-muted))]">
                    {new Date(it.at).toLocaleString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                )}
              </div>
            ))}
          </div>
        )
      }
    }

    if (widget.type === "cta" || widget.type === "card") {
      const t = widget.data?.turno
      if (t?.recalada?.buqueNombre || t?.recalada?.codigoRecalada) {
        return (
          <div className="mt-3">
            <p className="text-xs text-[rgb(var(--color-fg)/0.85)] truncate">
              {t.recalada?.buqueNombre ?? "Buque"}
              {t.recalada?.codigoRecalada ? ` · ${t.recalada.codigoRecalada}` : ""}
            </p>
            {t.fechaInicio && t.fechaFin && (
              <p className="text-[10px] text-[rgb(var(--color-muted))] mt-0.5">
                {new Date(t.fechaInicio).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                {" - "}
                {new Date(t.fechaFin).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
              </p>
            )}
          </div>
        )
      }
    }

    return null
  })()

  return (
    <div className="glass-subtle rounded-2xl border border-[rgb(var(--color-border)/0.06)] overflow-hidden">
      <Clickable
        to={clickableTo}
        onNavigate={onNavigate}
        ariaLabel={widget.title}
        className="p-4 focus-ring"
      >
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${styles.badgeBg}`}>
            <Icon className={`w-4 h-4 ${styles.badgeText}`} />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-[rgb(var(--color-fg))] truncate">{widget.title}</p>
            {widget.subtitle && (
              <p className="text-xs text-[rgb(var(--color-muted))] mt-0.5 line-clamp-2">
                {widget.subtitle}
              </p>
            )}
            {summary}
          </div>
        </div>
      </Clickable>

      {primaryAction?.label && clickableTo && (
        <div className="px-4 pb-4">
          <div
            role="button"
            tabIndex={0}
            onClick={() => onNavigate(clickableTo)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onNavigate(clickableTo)
              }
            }}
            className={`mt-3 w-full text-left text-xs font-medium px-3 py-2 rounded-xl hover:bg-[rgb(var(--color-glass-hover)/0.55)] transition-colors focus-ring ${styles.ring} cursor-pointer`}
          >
            <span className="inline-flex items-center justify-between w-full">
              <span className="text-[rgb(var(--color-fg))]">{primaryAction.label}</span>
              <ChevronRight className="w-4 h-4 text-[rgb(var(--color-muted))]" />
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const { overview } = useDashboardOverview({ enabled: !!user })
  const widgets: DashboardWidget[] = (overview as any)?.widgets ?? []

  const sidebarWidgets = (() => {
    if (!user) return []

    if (user.rol === Rol.GUIA) {
      const priority = ["guia-active-turno", "guia-next-turno", "guia-disponibles", "guia-week-kpis"]
      const ordered = priority
        .map((id) => widgets.find((w) => w.id === id))
        .filter(Boolean) as DashboardWidget[]
      return ordered // 👈 aquí no limitamos; si hay muchos, el scroll lo soporta
    }

    const priority = ["sup-operation-today", "sup-alerts", "sup-guides", "sup-upcoming"]
    const ordered = priority
      .map((id) => widgets.find((w) => w.id === id))
      .filter(Boolean) as DashboardWidget[]
    return ordered
  })()

  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: [Rol.SUPER_ADMIN, Rol.SUPERVISOR, Rol.GUIA] },
    { to: "/recaladas", icon: Anchor, label: "Recaladas", roles: [Rol.SUPER_ADMIN, Rol.SUPERVISOR, Rol.GUIA] },
    { to: "/turnos", icon: Clock, label: "Turnos", roles: [Rol.SUPER_ADMIN, Rol.SUPERVISOR, Rol.GUIA] },
    { to: "/users", icon: Users, label: "Usuarios", roles: [Rol.SUPER_ADMIN] },
    { to: "/catalog/paises", icon: MapPin, label: "Paises", roles: [Rol.SUPER_ADMIN, Rol.SUPERVISOR] },
    { to: "/catalog/buques", icon: Ship, label: "Buques", roles: [Rol.SUPER_ADMIN, Rol.SUPERVISOR] },
    { to: "/invitations", icon: UserPlus, label: "Invitaciones", roles: [Rol.SUPER_ADMIN] },
    { to: "/profile", icon: User, label: "Mi Perfil", roles: [Rol.SUPER_ADMIN, Rol.SUPERVISOR, Rol.GUIA] },
  ]

  const filteredNavItems = navItems.filter((item) => user && item.roles.includes(user.rol))

  function onNavigate(to: string) {
    navigate(to)
    onClose()
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-[rgb(var(--color-bg)/0.8)] backdrop-blur-sm z-40 md:hidden animate-fade-in-up"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          glass-strong fixed left-0 top-16 bottom-0 w-64 z-40
          transition-transform duration-300 ease-out
          border-r border-[rgb(var(--color-border)/0.06)]
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          flex flex-col
        `}
      >
        <button
          onClick={onClose}
          className="md:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-[rgb(var(--color-glass-hover)/0.5)] transition-colors focus-ring"
          aria-label="Cerrar menu"
        >
          <X className="w-5 h-5 text-[rgb(var(--color-fg))]" />
        </button>

        {/* Header fijo */}
        <div className="p-5 border-b border-[rgb(var(--color-border)/0.06)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgb(var(--color-primary))] flex items-center justify-center">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-[rgb(var(--color-fg))]">CORPOTURISMO</p>
              <p className="text-xs text-[rgb(var(--color-muted))]">Gestion de Guias</p>
            </div>
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* Navigation primero */}
          <nav className="space-y-1">
            {filteredNavItems.map((item, index) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                style={{ animationDelay: `${index * 0.05}s` }}
                className={({ isActive }) =>
                  `flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200 focus-ring group animate-fade-in-up ${
                    isActive
                      ? "bg-[rgb(var(--color-primary)/0.15)] text-[rgb(var(--color-primary))] border-l-3 border-[rgb(var(--color-primary))]"
                      : "text-[rgb(var(--color-fg)/0.7)] hover:bg-[rgb(var(--color-glass-hover)/0.5)] hover:text-[rgb(var(--color-fg))]"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
              </NavLink>
            ))}
          </nav>

          {/* Widgets después */}
          {sidebarWidgets.length > 0 && (
            <div className="space-y-3 pt-2">
              {sidebarWidgets.map((w, idx) => (
                <div
                  key={w.id}
                  style={{ animationDelay: `${0.05 + idx * 0.05}s` }}
                  className="animate-fade-in-up"
                >
                  <SidebarWidgetCard widget={w} onNavigate={onNavigate} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Degradado inferior fijo */}
        <div className="h-16 bg-gradient-to-t from-[rgb(var(--color-primary)/0.06)] to-transparent pointer-events-none" />
      </aside>
    </>
  )
}
