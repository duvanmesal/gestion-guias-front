"use client"

import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { CalendarClock, RefreshCw, Search } from "lucide-react"

import { AppShell } from "@/shared/components/layout/AppShell"
import {
  GlassCard,
  GlassCardContent,
  GlassCardHeader,
  GlassCardTitle,
} from "@/shared/components/glass/GlassCard"
import { GlassButton } from "@/shared/components/glass/GlassButton"
import { GlassInput } from "@/shared/components/glass/GlassInput"
import { GlassSelect } from "@/shared/components/glass/GlassSelect"
import { Skeleton } from "@/shared/components/feedback/Skeleton"
import { useAtenciones } from "@/hooks/use-atenciones"
import type { AtencionOperativeStatus } from "@/core/models/atenciones"
import { AtencionCard } from "./components/AtencionCard"

const STATUS_OPTIONS = [
  { value: "", label: "Todos los estados" },
  { value: "OPEN", label: "Abiertas" },
  { value: "CLOSED", label: "Cerradas" },
  { value: "CANCELED", label: "Canceladas" },
]

function toStartOfDay(value: string) {
  return value ? `${value}T00:00:00.000Z` : undefined
}

function toEndOfDay(value: string) {
  return value ? `${value}T23:59:59.999Z` : undefined
}

export function AtencionesPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState("")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [page, setPage] = useState(1)

  const queryParams = useMemo(
    () => ({
      page,
      pageSize: 12,
      operationalStatus: status ? (status as AtencionOperativeStatus) : undefined,
      from: toStartOfDay(from),
      to: toEndOfDay(to),
    }),
    [from, page, status, to],
  )

  const { atenciones, meta, isLoading, error, refetch } = useAtenciones(queryParams)

  const totalPages = meta?.totalPages ?? 1

  const resetFilters = () => {
    setStatus("")
    setFrom("")
    setTo("")
    setPage(1)
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[rgb(var(--color-fg))]">
              Atenciones
            </h1>
            <p className="text-[rgb(var(--color-muted))] mt-1">
              Ventanas operativas disponibles, abiertas, cerradas o canceladas.
            </p>
          </div>
          <GlassButton variant="secondary" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" />
            Refrescar
          </GlassButton>
        </div>

        <GlassCard>
          <GlassCardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[rgb(var(--color-accent)/0.14)] flex items-center justify-center">
                <Search className="w-5 h-5 text-[rgb(var(--color-accent))]" />
              </div>
              <GlassCardTitle>Filtros</GlassCardTitle>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <GlassSelect
                label="Estado operativo"
                options={STATUS_OPTIONS}
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value)
                  setPage(1)
                }}
              />
              <GlassInput
                label="Desde"
                type="date"
                value={from}
                onChange={(event) => {
                  setFrom(event.target.value)
                  setPage(1)
                }}
              />
              <GlassInput
                label="Hasta"
                type="date"
                value={to}
                onChange={(event) => {
                  setTo(event.target.value)
                  setPage(1)
                }}
              />
              <div className="flex items-end">
                <GlassButton variant="ghost" fullWidth onClick={resetFilters}>
                  Limpiar
                </GlassButton>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        {error && (
          <div className="rounded-xl border border-[rgb(var(--color-danger)/0.2)] bg-[rgb(var(--color-danger)/0.06)] px-4 py-3 text-sm text-[rgb(var(--color-danger))]">
            No se pudieron cargar las atenciones.
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} height="11rem" />
            ))}
          </div>
        ) : atenciones.length === 0 ? (
          <GlassCard>
            <GlassCardContent>
              <div className="py-10 text-center">
                <CalendarClock className="w-10 h-10 mx-auto text-[rgb(var(--color-muted))]" />
                <p className="mt-3 text-sm text-[rgb(var(--color-muted))]">
                  No hay atenciones para los filtros seleccionados.
                </p>
              </div>
            </GlassCardContent>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {atenciones.map((atencion, index) => (
              <AtencionCard
                key={atencion.id}
                atencion={atencion}
                index={index}
                onClick={() => navigate(`/atenciones/${atencion.id}`)}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-[rgb(var(--color-muted))]">
              Pagina {page} de {totalPages}
            </p>
            <div className="flex gap-2">
              <GlassButton
                variant="secondary"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Anterior
              </GlassButton>
              <GlassButton
                variant="secondary"
                disabled={page >= totalPages}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              >
                Siguiente
              </GlassButton>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}

