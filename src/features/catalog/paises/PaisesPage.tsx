"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { MapPin } from "lucide-react"
import { AppShell } from "@/shared/components/layout/AppShell"
import { GlassCard, GlassCardContent } from "@/shared/components/glass/GlassCard"
import { GlassButton } from "@/shared/components/glass/GlassButton"
import { Skeleton } from "@/shared/components/feedback/Skeleton"
import { useToast } from "@/shared/components/feedback/Toast"
import { usePaises } from "@/hooks/use-paises"
import { useAuthStore } from "@/app/stores/auth-store"
import { Rol } from "@/core/models/auth"
import type { Pais, StatusType } from "@/core/models/catalog"
import { CatalogToolbar } from "../components/CatalogToolbar"
import { CountryCard } from "./components/CountryCard"
import { PaisFormDialog } from "./components/PaisFormDialog"
import { DeletePaisDialog } from "./components/DeletePaisDialog"

export function PaisesPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { showToast } = useToast()

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [page, setPage] = useState(1)
  const pageSize = 12

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingPais, setEditingPais] = useState<Pais | null>(null)
  const [deletingPais, setDeletingPais] = useState<Pais | null>(null)

  const { paises, meta, isLoading } = usePaises({
    q: search || undefined,
    status: statusFilter ? (statusFilter as StatusType) : undefined,
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

  const handleViewBuques = (pais: Pais) => {
    navigate(`/catalog/buques?paisId=${pais.id}`)
  }

  const canCreate = user?.rol === Rol.SUPER_ADMIN
  const canDelete = user?.rol === Rol.SUPER_ADMIN

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-in-up">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[rgb(var(--color-primary)/0.15)] flex items-center justify-center">
              <MapPin className="w-6 h-6 text-[rgb(var(--color-primary))]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[rgb(var(--color-fg))]">
                Paises
              </h1>
              <p className="text-[rgb(var(--color-muted))]">
                Gestiona el catalogo de paises del sistema
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
          createLabel="Nuevo Pais"
          canCreate={canCreate}
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
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : paises.length === 0 ? (
          <GlassCard className="animate-fade-in-up">
            <GlassCardContent>
              <div className="py-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[rgb(var(--color-primary)/0.1)] flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-[rgb(var(--color-primary))]" />
                </div>
                <p className="text-[rgb(var(--color-fg))] font-medium mb-1">
                  Aun no hay paises
                </p>
                <p className="text-sm text-[rgb(var(--color-muted))] mb-4">
                  Comienza agregando el primer pais al catalogo
                </p>
                {canCreate && (
                  <GlassButton
                    variant="primary"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    Crear primer pais
                  </GlassButton>
                )}
              </div>
            </GlassCardContent>
          </GlassCard>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paises.map((pais, index) => (
                <CountryCard
                  key={pais.id}
                  pais={pais}
                  index={index}
                  onEdit={() => setEditingPais(pais)}
                  onDelete={() => setDeletingPais(pais)}
                  onViewBuques={() => handleViewBuques(pais)}
                  canDelete={canDelete}
                />
              ))}
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 glass-subtle rounded-xl animate-fade-in-up">
                <p className="text-sm text-[rgb(var(--color-muted))]">
                  Pagina {meta.page} de {meta.totalPages} ({meta.total} paises)
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
      <PaisFormDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={() => {
          setIsCreateDialogOpen(false)
          showToast("success", "Pais creado exitosamente")
        }}
      />

      <PaisFormDialog
        isOpen={!!editingPais}
        onClose={() => setEditingPais(null)}
        pais={editingPais}
        onSuccess={() => {
          setEditingPais(null)
          showToast("success", "Pais actualizado exitosamente")
        }}
      />

      <DeletePaisDialog
        isOpen={!!deletingPais}
        onClose={() => setDeletingPais(null)}
        pais={deletingPais}
        onSuccess={() => {
          setDeletingPais(null)
          showToast("success", "Pais eliminado exitosamente")
        }}
        onError={(message) => {
          showToast("error", message)
        }}
      />
    </AppShell>
  )
}
