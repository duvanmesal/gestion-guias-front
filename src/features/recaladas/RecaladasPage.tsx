"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Anchor, Plus, Search, Filter, Calendar } from "lucide-react"
import { AppShell } from "@/shared/components/layout/AppShell"
import { GlassCard, GlassCardContent } from "@/shared/components/glass/GlassCard"
import { GlassInput } from "@/shared/components/glass/GlassInput"
import { GlassSelect } from "@/shared/components/glass/GlassSelect"
import { GlassButton } from "@/shared/components/glass/GlassButton"
import { Skeleton } from "@/shared/components/feedback/Skeleton"
import { useToast } from "@/shared/components/feedback/Toast"
import { useRecaladas } from "@/hooks/use-recaladas"
import { useBuquesLookup } from "@/hooks/use-buques"
import { usePaisesLookup } from "@/hooks/use-paises"
import { useAuthStore } from "@/app/stores/auth-store"
import { Rol } from "@/core/models/auth"
import type { RecaladaOperativeStatus } from "@/core/models/recaladas"
import { RecaladaCard } from "./components/RecaladaCard"
import { RecaladaFormDialog } from "./components/RecaladaFormDialog"

export function RecaladasPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { showToast } = useToast()

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [buqueFilter, setBuqueFilter] = useState<string>("")
  const [page, setPage] = useState(1)
  const pageSize = 12

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const { buques: buquesLookup, isLoading: loadingBuques } = useBuquesLookup()
  const { paises: paisesLookup } = usePaisesLookup()

  const { recaladas, meta, isLoading, isCreating } = useRecaladas({
    q: search || undefined,
    operationalStatus: statusFilter ? (statusFilter as RecaladaOperativeStatus) : undefined,
    buqueId: buqueFilter ? Number(buqueFilter) : undefined,
    page,
    pageSize,
  })

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

  const buqueOptions = [
    { value: "", label: "Todos los buques" },
    ...buquesLookup.map((b) => ({
      value: String(b.id),
      label: b.nombre,
    })),
  ]

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

        {/* Filters */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
          <GlassCard variant="subtle">
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
              <GlassSelect
                options={statusOptions}
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
              />
              <GlassSelect
                options={buqueOptions}
                value={buqueFilter}
                onChange={(e) => handleBuqueFilter(e.target.value)}
                disabled={loadingBuques}
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
                <div className="w-16 h-16 rounded-2xl bg-[rgb(var(--color-primary)/0.1)] flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-[rgb(var(--color-primary))]" />
                </div>
                <p className="text-[rgb(var(--color-fg))] font-medium mb-1">
                  No hay recaladas registradas
                </p>
                <p className="text-sm text-[rgb(var(--color-muted))] mb-4">
                  Comienza programando la primera recalada
                </p>
                {canCreate && (
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
