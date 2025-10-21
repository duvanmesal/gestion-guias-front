"use client"

import { NavLink } from "react-router-dom"
import { LayoutDashboard, Users, UserPlus, User, X, ChevronRight } from "lucide-react"
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
      to: "/users",
      icon: Users,
      label: "Usuarios",
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

  const filteredNavItems = navItems.filter((item) => user && item.roles.includes(user.rol))

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 md:hidden animate-fade-in-up"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          glass-strong fixed left-0 top-16 bottom-0 w-64 p-5 z-40
          transition-all duration-300 ease-out
          border-r border-white/10
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <button
          onClick={onClose}
          className="md:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-all hover:rotate-90 focus-ring"
          aria-label="Cerrar menú"
        >
          <X className="w-5 h-5 text-[rgb(var(--color-fg))]" />
        </button>

        <div className="mb-8 mt-2 md:mt-0 animate-scale-in">
          <div className="flex items-center gap-3 px-2">
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[rgb(var(--color-primary))] to-[rgb(var(--color-accent))] flex items-center justify-center shadow-lg">
              <LayoutDashboard className="w-6 h-6 text-white" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[rgb(var(--color-primary))] to-[rgb(var(--color-accent))] opacity-50 blur-md -z-10" />
            </div>
            <div>
              <p className="font-bold text-lg text-[rgb(var(--color-fg))]">Gestión</p>
              <p className="text-xs text-[rgb(var(--color-fg)/0.5)]">Guías Turísticos</p>
            </div>
          </div>
        </div>

        <nav className="space-y-1.5">
          {filteredNavItems.map((item, index) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              style={{ animationDelay: `${index * 0.05}s` }}
              className={({ isActive }) =>
                `flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl transition-all focus-ring group animate-fade-in-up relative overflow-hidden ${
                  isActive
                    ? "bg-gradient-to-r from-[rgb(var(--color-primary)/0.2)] to-[rgb(var(--color-accent)/0.15)] text-[rgb(var(--color-fg))] border border-[rgb(var(--color-primary)/0.3)] shadow-lg accent-bar"
                    : "text-[rgb(var(--color-fg)/0.7)] hover:bg-white/5 hover:text-[rgb(var(--color-fg))] border border-transparent hover:border-white/5"
                }`
              }
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="font-medium">{item.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[rgb(var(--color-primary)/0.08)] to-transparent pointer-events-none" />
      </aside>
    </>
  )
}
