"use client"

import { NavLink } from "react-router-dom"
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
} from "lucide-react"
import { useAuthStore } from "@/app/stores/auth-store"
import { Rol } from "@/core/models/auth"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuthStore()

  const navItems = [
    {
      to: "/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
      roles: [Rol.SUPER_ADMIN, Rol.SUPERVISOR, Rol.GUIA],
    },
    {
      to: "/recaladas",
      icon: Anchor,
      label: "Recaladas",
      roles: [Rol.SUPER_ADMIN, Rol.SUPERVISOR, Rol.GUIA],
    },
    {
      to: "/turnos",
      icon: Clock,
      label: "Turnos",
      roles: [Rol.SUPER_ADMIN, Rol.SUPERVISOR, Rol.GUIA],
    },
    {
      to: "/users",
      icon: Users,
      label: "Usuarios",
      roles: [Rol.SUPER_ADMIN, Rol.SUPERVISOR],
    },
    {
      to: "/catalog/paises",
      icon: MapPin,
      label: "Paises",
      roles: [Rol.SUPER_ADMIN, Rol.SUPERVISOR],
    },
    {
      to: "/catalog/buques",
      icon: Ship,
      label: "Buques",
      roles: [Rol.SUPER_ADMIN, Rol.SUPERVISOR],
    },
    {
      to: "/invitations",
      icon: UserPlus,
      label: "Invitaciones",
      roles: [Rol.SUPER_ADMIN],
    },
    {
      to: "/profile",
      icon: User,
      label: "Mi Perfil",
      roles: [Rol.SUPER_ADMIN, Rol.SUPERVISOR, Rol.GUIA],
    },
  ]

  const filteredNavItems = navItems.filter(
    (item) => user && item.roles.includes(user.rol)
  )

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[rgb(var(--color-bg)/0.8)] backdrop-blur-sm z-40 md:hidden animate-fade-in-up"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          glass-strong fixed left-0 top-16 bottom-0 w-64 z-40
          transition-transform duration-300 ease-out
          border-r border-[rgb(var(--color-border)/0.06)]
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Close button (mobile) */}
        <button
          onClick={onClose}
          className="md:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-[rgb(var(--color-glass-hover)/0.5)] transition-colors focus-ring"
          aria-label="Cerrar menu"
        >
          <X className="w-5 h-5 text-[rgb(var(--color-fg))]" />
        </button>

        {/* Logo section */}
        <div className="p-5 border-b border-[rgb(var(--color-border)/0.06)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgb(var(--color-primary))] flex items-center justify-center">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-[rgb(var(--color-fg))]">CORPOTURISMO</p>
              <p className="text-xs text-[rgb(var(--color-muted))]">
                Gestion de Guias
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
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

        {/* Footer decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[rgb(var(--color-primary)/0.05)] to-transparent pointer-events-none" />
      </aside>
    </>
  )
}
