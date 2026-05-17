"use client"

import { useMemo, useState } from "react"
import { AppShell } from "@/shared/components/layout/AppShell"
import { GlassButton } from "@/shared/components/glass/GlassButton"
import { GlassInput } from "@/shared/components/glass/GlassInput"
import { SearchableCombobox } from "@/shared/components/glass/SearchableCombobox"
import { FilterChips } from "@/shared/components/glass/FilterChips"
import { SkeletonTable } from "@/shared/components/feedback/Skeleton"
import { useToast } from "@/shared/components/feedback/Toast"
import { useUsers } from "@/hooks/use-users"
import { useGuidesLookup } from "@/hooks/use-guides"
import { UserFormDialog } from "./UserFormDialog"
import { DeleteUserDialog } from "./DeleteUserDialog"
import { Rol } from "@/core/models/auth"
import type { User } from "@/core/models/auth"
import type { ProfileStatus } from "@/core/models/users"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Mail,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Clock3,
  Sliders,
  Users as UsersIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useAuthStore } from "@/app/stores/auth-store"

type AvailabilityStatus = "disponible" | "no-disponible" | "penalizado"
type AvailabilityFilter = "todos" | AvailabilityStatus

type EnrichedUser = User & {
  _opStatus?: AvailabilityStatus | null
  _opUpdatedAt?: string | null
}

const ROLE_LABEL: Record<string, string> = {
  [Rol.SUPER_ADMIN]: "Super Admin",
  [Rol.SUPERVISOR]: "Supervisor",
  [Rol.GUIA]: "Guía",
}

const PROFILE_STATUS_LABEL: Record<string, string> = {
  COMPLETE: "Completo",
  INCOMPLETE: "Incompleto",
}

function roleAccent(rol: Rol) {
  switch (rol) {
    case Rol.SUPER_ADMIN:
      return {
        fg: "rgb(var(--color-accent))",
        bg: "rgba(var(--color-accent), 0.10)",
        border: "rgba(var(--color-accent), 0.20)",
      }
    case Rol.SUPERVISOR:
      return {
        fg: "rgb(var(--color-primary))",
        bg: "rgba(var(--color-primary), 0.10)",
        border: "rgba(var(--color-primary), 0.20)",
      }
    case Rol.GUIA:
    default:
      return {
        fg: "rgb(var(--color-success))",
        bg: "rgba(var(--color-success), 0.10)",
        border: "rgba(var(--color-success), 0.20)",
      }
  }
}

function statusAccent(status: AvailabilityStatus) {
  switch (status) {
    case "disponible":
      return {
        label: "Disponible",
        fg: "rgb(var(--color-success))",
        bg: "rgba(var(--color-success), 0.10)",
      }
    case "no-disponible":
      return {
        label: "No disponible",
        fg: "rgb(var(--color-muted))",
        bg: "rgba(var(--color-border), 0.06)",
      }
    case "penalizado":
      return {
        label: "Penalizado",
        fg: "rgb(var(--color-warning))",
        bg: "rgba(var(--color-warning), 0.10)",
      }
  }
}

function buildInitials(u: { nombres?: string | null; apellidos?: string | null; email: string }) {
  const first = (u.nombres ?? "").trim().charAt(0)
  const last = (u.apellidos ?? "").trim().charAt(0)
  const combo = `${first}${last}`.toUpperCase()
  if (combo) return combo
  return (u.email?.charAt(0) ?? "?").toUpperCase()
}

function formatRelative(value?: string | null) {
  if (!value) return null
  const diff = Date.now() - new Date(value).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return "Hace instantes"
  if (minutes < 60) return `Hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Hace ${hours} h`
  const days = Math.floor(hours / 24)
  return `Hace ${days} d`
}

export function UsersListPage() {
  const { user: currentUser } = useAuthStore()
  const { showToast } = useToast()

  // Filters
  const [q, setQ] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("")
  const [activoFilter, setActivoFilter] = useState<string>("")
  const [profileStatusFilter, setProfileStatusFilter] = useState<string>("")
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>("todos")

  // Advanced
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [orderBy, setOrderBy] = useState<string>("createdAt")
  const [orderDir, setOrderDir] = useState<string>("desc")

  // Pagination
  const [page, setPage] = useState(1)
  const pageSize = 10

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)

  const { users, meta, isLoading } = useUsers({
    q: q || undefined,
    role: roleFilter ? (roleFilter as Rol) : undefined,
    activo: activoFilter ? activoFilter === "true" : undefined,
    profileStatus: profileStatusFilter ? (profileStatusFilter as ProfileStatus) : undefined,
    orderBy: orderBy as "createdAt" | "updatedAt" | "email",
    orderDir: orderDir as "asc" | "desc",
    page,
    pageSize,
  })

  // Pull global guide availability state (read-only enrichment)
  const { guides } = useGuidesLookup({ pageSize: 500 })
  const availabilityByGuiaId = useMemo(() => {
    const map = new Map<string, { status: AvailabilityStatus; updatedAt: string | null }>()
    for (const g of guides) {
      const status: AvailabilityStatus = g.pendingPenalty
        ? "penalizado"
        : g.disponibleParaTurnos
          ? "disponible"
          : "no-disponible"
      map.set(g.guiaId, { status, updatedAt: g.disponibilidadUpdatedAt })
    }
    return map
  }, [guides])

  // Enrich users with availability status
  const enrichedUsers = useMemo<EnrichedUser[]>(() => {
    return users.map((u) => {
      const lookup =
        u.rol === Rol.GUIA && u.guiaId ? availabilityByGuiaId.get(u.guiaId) : undefined
      return {
        ...u,
        _opStatus: lookup?.status ?? (u.rol === Rol.GUIA ? "no-disponible" : null),
        _opUpdatedAt: lookup?.updatedAt ?? u.disponibilidadUpdatedAt ?? null,
      }
    })
  }, [users, availabilityByGuiaId])

  // Client-side filter for availability (only applies to GUIAs)
  const visibleUsers = useMemo(() => {
    if (availabilityFilter === "todos") return enrichedUsers
    return enrichedUsers.filter(
      (u) => u.rol === Rol.GUIA && u._opStatus === availabilityFilter
    )
  }, [enrichedUsers, availabilityFilter])

  // Stats for the filter chips
  const guideStats = useMemo(() => {
    const guidesOnly = enrichedUsers.filter((u) => u.rol === Rol.GUIA)
    return {
      total: guidesOnly.length,
      disponibles: guidesOnly.filter((u) => u._opStatus === "disponible").length,
      noDisponibles: guidesOnly.filter((u) => u._opStatus === "no-disponible").length,
      penalizados: guidesOnly.filter((u) => u._opStatus === "penalizado").length,
    }
  }, [enrichedUsers])

  const handleSearch = (value: string) => {
    setQ(value)
    setPage(1)
  }
  const handleRoleFilter = (value: string) => {
    setRoleFilter(value)
    setPage(1)
  }
  const handleActivoFilter = (value: string) => {
    setActivoFilter(value)
    setPage(1)
  }
  const handleProfileStatusFilter = (value: string) => {
    setProfileStatusFilter(value)
    setPage(1)
  }
  const handleOrderChange = (field: string) => {
    if (orderBy === field) {
      setOrderDir(orderDir === "asc" ? "desc" : "asc")
    } else {
      setOrderBy(field)
      setOrderDir("desc")
    }
    setPage(1)
  }

  const canCreateUser = currentUser?.rol === Rol.SUPER_ADMIN

  const activeChips = [
    roleFilter && {
      key: "role",
      label: `Rol: ${ROLE_LABEL[roleFilter] ?? roleFilter}`,
      onRemove: () => handleRoleFilter(""),
    },
    activoFilter && {
      key: "activo",
      label: `Estado: ${activoFilter === "true" ? "Activo" : "Inactivo"}`,
      onRemove: () => handleActivoFilter(""),
    },
    profileStatusFilter && {
      key: "profile",
      label: `Perfil: ${PROFILE_STATUS_LABEL[profileStatusFilter] ?? profileStatusFilter}`,
      onRemove: () => handleProfileStatusFilter(""),
    },
    availabilityFilter !== "todos" && {
      key: "availability",
      label: `Disponibilidad: ${statusAccent(availabilityFilter as AvailabilityStatus).label}`,
      onRemove: () => setAvailabilityFilter("todos"),
    },
  ].filter(Boolean) as { key: string; label: string; onRemove: () => void }[]

  const resetFilters = () => {
    setRoleFilter("")
    setActivoFilter("")
    setProfileStatusFilter("")
    setAvailabilityFilter("todos")
    setQ("")
    setPage(1)
  }

  const total = meta?.total ?? 0

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 animate-fade-in-up">
          <div>
            <p
              className="text-[11px] font-semibold uppercase mb-1"
              style={{
                color: "rgb(var(--color-muted))",
                letterSpacing: "0.12em",
              }}
            >
              Administración
            </p>
            <h1
              className="text-3xl font-bold"
              style={{
                color: "rgb(var(--color-fg))",
                letterSpacing: "-0.02em",
              }}
            >
              Usuarios
            </h1>
            <p
              className="mt-1.5 text-sm"
              style={{ color: "rgb(var(--color-muted))" }}
            >
              Administra cuentas, roles y disponibilidad operativa del equipo.
            </p>
          </div>

          {canCreateUser && (
            <GlassButton variant="primary" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4" />
              Nuevo usuario
            </GlassButton>
          )}
        </div>

        {/* Stats strip */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in-up"
          style={{ animationDelay: "0.05s" }}
        >
          <StatTile
            label="Total"
            value={String(total)}
            sublabel={`${visibleUsers.length} visibles`}
            accent="primary"
          />
          <StatTile
            label="Guías activos"
            value={String(guideStats.total)}
            sublabel={`${guideStats.disponibles} disponibles`}
            accent="success"
          />
          <StatTile
            label="No disponibles"
            value={String(guideStats.noDisponibles)}
            sublabel="No reciben turnos"
            accent="neutral"
          />
          <StatTile
            label="Penalizados"
            value={String(guideStats.penalizados)}
            sublabel={
              guideStats.penalizados > 0 ? "Requiere revisión" : "Todo en orden"
            }
            accent="warning"
          />
        </div>

        {/* Filters card */}
        <div
          className="rounded-2xl p-5 animate-fade-in-up"
          style={{
            background: "rgb(var(--color-bg-elevated))",
            border: "1px solid rgba(var(--color-border), 0.07)",
            boxShadow: "var(--shadow-sm)",
            animationDelay: "0.1s",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sliders
                className="w-4 h-4"
                style={{ color: "rgb(var(--color-muted))" }}
              />
              <span
                className="text-[11px] font-semibold uppercase"
                style={{
                  color: "rgb(var(--color-muted))",
                  letterSpacing: "0.1em",
                }}
              >
                Filtros
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1 text-sm font-medium transition-colors"
              style={{ color: "rgb(var(--color-primary))" }}
            >
              {showAdvanced ? "Ocultar avanzados" : "Mostrar avanzados"}
              {showAdvanced ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Basic filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <GlassInput
              placeholder="Buscar por email o nombre..."
              value={q}
              onChange={(e) => handleSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
            <SearchableCombobox
              options={[
                { value: Rol.SUPER_ADMIN, label: "Super Admin" },
                { value: Rol.SUPERVISOR, label: "Supervisor" },
                { value: Rol.GUIA, label: "Guía" },
              ]}
              value={roleFilter}
              onChange={handleRoleFilter}
              placeholder="Todos los roles"
              searchable={false}
            />
            <SearchableCombobox
              options={[
                { value: "true", label: "Activos" },
                { value: "false", label: "Inactivos" },
              ]}
              value={activoFilter}
              onChange={handleActivoFilter}
              placeholder="Todos los estados"
              searchable={false}
            />
            <SearchableCombobox
              options={[
                { value: "COMPLETE", label: "Completo" },
                { value: "INCOMPLETE", label: "Incompleto" },
              ]}
              value={profileStatusFilter}
              onChange={handleProfileStatusFilter}
              placeholder="Estado perfil"
              searchable={false}
            />
          </div>

          {/* Availability filter chips (only meaningful for guides) */}
          <div className="mt-4">
            <p
              className="text-[10.5px] font-semibold uppercase mb-2"
              style={{
                color: "rgb(var(--color-muted))",
                letterSpacing: "0.1em",
              }}
            >
              Disponibilidad operativa (guías)
            </p>
            <div className="flex flex-wrap gap-2">
              {(["todos", "disponible", "no-disponible", "penalizado"] as const).map(
                (id) => {
                  const active = availabilityFilter === id
                  const labelMap = {
                    todos: "Todos",
                    disponible: "Disponibles",
                    "no-disponible": "No disponibles",
                    penalizado: "Penalizados",
                  } as const
                  const countMap = {
                    todos: guideStats.total,
                    disponible: guideStats.disponibles,
                    "no-disponible": guideStats.noDisponibles,
                    penalizado: guideStats.penalizados,
                  } as const
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setAvailabilityFilter(id)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors focus-ring"
                      style={{
                        background: active
                          ? "rgb(var(--color-fg))"
                          : "rgba(var(--color-border), 0.04)",
                        color: active
                          ? "rgb(var(--color-bg-elevated))"
                          : "rgb(var(--color-fg))",
                        border: active
                          ? "1px solid rgb(var(--color-fg))"
                          : "1px solid rgba(var(--color-border), 0.08)",
                      }}
                    >
                      <span>{labelMap[id]}</span>
                      <span
                        className="text-[10px] tabular-nums"
                        style={{ opacity: 0.7 }}
                      >
                        {countMap[id]}
                      </span>
                    </button>
                  )
                }
              )}
            </div>
          </div>

          <div className="mt-4">
            <FilterChips chips={activeChips} onClearAll={resetFilters} />
          </div>

          {showAdvanced && (
            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4"
              style={{ borderTop: "1px solid rgba(var(--color-border), 0.07)" }}
            >
              <div>
                <label
                  className="block text-xs mb-1.5"
                  style={{ color: "rgb(var(--color-muted))" }}
                >
                  Ordenar por
                </label>
                <SearchableCombobox
                  options={[
                    { value: "createdAt", label: "Fecha de creación" },
                    { value: "updatedAt", label: "Última actualización" },
                    { value: "email", label: "Email" },
                  ]}
                  value={orderBy}
                  onChange={handleOrderChange}
                  searchable={false}
                />
              </div>
              <div>
                <label
                  className="block text-xs mb-1.5"
                  style={{ color: "rgb(var(--color-muted))" }}
                >
                  Dirección
                </label>
                <SearchableCombobox
                  options={[
                    { value: "desc", label: "Descendente" },
                    { value: "asc", label: "Ascendente" },
                  ]}
                  value={orderDir}
                  onChange={(val) => {
                    setOrderDir(val)
                    setPage(1)
                  }}
                  searchable={false}
                />
              </div>
            </div>
          )}
        </div>

        {/* List */}
        <div
          className="rounded-2xl overflow-hidden animate-fade-in-up"
          style={{
            background: "rgb(var(--color-bg-elevated))",
            border: "1px solid rgba(var(--color-border), 0.07)",
            boxShadow: "var(--shadow-sm)",
            animationDelay: "0.15s",
          }}
        >
          {isLoading ? (
            <div className="p-4">
              <SkeletonTable rows={5} />
            </div>
          ) : visibleUsers.length === 0 ? (
            <EmptyState onClearFilters={resetFilters} hasFilters={activeChips.length > 0 || !!q} />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <table className="w-full">
                  <thead>
                    <tr
                      style={{
                        background: "rgba(var(--color-border), 0.025)",
                        borderBottom: "1px solid rgba(var(--color-border), 0.06)",
                      }}
                    >
                      <Th>Usuario</Th>
                      <Th>Rol</Th>
                      <Th>Estado</Th>
                      <Th>Disponibilidad</Th>
                      <Th align="right">Acciones</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleUsers.map((u) => {
                      const role = roleAccent(u.rol)
                      const fullName =
                        u.nombres && u.apellidos
                          ? `${u.nombres} ${u.apellidos}`
                          : null
                      const initials = buildInitials(u)
                      const opStatus = u._opStatus
                      const opUpdated = formatRelative(u._opUpdatedAt)

                      return (
                        <tr
                          key={u.id}
                          className="transition-colors"
                          style={{
                            borderTop: "1px solid rgba(var(--color-border), 0.04)",
                          }}
                          onMouseEnter={(e) => {
                            ;(e.currentTarget as HTMLTableRowElement).style.background =
                              "rgba(var(--color-border), 0.025)"
                          }}
                          onMouseLeave={(e) => {
                            ;(e.currentTarget as HTMLTableRowElement).style.background =
                              "transparent"
                          }}
                        >
                          <Td>
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                                style={{
                                  background: role.bg,
                                  color: role.fg,
                                  border: `1px solid ${role.border}`,
                                }}
                              >
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <p
                                  className="text-sm font-semibold truncate"
                                  style={{ color: "rgb(var(--color-fg))" }}
                                >
                                  {fullName ?? "Sin nombre"}
                                </p>
                                <p
                                  className="text-xs truncate"
                                  style={{ color: "rgb(var(--color-muted))" }}
                                >
                                  {u.email}
                                </p>
                              </div>
                            </div>
                          </Td>
                          <Td>
                            <span
                              className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-md"
                              style={{
                                background: role.bg,
                                color: role.fg,
                                border: `1px solid ${role.border}`,
                              }}
                            >
                              {ROLE_LABEL[u.rol] ?? u.rol}
                            </span>
                          </Td>
                          <Td>
                            <span
                              className="inline-flex items-center gap-1.5 text-xs font-medium"
                              style={{
                                color: u.activo
                                  ? "rgb(var(--color-success))"
                                  : "rgb(var(--color-muted))",
                              }}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{
                                  background: u.activo
                                    ? "rgb(var(--color-success))"
                                    : "rgb(var(--color-muted))",
                                }}
                              />
                              {u.activo ? "Activo" : "Inactivo"}
                            </span>
                          </Td>
                          <Td>
                            {opStatus ? (
                              <AvailabilityChip status={opStatus} updatedAt={opUpdated} />
                            ) : (
                              <span
                                className="text-xs"
                                style={{ color: "rgb(var(--color-muted))" }}
                              >
                                —
                              </span>
                            )}
                          </Td>
                          <Td align="right">
                            <div className="flex items-center justify-end gap-1">
                              <IconButton
                                aria-label="Editar"
                                onClick={() => setEditingUser(u)}
                              >
                                <Edit className="w-4 h-4" />
                              </IconButton>
                              {canCreateUser && u.id !== currentUser?.id && (
                                <IconButton
                                  aria-label="Eliminar"
                                  tone="danger"
                                  onClick={() => setDeletingUser(u)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </IconButton>
                              )}
                            </div>
                          </Td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y" style={{ borderColor: "rgba(var(--color-border), 0.06)" }}>
                {visibleUsers.map((u, index) => {
                  const role = roleAccent(u.rol)
                  const fullName =
                    u.nombres && u.apellidos ? `${u.nombres} ${u.apellidos}` : null
                  const initials = buildInitials(u)
                  const opStatus = u._opStatus
                  const opUpdated = formatRelative(u._opUpdatedAt)

                  return (
                    <div
                      key={u.id}
                      className="p-4 animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.03}s` }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                          style={{
                            background: role.bg,
                            color: role.fg,
                            border: `1px solid ${role.border}`,
                          }}
                        >
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p
                                className="text-sm font-semibold truncate"
                                style={{ color: "rgb(var(--color-fg))" }}
                              >
                                {fullName ?? "Sin nombre"}
                              </p>
                              <div className="flex items-center gap-1 mt-0.5">
                                <Mail
                                  className="w-3 h-3 shrink-0"
                                  style={{ color: "rgb(var(--color-muted))" }}
                                />
                                <p
                                  className="text-xs truncate"
                                  style={{ color: "rgb(var(--color-muted))" }}
                                >
                                  {u.email}
                                </p>
                              </div>
                            </div>

                            <span
                              className="inline-flex items-center gap-1 text-[11px] font-semibold shrink-0"
                              style={{
                                color: u.activo
                                  ? "rgb(var(--color-success))"
                                  : "rgb(var(--color-muted))",
                              }}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{
                                  background: u.activo
                                    ? "rgb(var(--color-success))"
                                    : "rgb(var(--color-muted))",
                                }}
                              />
                              {u.activo ? "Activo" : "Inactivo"}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mt-2.5">
                            <span
                              className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md"
                              style={{
                                background: role.bg,
                                color: role.fg,
                                border: `1px solid ${role.border}`,
                              }}
                            >
                              {ROLE_LABEL[u.rol] ?? u.rol}
                            </span>
                            {opStatus && (
                              <AvailabilityChip status={opStatus} updatedAt={opUpdated} />
                            )}
                          </div>

                          <div className="flex items-center justify-end gap-1 mt-3">
                            <IconButton
                              aria-label="Editar"
                              onClick={() => setEditingUser(u)}
                            >
                              <Edit className="w-4 h-4" />
                            </IconButton>
                            {canCreateUser && u.id !== currentUser?.id && (
                              <IconButton
                                aria-label="Eliminar"
                                tone="danger"
                                onClick={() => setDeletingUser(u)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </IconButton>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Pagination */}
              {meta && meta.totalPages > 1 && (
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{ borderTop: "1px solid rgba(var(--color-border), 0.07)" }}
                >
                  <p
                    className="text-xs"
                    style={{ color: "rgb(var(--color-muted))" }}
                  >
                    Página{" "}
                    <span
                      className="font-semibold tabular-nums"
                      style={{ color: "rgb(var(--color-fg))" }}
                    >
                      {meta.page}
                    </span>{" "}
                    de{" "}
                    <span className="font-semibold tabular-nums">
                      {meta.totalPages}
                    </span>
                  </p>
                  <div className="flex gap-1">
                    <IconButton
                      aria-label="Página anterior"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </IconButton>
                    <IconButton
                      aria-label="Página siguiente"
                      onClick={() => setPage(page + 1)}
                      disabled={page === meta.totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </IconButton>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
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

/* ── helpers ── */

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode
  align?: "left" | "right"
}) {
  return (
    <th
      className={`px-5 py-3 text-[11px] font-semibold uppercase ${align === "right" ? "text-right" : "text-left"}`}
      style={{
        color: "rgb(var(--color-muted))",
        letterSpacing: "0.1em",
      }}
    >
      {children}
    </th>
  )
}

function Td({
  children,
  align = "left",
}: {
  children: React.ReactNode
  align?: "left" | "right"
}) {
  return (
    <td
      className={`px-5 py-3.5 text-sm align-middle ${align === "right" ? "text-right" : "text-left"}`}
      style={{ color: "rgb(var(--color-fg))" }}
    >
      {children}
    </td>
  )
}

function IconButton({
  children,
  onClick,
  tone = "default",
  disabled,
  "aria-label": ariaLabel,
}: {
  children: React.ReactNode
  onClick?: () => void
  tone?: "default" | "danger"
  disabled?: boolean
  "aria-label"?: string
}) {
  const color =
    tone === "danger" ? "rgb(var(--color-danger))" : "rgb(var(--color-fg))"
  const hoverBg =
    tone === "danger"
      ? "rgba(var(--color-danger), 0.08)"
      : "rgba(var(--color-border), 0.05)"

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="p-2 rounded-lg transition-colors focus-ring disabled:opacity-40 disabled:cursor-not-allowed"
      style={{ color }}
      onMouseEnter={(e) => {
        if (!disabled)
          (e.currentTarget as HTMLButtonElement).style.background = hoverBg
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.background = "transparent"
      }}
    >
      {children}
    </button>
  )
}

function AvailabilityChip({
  status,
  updatedAt,
}: {
  status: AvailabilityStatus
  updatedAt: string | null
}) {
  const s = statusAccent(status)
  return (
    <div className="inline-flex flex-col items-start gap-0.5">
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
        style={{ background: s.bg, color: s.fg }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: s.fg }}
        />
        {s.label}
        {status === "penalizado" && <AlertTriangle className="w-3 h-3" />}
      </span>
      {updatedAt && (
        <span
          className="inline-flex items-center gap-1 text-[10.5px]"
          style={{ color: "rgb(var(--color-muted))" }}
        >
          <Clock3 className="w-2.5 h-2.5" />
          {updatedAt}
        </span>
      )}
    </div>
  )
}

function StatTile({
  label,
  value,
  sublabel,
  accent,
}: {
  label: string
  value: string
  sublabel: string
  accent: "primary" | "success" | "warning" | "neutral"
}) {
  const accentColor =
    accent === "primary"
      ? "rgb(var(--color-primary))"
      : accent === "success"
        ? "rgb(var(--color-success))"
        : accent === "warning"
          ? "rgb(var(--color-warning))"
          : "rgb(var(--color-muted))"

  return (
    <div
      className="rounded-2xl p-4 relative overflow-hidden"
      style={{
        background: "rgb(var(--color-bg-elevated))",
        border: "1px solid rgba(var(--color-border), 0.07)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div
        className="absolute top-0 left-0 w-1 h-full"
        style={{ background: accentColor, opacity: 0.7 }}
      />
      <p
        className="text-[10.5px] font-semibold uppercase ml-2"
        style={{
          color: "rgb(var(--color-muted))",
          letterSpacing: "0.1em",
        }}
      >
        {label}
      </p>
      <p
        className="text-2xl font-bold mt-1 ml-2 tabular-nums"
        style={{
          color: "rgb(var(--color-fg))",
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </p>
      <p
        className="text-[11px] mt-1 ml-2 truncate"
        style={{ color: "rgb(var(--color-muted))" }}
      >
        {sublabel}
      </p>
    </div>
  )
}

function EmptyState({
  hasFilters,
  onClearFilters,
}: {
  hasFilters: boolean
  onClearFilters: () => void
}) {
  return (
    <div className="px-6 py-16 text-center">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
        style={{
          background: "rgba(var(--color-border), 0.05)",
          border: "1px solid rgba(var(--color-border), 0.07)",
        }}
      >
        <UsersIcon
          className="w-6 h-6"
          style={{ color: "rgb(var(--color-muted))" }}
        />
      </div>
      <p
        className="text-base font-semibold mb-1"
        style={{ color: "rgb(var(--color-fg))" }}
      >
        No se encontraron usuarios
      </p>
      <p
        className="text-sm max-w-sm mx-auto"
        style={{ color: "rgb(var(--color-muted))" }}
      >
        {hasFilters
          ? "Prueba ajustando los filtros activos o limpiándolos."
          : "Aún no hay usuarios registrados en el sistema."}
      </p>
      {hasFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-4 text-sm font-medium transition-colors focus-ring"
          style={{ color: "rgb(var(--color-primary))" }}
        >
          Limpiar filtros
        </button>
      )}
    </div>
  )
}
