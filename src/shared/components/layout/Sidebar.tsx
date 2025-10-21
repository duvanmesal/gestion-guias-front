"use client"

import { NavLink } from "react-router-dom"
import { LayoutDashboard, Users, UserPlus, User, X } from "lucide-react"
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
      {isOpen && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <aside
        className={`
          glass fixed left-0 top-16 bottom-0 w-64 p-3 z-40
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <button
          onClick={onClose}
          className="md:hidden absolute top-3 right-3 p-2 rounded-lg hover:bg-white/10 transition-colors focus-ring"
          aria-label="Cerrar menú"
        >
          <X className="w-5 h-5 text-[rgb(var(--color-fg))]" />
        </button>

        <nav className="space-y-1 mt-8 md:mt-0">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors focus-ring ${
                  isActive
                    ? "bg-[rgb(var(--color-primary)/0.2)] text-[rgb(var(--color-primary))]"
                    : "text-[rgb(var(--color-fg)/0.8)] hover:bg-white/10"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
