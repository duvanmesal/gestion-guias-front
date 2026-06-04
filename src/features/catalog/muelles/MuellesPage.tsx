"use client"

import { useEffect, useState, type FormEvent } from "react"
import { useSearchParams } from "react-router-dom"
import { ShipWheel } from "lucide-react"
import { AppShell } from "@/shared/components/layout/AppShell"
import { GlassCard, GlassCardContent } from "@/shared/components/glass/GlassCard"
import { GlassButton } from "@/shared/components/glass/GlassButton"
import { GlassInput } from "@/shared/components/glass/GlassInput"
import { GlassModal, GlassModalFooter } from "@/shared/components/glass/GlassModal"
import { SearchableCombobox } from "@/shared/components/glass/SearchableCombobox"
import { useToast } from "@/shared/components/feedback/Toast"
import { useAuthStore } from "@/app/stores/auth-store"
import { Rol } from "@/core/models/auth"
import type { Muelle, StatusType } from "@/core/models/catalog"
import { useMuelles } from "@/hooks/use-muelles"
import { usePuertosLookup } from "@/hooks/use-puertos"
import { CatalogToolbar } from "../components/CatalogToolbar"
import { StatusBadge } from "../components/StatusBadge"

type FormState = {
  codigo: string
  nombre: string
  puertoId: string
  capacidadCruceros: string
  status: StatusType
}

const EMPTY_FORM: FormState = {
  codigo: "",
  nombre: "",
  puertoId: "",
  capacidadCruceros: "",
  status: "ACTIVO",
}

export function MuellesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuthStore()
  const { showToast } = useToast()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [puertoFilter, setPuertoFilter] = useState(searchParams.get("puertoId") ?? "")
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Muelle | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<FormState>(EMPTY_FORM)
  const pageSize = 12

  const canCreate = user?.rol === Rol.SUPER_ADMIN
  const canDelete = user?.rol === Rol.SUPER_ADMIN
  const { puertos, isLoading: loadingPuertos } = usePuertosLookup()
  const {
    muelles,
    meta,
    isLoading,
    createMuelleAsync,
    updateMuelleAsync,
    deleteMuelleAsync,
    isCreating,
    isUpdating,
    isDeleting,
  } = useMuelles({
    q: search || undefined,
    status: statusFilter ? (statusFilter as StatusType) : undefined,
    puertoId: puertoFilter || undefined,
    page,
    pageSize,
  })

  useEffect(() => {
    setPuertoFilter(searchParams.get("puertoId") ?? "")
  }, [searchParams])

  const puertoOptions = puertos.map((puerto) => ({
    value: String(puerto.id),
    label: `${puerto.nombre} (${puerto.codigo})`,
  }))

  const openCreate = () => {
    setEditing(null)
    setFormData({ ...EMPTY_FORM, puertoId: puertoFilter })
    setIsOpen(true)
  }

  const openEdit = (muelle: Muelle) => {
    setEditing(muelle)
    setFormData({
      codigo: muelle.codigo,
      nombre: muelle.nombre,
      puertoId: String(muelle.puerto?.id ?? muelle.puertoId ?? ""),
      capacidadCruceros: muelle.capacidadCruceros != null ? String(muelle.capacidadCruceros) : "",
      status: muelle.status,
    })
    setIsOpen(true)
  }

  const handlePuertoFilter = (value: string) => {
    setPage(1)
    setPuertoFilter(value)
    setSearchParams(value ? { puertoId: value } : {})
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!formData.codigo.trim() || !formData.nombre.trim() || !formData.puertoId) {
      showToast("error", "Completa código, nombre y puerto")
      return
    }

    const payload = {
      codigo: formData.codigo.trim(),
      nombre: formData.nombre.trim(),
      puertoId: formData.puertoId,
      capacidadCruceros: formData.capacidadCruceros.trim()
        ? Number(formData.capacidadCruceros)
        : undefined,
      status: formData.status,
    }

    try {
      if (editing) {
        await updateMuelleAsync({ id: editing.id, data: payload })
        showToast("success", "Muelle actualizado")
      } else {
        await createMuelleAsync(payload)
        showToast("success", "Muelle creado")
      }
      setIsOpen(false)
    } catch {
      showToast("error", "No se pudo guardar el muelle")
    }
  }

  const handleDelete = async (muelle: Muelle) => {
    try {
      await deleteMuelleAsync(muelle.id)
      showToast("success", "Muelle eliminado")
    } catch {
      showToast("error", "No se puede eliminar un muelle con recaladas asociadas")
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center gap-4 animate-fade-in-up">
          <div className="w-12 h-12 rounded-xl bg-[rgb(var(--color-accent)/0.15)] flex items-center justify-center">
            <ShipWheel className="w-6 h-6 text-[rgb(var(--color-accent))]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[rgb(var(--color-fg))]">Muelles</h1>
            <p className="text-[rgb(var(--color-muted))]">Gestiona muelles asociados a puertos</p>
          </div>
        </div>

        <CatalogToolbar
          search={search}
          onSearchChange={(value) => { setSearch(value); setPage(1) }}
          statusFilter={statusFilter}
          onStatusFilterChange={(value) => { setStatusFilter(value); setPage(1) }}
          onCreateClick={openCreate}
          createLabel="Nuevo Muelle"
          canCreate={canCreate}
          extraFilters={
            <SearchableCombobox
              options={puertoOptions}
              value={puertoFilter}
              onChange={handlePuertoFilter}
              placeholder="Todos los puertos"
              disabled={loadingPuertos}
            />
          }
        />

        {isLoading ? (
          <GlassCard><GlassCardContent>Cargando muelles...</GlassCardContent></GlassCard>
        ) : muelles.length === 0 ? (
          <GlassCard><GlassCardContent>No hay muelles registrados.</GlassCardContent></GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {muelles.map((muelle) => (
              <GlassCard key={muelle.id}>
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-[rgb(var(--color-fg))]">{muelle.nombre}</p>
                      <p className="text-sm text-[rgb(var(--color-muted))]">{muelle.codigo} · {muelle.puerto?.nombre ?? "Sin puerto"}</p>
                      <p className="text-sm text-[rgb(var(--color-muted))]">
                        Capacidad: {muelle.capacidadCruceros ?? "No definida"}
                      </p>
                    </div>
                    <StatusBadge status={muelle.status} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <GlassButton variant="ghost" size="sm" onClick={() => openEdit(muelle)}>Editar</GlassButton>
                    {canDelete && (
                      <GlassButton variant="danger" size="sm" onClick={() => handleDelete(muelle)} loading={isDeleting}>
                        Eliminar
                      </GlassButton>
                    )}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 glass-subtle rounded-xl">
            <p className="text-sm text-[rgb(var(--color-muted))]">Página {meta.page} de {meta.totalPages}</p>
            <div className="flex gap-2">
              <GlassButton variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Anterior</GlassButton>
              <GlassButton variant="ghost" size="sm" disabled={page === meta.totalPages} onClick={() => setPage(page + 1)}>Siguiente</GlassButton>
            </div>
          </div>
        )}
      </div>

      <GlassModal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editing ? "Editar Muelle" : "Nuevo Muelle"} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <GlassInput label="Código" value={formData.codigo} onChange={(e) => setFormData({ ...formData, codigo: e.target.value })} />
          <GlassInput label="Nombre" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} />
          <SearchableCombobox label="Puerto" options={puertoOptions} value={formData.puertoId} onChange={(puertoId) => setFormData({ ...formData, puertoId })} disabled={loadingPuertos} />
          <GlassInput label="Capacidad de cruceros" type="number" min="1" value={formData.capacidadCruceros} onChange={(e) => setFormData({ ...formData, capacidadCruceros: e.target.value })} />
          <SearchableCombobox
            label="Estado"
            searchable={false}
            options={[{ value: "ACTIVO", label: "Activo" }, { value: "INACTIVO", label: "Inactivo" }]}
            value={formData.status}
            onChange={(status) => setFormData({ ...formData, status: status as StatusType })}
          />
          <GlassModalFooter>
            <GlassButton type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancelar</GlassButton>
            <GlassButton type="submit" variant="primary" loading={isCreating || isUpdating}>Guardar</GlassButton>
          </GlassModalFooter>
        </form>
      </GlassModal>
    </AppShell>
  )
}
