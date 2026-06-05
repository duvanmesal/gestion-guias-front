"use client"

import { useEffect, useState, type FormEvent } from "react"
import { useSearchParams } from "react-router-dom"
import { Anchor } from "lucide-react"
import { AppShell } from "@/shared/components/layout/AppShell"
import { GlassCard, GlassCardContent } from "@/shared/components/glass/GlassCard"
import { GlassButton } from "@/shared/components/glass/GlassButton"
import { GlassInput } from "@/shared/components/glass/GlassInput"
import { GlassModal, GlassModalFooter } from "@/shared/components/glass/GlassModal"
import { SearchableCombobox } from "@/shared/components/glass/SearchableCombobox"
import { useToast } from "@/shared/components/feedback/Toast"
import { useAuthStore } from "@/app/stores/auth-store"
import { Rol } from "@/core/models/auth"
import type { Puerto, StatusType } from "@/core/models/catalog"
import { usePaisesLookup } from "@/hooks/use-paises"
import { usePuertos } from "@/hooks/use-puertos"
import { CatalogToolbar } from "../components/CatalogToolbar"
import { StatusBadge } from "../components/StatusBadge"

type FormState = {
  codigo: string
  nombre: string
  ciudad: string
  paisId: string
  status: StatusType
}

const EMPTY_FORM: FormState = {
  codigo: "",
  nombre: "",
  ciudad: "",
  paisId: "",
  status: "ACTIVO",
}

export function PuertosPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuthStore()
  const { showToast } = useToast()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [paisFilter, setPaisFilter] = useState(searchParams.get("paisId") ?? "")
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Puerto | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<FormState>(EMPTY_FORM)
  const pageSize = 12

  const canCreate = user?.rol === Rol.SUPER_ADMIN
  const canDelete = user?.rol === Rol.SUPER_ADMIN
  const { paises, isLoading: loadingPaises } = usePaisesLookup()
  const {
    puertos,
    meta,
    isLoading,
    createPuertoAsync,
    updatePuertoAsync,
    deletePuertoAsync,
    isCreating,
    isUpdating,
    isDeleting,
  } = usePuertos({
    q: search || undefined,
    status: statusFilter ? (statusFilter as StatusType) : undefined,
    paisId: paisFilter || undefined,
    page,
    pageSize,
  })

  useEffect(() => {
    setPaisFilter(searchParams.get("paisId") ?? "")
  }, [searchParams])

  const paisOptions = paises.map((pais) => ({
    value: String(pais.id),
    label: `${pais.nombre} (${pais.codigo})`,
  }))

  const openCreate = () => {
    setEditing(null)
    setFormData({ ...EMPTY_FORM, paisId: paisFilter })
    setIsOpen(true)
  }

  const openEdit = (puerto: Puerto) => {
    setEditing(puerto)
    setFormData({
      codigo: puerto.codigo,
      nombre: puerto.nombre,
      ciudad: puerto.ciudad,
      paisId: String(puerto.pais?.id ?? puerto.paisId ?? ""),
      status: puerto.status,
    })
    setIsOpen(true)
  }

  const handlePaisFilter = (value: string) => {
    setPage(1)
    setPaisFilter(value)
    setSearchParams(value ? { paisId: value } : {})
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!formData.codigo.trim() || !formData.nombre.trim() || !formData.ciudad.trim() || !formData.paisId) {
      showToast("error", "Completa código, nombre, ciudad y país")
      return
    }

    const payload = {
      codigo: formData.codigo.trim(),
      nombre: formData.nombre.trim(),
      ciudad: formData.ciudad.trim(),
      paisId: formData.paisId,
      status: formData.status,
    }

    try {
      if (editing) {
        await updatePuertoAsync({ id: editing.id, data: payload })
        showToast("success", "Puerto actualizado")
      } else {
        await createPuertoAsync(payload)
        showToast("success", "Puerto creado")
      }
      setIsOpen(false)
    } catch {
      showToast("error", "No se pudo guardar el puerto")
    }
  }

  const handleDelete = async (puerto: Puerto) => {
    try {
      await deletePuertoAsync(puerto.id)
      showToast("success", "Puerto eliminado")
    } catch {
      showToast("error", "No se puede eliminar un puerto con dependencias")
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center gap-4 animate-fade-in-up">
          <div className="w-12 h-12 rounded-xl bg-[rgb(var(--color-primary)/0.15)] flex items-center justify-center">
            <Anchor className="w-6 h-6 text-[rgb(var(--color-primary))]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[rgb(var(--color-fg))]">Puertos</h1>
            <p className="text-[rgb(var(--color-muted))]">Gestiona puntos portuarios usados en recaladas</p>
          </div>
        </div>

        <CatalogToolbar
          search={search}
          onSearchChange={(value) => { setSearch(value); setPage(1) }}
          statusFilter={statusFilter}
          onStatusFilterChange={(value) => { setStatusFilter(value); setPage(1) }}
          onCreateClick={openCreate}
          createLabel="Nuevo Puerto"
          canCreate={canCreate}
          extraFilters={
            <SearchableCombobox
              options={paisOptions}
              value={paisFilter}
              onChange={handlePaisFilter}
              placeholder="Todos los países"
              disabled={loadingPaises}
            />
          }
        />

        {isLoading ? (
          <GlassCard><GlassCardContent>Cargando puertos...</GlassCardContent></GlassCard>
        ) : puertos.length === 0 ? (
          <GlassCard><GlassCardContent>No hay puertos registrados.</GlassCardContent></GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {puertos.map((puerto) => (
              <GlassCard key={puerto.id}>
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-[rgb(var(--color-fg))]">{puerto.nombre}</p>
                      <p className="text-sm text-[rgb(var(--color-muted))]">{puerto.codigo} · {puerto.ciudad}</p>
                      <p className="text-sm text-[rgb(var(--color-muted))]">{puerto.pais?.nombre ?? "Sin país"}</p>
                    </div>
                    <StatusBadge status={puerto.status} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <GlassButton variant="ghost" size="sm" onClick={() => openEdit(puerto)}>Editar</GlassButton>
                    {canDelete && (
                      <GlassButton variant="danger" size="sm" onClick={() => handleDelete(puerto)} loading={isDeleting}>
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

      <GlassModal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editing ? "Editar Puerto" : "Nuevo Puerto"} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <GlassInput label="Código" value={formData.codigo} onChange={(e) => setFormData({ ...formData, codigo: e.target.value })} />
          <GlassInput label="Nombre" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} />
          <GlassInput label="Ciudad" value={formData.ciudad} onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })} />
          <SearchableCombobox label="País" options={paisOptions} value={formData.paisId} onChange={(paisId) => setFormData({ ...formData, paisId })} disabled={loadingPaises} />
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
