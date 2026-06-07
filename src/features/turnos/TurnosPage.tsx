// src/features/turnos/TurnosPage.tsx
"use client"

import { useMemo, useState } from "react"
import { Clock, Filter, Users } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

import { AppShell } from "@/shared/components/layout/AppShell"
import { GlassCard, GlassCardContent } from "@/shared/components/glass/GlassCard"
import { GlassDateTimeInput } from "@/shared/components/glass/GlassDateTimeInput"
import { GlassButton } from "@/shared/components/glass/GlassButton"
import { SearchableCombobox } from "@/shared/components/glass/SearchableCombobox"
import { FilterChips } from "@/shared/components/glass/FilterChips"
import { Skeleton } from "@/shared/components/feedback/Skeleton"

import { useTurnos, usePendingCheckIns } from "@/hooks/use-turnos"
import { useGuidesLookup } from "@/hooks/use-guides"
import { useBuquesLookup } from "@/hooks/use-buques"
import { useTurnoSocket } from "@/hooks/use-turno-socket"
import { atencionesApi } from "@/core/api"

import { useAuthStore } from "@/app/stores/auth-store"
import { Rol } from "@/core/models/auth"
import type { TurnoStatus, TurnoDateField } from "@/core/models/turnos"

import { TurnoCard } from "./components/TurnoCard"

function getTodayDateInputValue() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const day = String(today.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function TurnosPage() {
  const { user } = useAuthStore()

  const [statusFilter, setStatusFilter] = useState<string>("")
  const [atencionFilter, setAtencionFilter] = useState<string>("")
  const [guiaFilter, setGuiaFilter] = useState<string>("")
  const [buqueFilter, setBuqueFilter] = useState<string>("")
  const [dateFrom, setDateFrom] = useState<string>("")
  const [dateTo, setDateTo] = useState<string>("")
  const [dateField, setDateField] = useState<string>("overlap")
  const [page, setPage] = useState(1)
  const pageSize = 24

  const isSupervisor = user?.rol === Rol.SUPER_ADMIN || user?.rol === Rol.SUPERVISOR
  const isGuia = user?.rol === Rol.GUIA

  const { data: atencionesResp, isLoading: loadingAtenciones } = useQuery({
    queryKey: ["atenciones", { pageSize: 100 }],
    queryFn: () => atencionesApi.getAtenciones({ pageSize: 100 }),
    staleTime: 30_000,
    enabled: isSupervisor,
  })
  const atenciones = atencionesResp?.data ?? []

  const { guides, isLoading: loadingGuias } = useGuidesLookup({ enabled: isSupervisor })
  const { buques, isLoading: loadingBuques } = useBuquesLookup({ enabled: isSupervisor })

  useTurnoSocket({
    atencionId: isSupervisor && atencionFilter ? Number(atencionFilter) : undefined,
  })

  const guiaDefaultDateFrom = useMemo(() => getTodayDateInputValue(), [])
  const effectiveDateFrom = isGuia && !dateFrom && !dateTo ? guiaDefaultDateFrom : dateFrom || undefined

  const { turnos, meta, isLoading, refetch } = useTurnos(
    {
      status: statusFilter ? (statusFilter as TurnoStatus) : undefined,
      atencionId: isSupervisor && atencionFilter ? Number(atencionFilter) : undefined,
      guiaId: isSupervisor && guiaFilter ? guiaFilter : undefined,
      buqueId: isSupervisor && buqueFilter ? Number(buqueFilter) : undefined,
      dateFrom: effectiveDateFrom,
      dateTo: dateTo || undefined,
      dateField: dateField ? (dateField as TurnoDateField) : undefined,
      page,
      pageSize,
    },
    {
      mode: isGuia ? "me" : "all",
      rolOverride: user?.rol ?? null,
    },
  )

  // Epica 5: check-ins pendientes (solo supervisor)
  const { data: pendingResp, refetch: refetchPending } = usePendingCheckIns(
    isSupervisor ? { pageSize: 20 } : undefined,
  )
  const pendingItems = isSupervisor ? pendingResp?.data ?? [] : []

  const hasActiveFilters = !!(statusFilter || atencionFilter || guiaFilter || buqueFilter || dateFrom || dateTo)

  const resetFilters = () => {
    setStatusFilter("")
    setAtencionFilter("")
    setGuiaFilter("")
    setBuqueFilter("")
    setDateFrom("")
    setDateTo("")
    setDateField("overlap")
    setPage(1)
  }

  const handleFilterChange = (setter: (v: string) => void) => (value: string) => {
    setter(value)
    setPage(1)
  }

  const statusOptions = [
    { value: "", label: "Todos los estados" },
    { value: "AVAILABLE", label: "Libre" },
    { value: "ASSIGNED", label: "Asignado" },
    { value: "IN_PROGRESS", label: "En curso" },
    { value: "COMPLETED", label: "Completado" },
    { value: "CANCELED", label: "Cancelado" },
    { value: "NO_SHOW", label: "No-show" },
  ]

  const dateFieldOptions = [
    { value: "overlap", label: "Ventana del turno" },
    { value: "createdAt", label: "Fecha de creación" },
    { value: "checkInAt", label: "Fecha de check-in" },
    { value: "checkOutAt", label: "Fecha de check-out" },
    { value: "canceledAt", label: "Fecha de cancelación" },
  ]

  const atencionOptions = useMemo(() => atenciones.map((a: any) => ({
    value: String(a.id),
    label: `Atención #${a.id} · ${new Date(a.fechaInicio).toLocaleDateString("es-CO")}`,
  })), [atenciones])

  const guiaOptions = useMemo(() => guides.map((g) => ({
    value: String(g.guiaId),
    label: `${g.nombres ?? ""} ${g.apellidos ?? ""}`.trim() || g.email,
  })), [guides])

  const buqueOptions = useMemo(() => buques.map((b) => ({
    value: String(b.id),
    label: b.nombre,
  })), [buques])

  const statusLabel: Record<string, string> = {
    AVAILABLE: "Libre", ASSIGNED: "Asignado", IN_PROGRESS: "En curso",
    COMPLETED: "Completado", CANCELED: "Cancelado", NO_SHOW: "No-show",
  }

  const activeChips = useMemo(() => [
    statusFilter && {
      key: "status", label: `Estado: ${statusLabel[statusFilter] ?? statusFilter}`,
      onRemove: () => handleFilterChange(setStatusFilter)(""),
    },
    atencionFilter && {
      key: "atencion", label: `Atención: #${atencionFilter}`,
      onRemove: () => handleFilterChange(setAtencionFilter)(""),
    },
    guiaFilter && {
      key: "guia", label: `Guía: ${guiaOptions.find((g) => g.value === guiaFilter)?.label ?? guiaFilter}`,
      onRemove: () => handleFilterChange(setGuiaFilter)(""),
    },
    buqueFilter && {
      key: "buque", label: `Buque: ${buqueOptions.find((b) => b.value === buqueFilter)?.label ?? buqueFilter}`,
      onRemove: () => handleFilterChange(setBuqueFilter)(""),
    },
    dateFrom && { key: "dateFrom", label: `Desde: ${dateFrom}`, onRemove: () => { setDateFrom(""); setPage(1) } },
    dateTo && { key: "dateTo", label: `Hasta: ${dateTo}`, onRemove: () => { setDateTo(""); setPage(1) } },
  ].filter(Boolean) as { key: string; label: string; onRemove: () => void }[], [
    statusFilter, atencionFilter, guiaFilter, buqueFilter, dateFrom, dateTo, guiaOptions, buqueOptions,
  ])

  // Stats summary (solo supervisor)
  const stats = useMemo(() => {
    return {
      total: turnos.length,
      available: turnos.filter((t) => t.status === "AVAILABLE").length,
      assigned: turnos.filter((t) => t.status === "ASSIGNED").length,
      inProgress: turnos.filter((t) => t.status === "IN_PROGRESS").length,
      completed: turnos.filter((t) => t.status === "COMPLETED").length,
    }
  }, [turnos])

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
                  {isSupervisor ? "Gestión de turnos y asignaciones de guías" : "Mis turnos asignados"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending check-ins (Epica 5) */}
        {isSupervisor && pendingItems.length > 0 && (
          <section
            className="animate-fade-in-up"
            style={{ animationDelay: "0.02s" }}
            aria-label="Check-ins pendientes de confirmación"
          >
            <GlassCard className="border border-[rgb(var(--color-warning)/0.28)] bg-[rgb(var(--color-warning)/0.04)]">
              <div className="space-y-4">
                <header className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="relative flex h-2 w-2"
                      aria-hidden="true"
                    >
                      <span className="absolute inset-0 animate-ping rounded-full bg-[rgb(var(--color-warning)/0.55)]" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[rgb(var(--color-warning))]" />
                    </span>
                    <div className="leading-tight">
                      <p className="text-sm font-semibold text-[rgb(var(--color-fg))]">
                        Check-ins pendientes
                      </p>
                      <p className="text-xs text-[rgb(var(--color-muted))]">
                        Confirma o rechaza para que el turno inicie oficialmente.
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-[rgb(var(--color-warning)/0.16)] px-2 text-xs font-semibold text-[rgb(var(--color-warning))]">
                    {pendingItems.length}
                  </span>
                </header>
                <div
                  className="gap-3"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 280px))",
                    justifyContent: "start",
                  }}
                >
                  {pendingItems.map((t, i) => (
                    <TurnoCard
                      key={`pending-${t.id}`}
                      turno={t}
                      index={i}
                      canOperate
                      onRefresh={() => {
                        refetchPending()
                        refetch()
                      }}
                    />
                  ))}
                </div>
              </div>
            </GlassCard>
          </section>
        )}

        {/* Stats Cards */}
        {isSupervisor && (
          <div
            className="grid grid-cols-2 md:grid-cols-5 gap-3 animate-fade-in-up"
            style={{ animationDelay: "0.03s" }}
          >
            <GlassCard variant="subtle" className="p-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-[rgb(var(--color-fg))]">{stats.total}</p>
                <p className="text-xs text-[rgb(var(--color-muted))]">Total</p>
              </div>
            </GlassCard>
            <GlassCard variant="subtle" className="p-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-[rgb(var(--color-success))]">{stats.available}</p>
                <p className="text-xs text-[rgb(var(--color-muted))]">Libres</p>
              </div>
            </GlassCard>
            <GlassCard variant="subtle" className="p-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-[rgb(var(--color-info))]">{stats.assigned}</p>
                <p className="text-xs text-[rgb(var(--color-muted))]">Asignados</p>
              </div>
            </GlassCard>
            <GlassCard variant="subtle" className="p-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-[rgb(var(--color-warning))]">{stats.inProgress}</p>
                <p className="text-xs text-[rgb(var(--color-muted))]">En curso</p>
              </div>
            </GlassCard>
            <GlassCard variant="subtle" className="p-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-[rgb(var(--color-primary))]">{stats.completed}</p>
                <p className="text-xs text-[rgb(var(--color-muted))]">Completados</p>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Filters */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
          <GlassCard variant="subtle">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[rgb(var(--color-muted))]">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">Filtros</span>
                </div>
                {hasActiveFilters && (
                  <GlassButton variant="ghost" size="sm" onClick={resetFilters}>
                    Limpiar filtros
                  </GlassButton>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="min-w-[180px] flex-1">
                  <SearchableCombobox
                    options={statusOptions.filter((o) => o.value !== "")}
                    value={statusFilter}
                    onChange={handleFilterChange(setStatusFilter)}
                    placeholder="Todos los estados"
                    searchable={false}
                  />
                </div>

                {isSupervisor && (
                  <>
                    <div className="min-w-[220px] flex-1">
                      <SearchableCombobox
                        options={atencionOptions}
                        value={atencionFilter}
                        onChange={handleFilterChange(setAtencionFilter)}
                        placeholder="Todas las atenciones"
                        disabled={loadingAtenciones}
                      />
                    </div>
                    <div className="min-w-[200px] flex-1">
                      <SearchableCombobox
                        options={guiaOptions}
                        value={guiaFilter}
                        onChange={handleFilterChange(setGuiaFilter)}
                        placeholder="Todos los guías"
                        disabled={loadingGuias}
                      />
                    </div>
                    <div className="min-w-[180px] flex-1">
                      <SearchableCombobox
                        options={buqueOptions}
                        value={buqueFilter}
                        onChange={handleFilterChange(setBuqueFilter)}
                        placeholder="Todos los buques"
                        disabled={loadingBuques}
                      />
                    </div>
                  </>
                )}
              </div>

              <FilterChips chips={activeChips} onClearAll={resetFilters} />

              {isSupervisor && (
                <div className="flex flex-wrap items-end gap-3 pt-1 border-t border-[rgb(var(--color-border)/0.06)]">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-[rgb(var(--color-muted))]">Filtrar por</span>
                    <SearchableCombobox
                      options={dateFieldOptions}
                      value={dateField}
                      onChange={handleFilterChange(setDateField)}
                      searchable={false}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-[rgb(var(--color-muted))]">Desde</span>
                    <GlassDateTimeInput
                      type="date"
                      value={dateFrom}
                      onChange={(v) => { setDateFrom(v); setPage(1) }}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-[rgb(var(--color-muted))]">Hasta</span>
                    <GlassDateTimeInput
                      type="date"
                      value={dateTo}
                      onChange={(v) => { setDateTo(v); setPage(1) }}
                    />
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Content */}
        {isLoading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "1rem",
            }}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <GlassCard key={i} style={{ padding: 0 }}>
                <div className="pl-5 pr-4 pt-4 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1.5">
                      <Skeleton className="h-2 w-8" />
                      <Skeleton className="h-7 w-10" />
                    </div>
                    <Skeleton className="h-5 w-16 rounded-md" />
                  </div>
                </div>
                <div className="mx-4" style={{ height: "1px", background: "rgba(var(--color-border), 0.09)" }} />
                <div className="pl-5 pr-4 py-3 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-6 h-6 rounded-full shrink-0" />
                    <Skeleton className="h-3 flex-1" />
                  </div>
                </div>
                <div className="mx-4" style={{ height: "1px", background: "rgba(var(--color-border), 0.09)" }} />
                <div className="pl-5 pr-4 pb-4 pt-3 flex flex-col gap-1.5">
                  <Skeleton className="h-8 w-full rounded-lg" />
                  <div className="flex gap-1.5">
                    <Skeleton className="h-7 flex-1 rounded-lg" />
                    <Skeleton className="h-7 w-7 rounded-lg" />
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
                <p className="text-[rgb(var(--color-fg))] font-medium mb-1">No hay turnos disponibles</p>
                <p className="text-sm text-[rgb(var(--color-muted))]">
                  {statusFilter || (isSupervisor && atencionFilter)
                    ? "Prueba ajustando los filtros de búsqueda"
                    : isGuia
                      ? "Aún no tienes turnos asignados"
                      : "Los turnos se crean automáticamente al crear atenciones"}
                </p>
              </div>
            </GlassCardContent>
          </GlassCard>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: "1rem",
              }}
            >
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
                  Página {meta.page} de {meta.totalPages} ({meta.total} turnos)
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
      </div>
    </AppShell>
  )
}
