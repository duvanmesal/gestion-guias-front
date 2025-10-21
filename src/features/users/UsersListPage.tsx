"use client"

import { useState } from "react"
import { AppShell } from "@/shared/components/layout/AppShell"
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from "@/shared/components/glass/GlassCard"
import { GlassButton } from "@/shared/components/glass/GlassButton"
import { GlassInput } from "@/shared/components/glass/GlassInput"
import { GlassSelect } from "@/shared/components/glass/GlassSelect"
import {
  GlassTable,
  GlassTableHeader,
  GlassTableBody,
  GlassTableRow,
  GlassTableHead,
  GlassTableCell,
} from "@/shared/components/glass/GlassTable"
import { SkeletonTable } from "@/shared/components/feedback/Skeleton"
import { useToast } from "@/shared/components/feedback/Toast"
import { useUsers } from "@/hooks/use-users"
import { UserFormDialog } from "./UserFormDialog"
import { DeleteUserDialog } from "./DeleteUserDialog"
import { Rol } from "@/core/models/auth"
import type { User } from "@/core/models/auth"
import { Plus, Search, Edit, Trash2, CheckCircle, XCircle, UsersIcon, Filter, Mail, UserCircle } from "lucide-react"
import { useAuthStore } from "@/app/stores/auth-store"

export function UsersListPage() {
  const { user: currentUser } = useAuthStore()
  const { showToast } = useToast()

  const [search, setSearch] = useState("")
  const [rolFilter, setRolFilter] = useState<string>("")
  const [activoFilter, setActivoFilter] = useState<string>("")
  const [page, setPage] = useState(1)
  const pageSize = 10

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)

  const { users, meta, isLoading } = useUsers({
    search: search || undefined,
    rol: rolFilter ? (rolFilter as Rol) : undefined,
    activo: activoFilter ? activoFilter === "true" : undefined,
    page,
    pageSize,
  })

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleRolFilter = (value: string) => {
    setRolFilter(value)
    setPage(1)
  }

  const handleActivoFilter = (value: string) => {
    setActivoFilter(value)
    setPage(1)
  }

  const canCreateUser = currentUser?.rol === Rol.SUPER_ADMIN

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="glass-strong p-8 rounded-2xl border border-white/10 hover-lift animate-fade-in-up relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[rgb(var(--color-primary)/0.1)] to-transparent rounded-full blur-3xl" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-[rgb(var(--color-primary))] via-[rgb(var(--color-accent))] to-[rgb(var(--color-primary))] bg-clip-text text-transparent mb-2">
                Usuarios
              </h2>
              <p className="text-[rgb(var(--color-fg)/0.6)] text-base">Gestiona los usuarios del sistema</p>
            </div>

            {canCreateUser && (
              <GlassButton variant="primary" onClick={() => setIsCreateDialogOpen(true)} className="hover-glow">
                <Plus className="w-4 h-4" />
                Nuevo Usuario
              </GlassButton>
            )}
          </div>
        </div>

        <GlassCard className="border border-white/5 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <GlassCardContent>
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-[rgb(var(--color-primary))]" />
              <span className="text-sm font-medium text-[rgb(var(--color-fg)/0.7)]">Filtros</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-fg)/0.5)] pointer-events-none z-10" />
                <GlassInput
                  placeholder="Buscar por email, nombre..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <GlassSelect
                options={[
                  { value: "", label: "Todos los roles" },
                  { value: Rol.SUPER_ADMIN, label: "Super Admin" },
                  { value: Rol.SUPERVISOR, label: "Supervisor" },
                  { value: Rol.GUIA, label: "Guía" },
                ]}
                value={rolFilter}
                onChange={(e) => handleRolFilter(e.target.value)}
              />

              <GlassSelect
                options={[
                  { value: "", label: "Todos los estados" },
                  { value: "true", label: "Activos" },
                  { value: "false", label: "Inactivos" },
                ]}
                value={activoFilter}
                onChange={(e) => handleActivoFilter(e.target.value)}
              />
            </div>
          </GlassCardContent>
        </GlassCard>

        <GlassCard className="border border-white/5 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
          <GlassCardHeader>
            <div className="flex items-center gap-2">
              <UsersIcon className="w-5 h-5 text-[rgb(var(--color-primary))]" />
              <GlassCardTitle>
                Lista de Usuarios {meta && `(${meta.total} total${meta.total !== 1 ? "es" : ""})`}
              </GlassCardTitle>
            </div>
          </GlassCardHeader>
          <GlassCardContent className="p-0">
            {isLoading ? (
              <div className="p-4">
                <SkeletonTable rows={5} />
              </div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[rgb(var(--color-primary)/0.2)] to-[rgb(var(--color-accent)/0.1)] flex items-center justify-center mx-auto mb-4 border border-white/10">
                  <UsersIcon className="w-8 h-8 text-[rgb(var(--color-primary))]" />
                </div>
                <p className="text-[rgb(var(--color-fg))] font-medium mb-1">No se encontraron usuarios</p>
                <p className="text-sm text-[rgb(var(--color-fg)/0.5)]">Intenta ajustar los filtros de búsqueda</p>
              </div>
            ) : (
              <>
                <div className="hidden md:block">
                  <GlassTable>
                    <GlassTableHeader>
                      <GlassTableRow>
                        <GlassTableHead>Email</GlassTableHead>
                        <GlassTableHead>Nombre</GlassTableHead>
                        <GlassTableHead>Rol</GlassTableHead>
                        <GlassTableHead>Estado</GlassTableHead>
                        <GlassTableHead className="text-right">Acciones</GlassTableHead>
                      </GlassTableRow>
                    </GlassTableHeader>
                    <GlassTableBody>
                      {users.map((user) => (
                        <GlassTableRow key={user.id}>
                          <GlassTableCell className="font-medium">{user.email}</GlassTableCell>
                          <GlassTableCell>
                            {user.nombres && user.apellidos ? `${user.nombres} ${user.apellidos}` : "-"}
                          </GlassTableCell>
                          <GlassTableCell>
                            <span className="inline-block text-xs px-2.5 py-1 rounded-lg glass border border-white/10 bg-gradient-to-r from-[rgb(var(--color-primary)/0.2)] to-[rgb(var(--color-accent)/0.15)] text-[rgb(var(--color-primary))] font-medium">
                              {user.rol}
                            </span>
                          </GlassTableCell>
                          <GlassTableCell>
                            {user.activo ? (
                              <span className="flex items-center gap-1.5 text-green-400 text-sm font-medium">
                                <CheckCircle className="w-4 h-4" />
                                Activo
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-red-400 text-sm font-medium">
                                <XCircle className="w-4 h-4" />
                                Inactivo
                              </span>
                            )}
                          </GlassTableCell>
                          <GlassTableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <GlassButton
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingUser(user)}
                                className="hover-glow"
                              >
                                <Edit className="w-4 h-4" />
                              </GlassButton>
                              {canCreateUser && user.id !== currentUser?.id && (
                                <GlassButton variant="ghost" size="sm" onClick={() => setDeletingUser(user)}>
                                  <Trash2 className="w-4 h-4 text-red-400" />
                                </GlassButton>
                              )}
                            </div>
                          </GlassTableCell>
                        </GlassTableRow>
                      ))}
                    </GlassTableBody>
                  </GlassTable>
                </div>

                <div className="md:hidden space-y-3 p-4">
                  {users.map((user, index) => (
                    <div
                      key={user.id}
                      className="glass p-4 rounded-xl border border-white/10 hover-lift animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[rgb(var(--color-primary)/0.3)] to-[rgb(var(--color-accent)/0.2)] flex items-center justify-center border border-white/10">
                            <UserCircle className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                          </div>
                          <div>
                            <p className="font-medium text-[rgb(var(--color-fg))] text-sm">
                              {user.nombres && user.apellidos ? `${user.nombres} ${user.apellidos}` : "Sin nombre"}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Mail className="w-3 h-3 text-[rgb(var(--color-fg)/0.5)]" />
                              <p className="text-xs text-[rgb(var(--color-fg)/0.7)]">{user.email}</p>
                            </div>
                          </div>
                        </div>

                        {user.activo ? (
                          <div className="w-2 h-2 rounded-full bg-green-400 status-indicator" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-red-400" />
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-white/5">
                        <span className="text-xs px-2.5 py-1 rounded-lg glass border border-white/10 bg-gradient-to-r from-[rgb(var(--color-primary)/0.2)] to-[rgb(var(--color-accent)/0.15)] text-[rgb(var(--color-primary))] font-medium">
                          {user.rol}
                        </span>

                        <div className="flex items-center gap-2">
                          <GlassButton
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingUser(user)}
                            className="hover-glow"
                          >
                            <Edit className="w-4 h-4" />
                          </GlassButton>
                          {canCreateUser && user.id !== currentUser?.id && (
                            <GlassButton variant="ghost" size="sm" onClick={() => setDeletingUser(user)}>
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </GlassButton>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {meta && meta.totalPages > 1 && (
                  <div className="flex items-center justify-between p-5 border-t border-white/5 glass-strong">
                    <p className="text-sm text-[rgb(var(--color-fg)/0.6)] font-medium">
                      Página {meta.page} de {meta.totalPages}
                    </p>
                    <div className="flex gap-2">
                      <GlassButton variant="ghost" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
                        Anterior
                      </GlassButton>
                      <GlassButton
                        variant="ghost"
                        size="sm"
                        onClick={() => setPage(page + 1)}
                        disabled={page === meta.totalPages}
                      >
                        Siguiente
                      </GlassButton>
                    </div>
                  </div>
                )}
              </>
            )}
          </GlassCardContent>
        </GlassCard>
      </div>

      {/* Dialogs */}
      <UserFormDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={() => {
          setIsCreateDialogOpen(false)
          showToast("success", "Usuario creado exitosamente")
        }}
      />

      <UserFormDialog
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        user={editingUser}
        onSuccess={() => {
          setEditingUser(null)
          showToast("success", "Usuario actualizado exitosamente")
        }}
      />

      <DeleteUserDialog
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        user={deletingUser}
        onSuccess={() => {
          setDeletingUser(null)
          showToast("success", "Usuario eliminado exitosamente")
        }}
      />
    </AppShell>
  )
}
