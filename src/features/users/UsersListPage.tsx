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
import { Plus, Search, Edit, Trash2, CheckCircle, XCircle } from "lucide-react"
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-[rgb(var(--color-fg))]">Usuarios</h2>
            <p className="text-[rgb(var(--color-fg)/0.6)]">Gestiona los usuarios del sistema</p>
          </div>

          {canCreateUser && (
            <GlassButton variant="primary" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4" />
              Nuevo Usuario
            </GlassButton>
          )}
        </div>

        {/* Filters */}
        <GlassCard>
          <GlassCardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-fg)/0.5)] pointer-events-none" />
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

        {/* Users Table */}
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle>
              Lista de Usuarios {meta && `(${meta.total} total${meta.total !== 1 ? "es" : ""})`}
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent className="p-0">
            {isLoading ? (
              <div className="p-4">
                <SkeletonTable rows={5} />
              </div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-[rgb(var(--color-fg)/0.6)]">No se encontraron usuarios</p>
              </div>
            ) : (
              <>
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
                          <span className="inline-block text-xs px-2 py-1 rounded bg-[rgb(var(--color-primary)/0.2)] text-[rgb(var(--color-primary))]">
                            {user.rol}
                          </span>
                        </GlassTableCell>
                        <GlassTableCell>
                          {user.activo ? (
                            <span className="flex items-center gap-1 text-green-400">
                              <CheckCircle className="w-4 h-4" />
                              Activo
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-400">
                              <XCircle className="w-4 h-4" />
                              Inactivo
                            </span>
                          )}
                        </GlassTableCell>
                        <GlassTableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <GlassButton variant="ghost" size="sm" onClick={() => setEditingUser(user)}>
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

                {/* Pagination */}
                {meta && meta.totalPages > 1 && (
                  <div className="flex items-center justify-between p-4 border-t border-white/5">
                    <p className="text-sm text-[rgb(var(--color-fg)/0.6)]">
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
