"use client"

import { useState } from "react"
import { Clock, Search, Filter, Calendar, Users } from "lucide-react"
import { AppShell } from "@/shared/components/layout/AppShell"
import { GlassCard, GlassCardContent } from "@/shared/components/glass/GlassCard"
import { GlassInput } from "@/shared/components/glass/GlassInput"
import { GlassSelect } from "@/shared/components/glass/GlassSelect"
import { GlassButton } from "@/shared/components/glass/GlassButton"
import { Skeleton } from "@/shared/components/feedback/Skeleton"
import { useTurnos } from "@/hooks/use-turnos"
import { useAtenciones } from "@/hooks/use-atenciones"
import { useAuthStore } from "@/app/stores/auth-store"
import { Rol } from "@/core/models/auth"
import type { TurnoStatus } from "@/core/models/turnos"
import { TurnoCard } from "./components/TurnoCard"
import { TurnoStatusBadge } from "./components/TurnoStatusBadge"

export function TurnosPage() {
  const { user } = useAuthStore()

  const [statusFilter, setStatusFilter] = useState<string>("")
  const [atencionFilter, setAtencionFilter] = useState<string>("")
  const [page, setPage] = useState(1)
  const pageSize = 24

  // Fetch atenciones for filter dropdown
  const { atenciones, isLoading: loadingAtenciones } = useAtenciones({
    pageSize: 100, // Get many for dropdown
  })

  // Fetch turnos with filters
  const { turnos, meta, isLoading, refetch } = useTurnos({
    status: statusFilter ? (statusFilter as TurnoStatus) : undefined,
    atencionId: atencionFilter ? Number(atencionFilter) : undefined,
    page,
    pageSize,
  })

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value)
    setPage(1)
  }

  const handleAtencionFilter = (value: string) => {
    setAtencionFilter(value)
    setPage(1)
  }

  const isSupervisor = user?.rol === Rol.SUPER_ADMIN || user?.rol === Rol.SUPERVISOR
  const isGuia = user?.rol === Rol.GUIA

  const statusOptions = [
    { value: "", label: "Todos los estados" },
    { value: "AVAILABLE", label: "Libre" },
    { value: "ASSIGNED", label: "Asignado" },
    { value: "IN_PROGRESS", label: "En curso" },
    { value: "COMPLETED", label: "Completado" },
    { value: "CANCELED", label: "Cancelado" },
    { value: "NO_SHOW", label: "No-show" },
  ]

  const atencionOptions = [
    { value: "", label: "Todas las atenciones" },
    ...atenciones.map((a) => ({
      value: String(a.id),
      label: `Atencion #${a.id} - ${new Date(a.fechaInicio).toLocaleDateString("es-CO")}`,
    })),
  ]

  // Stats summary
  const stats = {
    total: turnos.length,
    available: turnos.filter((t) => t.status === "AVAILABLE").length,
    assigned: turnos.filter((t) => t.status === "ASSIGNED").length,
    inProgress: turnos.filter((t) => t.status === "IN_PROGRESS").length,
    completed: turnos.filter((t) => t.status === "COMPLETED").length,
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[rgb(var(--color-primary)/0.15)] flex items-center justify-center">
                <Clock className="w-6 h-6 text-[rgb(var(--color-primary))]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[rgb(var(--color-fg))]">Turnos</h1>
                <p className="text-[rgb(var(--color-muted))]">
                  {isSupervisor 
                    ? "Gestion de turnos y asignaciones de guias"
                    : "Mis turnos asignados"
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {isSupervisor && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 animate-fade-in-up" style={{ animationDelay: "0.03s" }}>
            <GlassCard variant="subtle" className="p-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-[rgb(var(--color-fg))]">{stats.total}</p>
                <p className="text-xs text-[rgb(var(--color-muted))]">Total</p>
              </div>
            </GlassCard>
            <GlassCard variant="subtle" className="p-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-500">{stats.available}</p>
                <p className="text-xs text-[rgb(var(--color-muted))]">Libres</p>
              </div>
            </GlassCard>
            <GlassCard variant="subtle" className="p-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-500">{stats.assigned}</p>
                <p className="text-xs text-[rgb(var(--color-muted))]">Asignados</p>
              </div>
            </GlassCard>
            <GlassCard variant="subtle" className="p-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-500">{stats.inProgress}</p>
                <p className="text-xs text-[rgb(var(--color-muted))]">En curso</p>
              </div>
            </GlassCard>
            <GlassCard variant="subtle" className="p-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-500">{stats.completed}</p>
                <p className="text-xs text-[rgb(var(--color-muted))]">Completados</p>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Filters */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
          <GlassCard variant="subtle">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-[rgb(var(--color-muted))]">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filtros:</span>
              </div>
              <GlassSelect
                options={statusOptions}
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
              />
              <GlassSelect
                options={atencionOptions}
                value={atencionFilter}
                onChange={(e) => handleAtencionFilter(e.target.value)}
                disabled={loadingAtenciones}
              />
              {(statusFilter || atencionFilter) && (
                <GlassButton
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStatusFilter("")
                    setAtencionFilter("")
                    setPage(1)
                  }}
                >
                  Limpiar filtros
                </GlassButton>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <GlassCard key={i}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-12" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <div className="flex gap-1">
                    <Skeleton className="h-8 flex-1" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : turnos.length === 0 ? (
          <GlassCard className="animate-fade-in-up">
            <GlassCardContent>
              <div className="py-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[rgb(var(--color-primary)/0.1)] flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-[rgb(var(--color-primary))]" />
                </div>
                <p className="text-[rgb(var(--color-fg))] font-medium mb-1">
                  No hay turnos disponibles
                </p>
                <p className="text-sm text-[rgb(var(--color-muted))]">
                  {statusFilter || atencionFilter
                    ? "Prueba ajustando los filtros de busqueda"
                    : "Los turnos se crean automaticamente al crear atenciones"
                  }
                </p>
              </div>
            </GlassCardContent>
          </GlassCard>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {turnos.map((turno, index) => (
                <TurnoCard
                  key={turno.id}
                  turno={turno}
                  index={index}
                  canOperate={true}
                  onRefresh={refetch}
                />
              ))}
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 glass-subtle rounded-xl animate-fade-in-up">
                <p className="text-sm text-[rgb(var(--color-muted))]">
                  Pagina {meta.page} de {meta.totalPages} ({meta.total} turnos)
                </p>
                <div className="flex gap-2">
                  <GlassButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
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
      </div>
    </AppShell>
  )
}
