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
import { RECALADA_STATUS_COPY } from "./recalada-status-copy"
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
    { value: "SCHEDULED", label: RECALADA_STATUS_COPY.SCHEDULED.singular },
    { value: "ARRIVED", label: RECALADA_STATUS_COPY.ARRIVED.singular },
    { value: "DEPARTED", label: RECALADA_STATUS_COPY.DEPARTED.singular },
    { value: "CANCELED", label: RECALADA_STATUS_COPY.CANCELED.singular },
  ]

  const buqueOptions = buquesLookup.map((b) => ({
    value: String(b.id),
    label: b.nombre,
  }))

  const statusLabel: Record<string, string> = {
    SCHEDULED: RECALADA_STATUS_COPY.SCHEDULED.singular,
    ARRIVED: RECALADA_STATUS_COPY.ARRIVED.singular,
    DEPARTED: RECALADA_STATUS_COPY.DEPARTED.singular,
    CANCELED: RECALADA_STATUS_COPY.CANCELED.singular,
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
            className="relative flex items-start gap-3.5 rounded-xl px-4 py-3.5 animate-fade-in-up sm:items-center"
            style={{
              backgroundColor: "rgba(var(--color-danger), 0.07)",
              border: "1px solid rgba(var(--color-danger), 0.20)",
            }}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--color-danger)/0.12)]">
              <AlertTriangle className="h-4 w-4 text-[rgb(var(--color-danger))]" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p className="text-[13.5px] font-semibold leading-none text-[rgb(var(--color-fg))]">
                  Recaladas vencidas pendientes de zarpe
                </p>
                <span className="inline-flex items-center rounded-md bg-[rgb(var(--color-danger)/0.14)] px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-[rgb(var(--color-danger))]">
                  {isLoading ? "…" : meta?.total ?? recaladas.length}
                </span>
              </div>
              <p className="mt-1 text-[12.5px] leading-snug text-[rgb(var(--color-muted))]">
                Buques con llegada registrada y zarpe programado vencido.
              </p>
            </div>
            <button
              type="button"
              onClick={clearOverdueFilter}
              className="shrink-0 self-center rounded-md px-2.5 py-1.5 text-[12px] font-medium text-[rgb(var(--color-muted))] transition hover:bg-[rgb(var(--color-border)/0.08)] hover:text-[rgb(var(--color-fg))]"
            >
              Quitar
            </button>
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
                    ? "No existen recaladas con llegada registrada y zarpe programado vencido para los filtros actuales."
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
