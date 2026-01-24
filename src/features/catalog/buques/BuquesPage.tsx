"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { Ship, ArrowLeft } from "lucide-react"
import { AppShell } from "@/shared/components/layout/AppShell"
import { GlassCard, GlassCardContent } from "@/shared/components/glass/GlassCard"
import { GlassSelect } from "@/shared/components/glass/GlassSelect"
import { GlassButton } from "@/shared/components/glass/GlassButton"
import { Skeleton } from "@/shared/components/feedback/Skeleton"
import { useToast } from "@/shared/components/feedback/Toast"
import { useBuques } from "@/hooks/use-buques"
import { usePaisesLookup } from "@/hooks/use-paises"
import { useAuthStore } from "@/app/stores/auth-store"
import { Rol } from "@/core/models/auth"
import type { Buque, StatusType } from "@/core/models/catalog"
import { CatalogToolbar } from "../components/CatalogToolbar"
import { ShipCard } from "./components/ShipCard"
import { BuqueFormDialog } from "./components/BuqueFormDialog"
import { ToggleBuqueStatusDialog } from "./components/ToggleBuqueStatusDialog"

export function BuquesPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuthStore()
  const { showToast } = useToast()

  const paisIdFromUrl = searchParams.get("paisId") || ""

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [paisFilter, setPaisFilter] = useState<string>(paisIdFromUrl)
  const [page, setPage] = useState(1)
  const pageSize = 12

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingBuque, setEditingBuque] = useState<Buque | null>(null)
  const [togglingBuque, setTogglingBuque] = useState<Buque | null>(null)

  const { paises: paisesLookup, isLoading: loadingPaises } = usePaisesLookup()
  const { buques, meta, isLoading } = useBuques({
    q: search || undefined,
    status: statusFilter ? (statusFilter as StatusType) : undefined,
    paisId: paisFilter || undefined,
    page,
    pageSize,
  })

  // Sync paisFilter with URL
  useEffect(() => {
    if (paisIdFromUrl !== paisFilter) {
      setPaisFilter(paisIdFromUrl)
    }
  }, [paisIdFromUrl])

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value)
    setPage(1)
  }

  const handlePaisFilter = (value: string) => {
    setPaisFilter(value)
    setPage(1)
    if (value) {
      setSearchParams({ paisId: value })
    } else {
      setSearchParams({})
    }
  }

  const clearPaisFilter = () => {
    setPaisFilter("")
    setSearchParams({})
    setPage(1)
  }

  const canCreate = user?.rol === Rol.SUPER_ADMIN
  const canToggleStatus = user?.rol === Rol.SUPER_ADMIN

  const selectedPais = paisFilter
    ? paisesLookup.find((p) => p.id === paisFilter)
    : null

  const paisOptions = [
    { value: "", label: "Todos los paises" },
    ...paisesLookup.map((p) => ({
      value: p.id,
      label: `${p.nombre} (${p.codigo})`,
    })),
  ]

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-in-up">
          {selectedPais && (
            <button
              onClick={clearPaisFilter}
              className="flex items-center gap-2 text-sm text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-primary))] transition-colors mb-3"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a todos los buques
            </button>
          )}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[rgb(var(--color-accent)/0.15)] flex items-center justify-center">
              <Ship className="w-6 h-6 text-[rgb(var(--color-accent))]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[rgb(var(--color-fg))]">
                {selectedPais ? `Buques de ${selectedPais.nombre}` : "Buques"}
              </h1>
              <p className="text-[rgb(var(--color-muted))]">
                {selectedPais
                  ? `Flota registrada para ${selectedPais.nombre}`
                  : "Gestiona el catalogo de buques del sistema"}
              </p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <CatalogToolbar
          search={search}
          onSearchChange={handleSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilter}
          onCreateClick={() => setIsCreateDialogOpen(true)}
          createLabel="Nuevo Buque"
          canCreate={canCreate}
          extraFilters={
            !selectedPais && (
              <GlassSelect
                options={paisOptions}
                value={paisFilter}
                onChange={(e) => handlePaisFilter(e.target.value)}
                disabled={loadingPaises}
              />
            )
          }
        />

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <GlassCard key={i}>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : buques.length === 0 ? (
          <GlassCard className="animate-fade-in-up">
            <GlassCardContent>
              <div className="py-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[rgb(var(--color-accent)/0.1)] flex items-center justify-center mx-auto mb-4">
                  <Ship className="w-8 h-8 text-[rgb(var(--color-accent))]" />
                </div>
                <p className="text-[rgb(var(--color-fg))] font-medium mb-1">
                  {selectedPais
                    ? `No hay buques para ${selectedPais.nombre}`
                    : "Aun no hay buques"}
                </p>
                <p className="text-sm text-[rgb(var(--color-muted))] mb-4">
                  {selectedPais
                    ? "Agrega el primer buque a este pais"
                    : "Comienza agregando el primer buque al catalogo"}
                </p>
                {canCreate && (
                  <GlassButton
                    variant="primary"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    Crear primer buque
                  </GlassButton>
                )}
              </div>
            </GlassCardContent>
          </GlassCard>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {buques.map((buque, index) => (
                <ShipCard
                  key={buque.id}
                  buque={buque}
                  index={index}
                  onEdit={() => setEditingBuque(buque)}
                  onToggleStatus={() => setTogglingBuque(buque)}
                  canToggleStatus={canToggleStatus}
                />
              ))}
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 glass-subtle rounded-xl animate-fade-in-up">
                <p className="text-sm text-[rgb(var(--color-muted))]">
                  Pagina {meta.page} de {meta.totalPages} ({meta.total} buques)
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

      {/* Dialogs */}
      <BuqueFormDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        defaultPaisId={paisFilter}
        onSuccess={() => {
          setIsCreateDialogOpen(false)
          showToast("success", "Buque creado exitosamente")
        }}
      />

      <BuqueFormDialog
        isOpen={!!editingBuque}
        onClose={() => setEditingBuque(null)}
        buque={editingBuque}
        onSuccess={() => {
          setEditingBuque(null)
          showToast("success", "Buque actualizado exitosamente")
        }}
      />

      <ToggleBuqueStatusDialog
        isOpen={!!togglingBuque}
        onClose={() => setTogglingBuque(null)}
        buque={togglingBuque}
        onSuccess={() => {
          setTogglingBuque(null)
          showToast(
            "success",
            `Buque ${togglingBuque?.status === "ACTIVO" ? "desactivado" : "activado"} exitosamente`
          )
        }}
      />
    </AppShell>
  )
}
