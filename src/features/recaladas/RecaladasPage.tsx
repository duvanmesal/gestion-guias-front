"use client"

import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Anchor, Plus, Search, Calendar, AlertTriangle } from "lucide-react"
import { AppShell } from "@/shared/components/layout/AppShell"
import { GlassCard, GlassCardContent } from "@/shared/components/glass/GlassCard"
import { GlassInput } from "@/shared/components/glass/GlassInput"
import { GlassButton } from "@/shared/components/glass/GlassButton"
import { SearchableCombobox } from "@/shared/components/glass/SearchableCombobox"
import { FilterChips } from "@/shared/components/glass/FilterChips"
import { Skeleton } from "@/shared/components/feedback/Skeleton"
import { useToast } from "@/shared/components/feedback/Toast"
import { useRecaladas } from "@/hooks/use-recaladas"
import { useBuquesLookup } from "@/hooks/use-buques"
import { useAuthStore } from "@/app/stores/auth-store"
import { Rol } from "@/core/models/auth"
import { useRecaladaSocket } from "@/hooks/use-recalada-socket"
import type { RecaladaOperativeStatus } from "@/core/models/recaladas"
import { RecaladaCard } from "./components/RecaladaCard"
import { RecaladaFormDialog } from "./components/RecaladaFormDialog"

export function RecaladasPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { showToast } = useToast()
  useRecaladaSocket()

  const [searchParams, setSearchParams] = useSearchParams()
  const initialOverdue = ["1", "true"].includes(
    (searchParams.get("overdueDeparture") ?? "").toLowerCase(),
  )

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [buqueFilter, setBuqueFilter] = useState<string>("")
  const [overdueOnly, setOverdueOnly] = useState<boolean>(initialOverdue)
  const [page, setPage] = useState(1)
  const pageSize = 12

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // Sincroniza el filtro overdueDeparture con la URL en ambos sentidos.
  useEffect(() => {
    const fromUrl = ["1", "true"].includes(
      (searchParams.get("overdueDeparture") ?? "").toLowerCase(),
    )
    if (fromUrl !== overdueOnly) {
      setOverdueOnly(fromUrl)
      setPage(1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const { buques: buquesLookup, isLoading: loadingBuques } = useBuquesLookup()
  const { recaladas, meta, isLoading } = useRecaladas({
    q: search || undefined,
    operationalStatus: statusFilter ? (statusFilter as RecaladaOperativeStatus) : undefined,
    buqueId: buqueFilter ? Number(buqueFilter) : undefined,
    overdueDeparture: overdueOnly || undefined,
    page,
    pageSize,
  })

  const clearOverdueFilter = () => {
    setOverdueOnly(false)
    setPage(1)
    const next = new URLSearchParams(searchParams)
    next.delete("overdueDeparture")
    setSearchParams(next, { replace: true })
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value)
    setPage(1)
  }

  const handleBuqueFilter = (value: string) => {
    setBuqueFilter(value)
    setPage(1)
  }

  const canCreate = user?.rol === Rol.SUPER_ADMIN || user?.rol === Rol.SUPERVISOR

  const statusOptions = [
    { value: "", label: "Todos los estados" },
    { value: "SCHEDULED", label: "Programada" },
    { value: "ARRIVED", label: "Arribada" },
    { value: "DEPARTED", label: "Zarpada" },
    { value: "CANCELED", label: "Cancelada" },
  ]

  const buqueOptions = buquesLookup.map((b) => ({
    value: String(b.id),
    label: b.nombre,
  }))

  const statusLabel: Record<string, string> = {
    SCHEDULED: "Programada", ARRIVED: "Arribada", DEPARTED: "Zarpada", CANCELED: "Cancelada",
  }

  const activeChips = [
    statusFilter && {
      key: "status",
      label: `Estado: ${statusLabel[statusFilter] ?? statusFilter}`,
      onRemove: () => { setStatusFilter(""); setPage(1) },
    },
    buqueFilter && {
      key: "buque",
      label: `Buque: ${buquesLookup.find((b) => String(b.id) === buqueFilter)?.nombre ?? buqueFilter}`,
      onRemove: () => { setBuqueFilter(""); setPage(1) },
    },
    overdueOnly && {
      key: "overdue",
      label: "Solo vencidas pendientes de zarpe",
      onRemove: clearOverdueFilter,
    },
  ].filter(Boolean) as { key: string; label: string; onRemove: () => void }[]

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[rgb(var(--color-primary)/0.15)] flex items-center justify-center">
                <Anchor className="w-6 h-6 text-[rgb(var(--color-primary))]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[rgb(var(--color-fg))]">Recaladas</h1>
                <p className="text-[rgb(var(--color-muted))]">
                  Agenda de llegadas y zarpes de buques
                </p>
              </div>
            </div>
            {canCreate && (
              <GlassButton variant="primary" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4" />
                Nueva Recalada
              </GlassButton>
            )}
          </div>
        </div>

        {overdueOnly && (
          <div
            className="relative overflow-hidden rounded-2xl p-4 sm:p-5 animate-fade-in-up"
            style={{
              background:
                "linear-gradient(135deg, rgba(var(--color-danger), 0.10) 0%, rgba(var(--color-danger), 0.04) 60%, rgba(var(--color-danger), 0.07) 100%)",
              border: "1px solid rgba(var(--color-danger), 0.28)",
            }}
          >
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-[rgb(var(--color-danger))]" />
            <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[rgb(var(--color-danger)/0.10)] blur-2xl" />

            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="relative w-11 h-11 rounded-xl bg-[rgb(var(--color-danger)/0.14)] flex items-center justify-center shrink-0 ring-1 ring-[rgb(var(--color-danger)/0.22)]">
                  <span className="absolute inset-0 rounded-xl bg-[rgb(var(--color-danger)/0.18)] animate-ping opacity-40" />
                  <AlertTriangle className="relative w-5 h-5 text-[rgb(var(--color-danger))]" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-[rgb(var(--color-danger))]">
                      Filtro crítico activo
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[rgb(var(--color-danger)/0.14)] px-2 py-0.5 text-[10.5px] font-semibold text-[rgb(var(--color-danger))] ring-1 ring-[rgb(var(--color-danger)/0.18)]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--color-danger))]" />
                      ARRIVED · salida vencida
                    </span>
                  </div>
                  <p className="mt-1.5 text-[15px] font-bold leading-tight text-[rgb(var(--color-fg))] sm:text-base">
                    Recaladas vencidas pendientes de zarpe
                  </p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-[rgb(var(--color-muted))] sm:text-sm">
                    Esta vista muestra solo buques arribados cuya salida programada ya venció. Entra al detalle
                    para confirmar el zarpe y cerrar la operación.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <div className="relative rounded-xl bg-[rgb(var(--color-danger)/0.14)] px-3.5 py-2 text-center ring-1 ring-inset ring-[rgb(var(--color-danger)/0.20)]">
                  <p className="tabular-nums text-2xl font-black leading-none text-[rgb(var(--color-danger))]">
                    {isLoading ? "…" : meta?.total ?? recaladas.length}
                  </p>
                  <p className="mt-1 text-[9.5px] font-bold uppercase tracking-[0.14em] text-[rgb(var(--color-danger)/0.85)]">
                    en filtro
                  </p>
                </div>
                <GlassButton variant="ghost" size="sm" onClick={clearOverdueFilter}>
                  Quitar
                </GlassButton>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
          <GlassCard variant="subtle">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-muted))]" />
                    <GlassInput
                      type="text"
                      placeholder="Buscar por codigo o buque..."
                      value={search}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="min-w-[170px]">
                  <SearchableCombobox
                    options={statusOptions.filter((o) => o.value !== "")}
                    value={statusFilter}
                    onChange={handleStatusFilter}
                    placeholder="Todos los estados"
                    searchable={false}
                  />
                </div>
                <div className="min-w-[190px] flex-1">
                  <SearchableCombobox
                    options={buqueOptions}
                    value={buqueFilter}
                    onChange={handleBuqueFilter}
                    placeholder="Todos los buques"
                    disabled={loadingBuques}
                  />
                </div>
              </div>
              <FilterChips
                chips={activeChips}
                onClearAll={() => {
                  setStatusFilter("")
                  setBuqueFilter("")
                  setPage(1)
                  if (overdueOnly) clearOverdueFilter()
                }}
              />
            </div>
          </GlassCard>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <GlassCard key={i}>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-16 w-full" />
                  <div className="flex justify-end gap-2">
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : recaladas.length === 0 ? (
          <GlassCard className="animate-fade-in-up">
            <GlassCardContent>
              <div className="py-12 text-center">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                    overdueOnly ? "bg-[rgb(var(--color-danger)/0.1)]" : "bg-[rgb(var(--color-primary)/0.1)]"
                  }`}
                >
                  {overdueOnly ? (
                    <AlertTriangle className="w-8 h-8 text-[rgb(var(--color-danger))]" />
                  ) : (
                    <Calendar className="w-8 h-8 text-[rgb(var(--color-primary))]" />
                  )}
                </div>
                <p className="text-[rgb(var(--color-fg))] font-medium mb-1">
                  {overdueOnly ? "No hay recaladas vencidas" : "No hay recaladas registradas"}
                </p>
                <p className="text-sm text-[rgb(var(--color-muted))] mb-4">
                  {overdueOnly
                    ? "No existen recaladas arribadas con salida programada vencida para los filtros actuales."
                    : "Comienza programando la primera recalada"}
                </p>
                {overdueOnly ? (
                  <GlassButton variant="ghost" onClick={clearOverdueFilter}>
                    Ver todas las recaladas
                  </GlassButton>
                ) : canCreate && (
                  <GlassButton variant="primary" onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4" />
                    Crear primera recalada
                  </GlassButton>
                )}
              </div>
            </GlassCardContent>
          </GlassCard>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recaladas.map((recalada, index) => (
                <RecaladaCard
                  key={recalada.id}
                  recalada={recalada}
                  index={index}
                  onClick={() => navigate(`/recaladas/${recalada.id}`)}
                />
              ))}
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 glass-subtle rounded-xl animate-fade-in-up">
                <p className="text-sm text-[rgb(var(--color-muted))]">
                  Pagina {meta.page} de {meta.totalPages} ({meta.total} recaladas)
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

      {/* Create Dialog */}
      <RecaladaFormDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={() => {
          setIsCreateDialogOpen(false)
          showToast("success", "Recalada creada exitosamente")
        }}
      />
    </AppShell>
  )
}
