"use client"

import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Ship,
  MapPin,
  Calendar,
  Clock,
  Users,
  Edit,
  PlayCircle,
  StopCircle,
  XCircle,
  Anchor,
  ListChecks,
} from "lucide-react"
import { AppShell } from "@/shared/components/layout/AppShell"
import { GlassCard, GlassCardContent } from "@/shared/components/glass/GlassCard"
import { GlassButton } from "@/shared/components/glass/GlassButton"
import { Skeleton } from "@/shared/components/feedback/Skeleton"
import { useToast } from "@/shared/components/feedback/Toast"
import { useRecalada } from "@/hooks/use-recaladas"
import { useAtenciones } from "@/hooks/use-atenciones"
import { useAuthStore } from "@/app/stores/auth-store"
import { Rol } from "@/core/models/auth"
import { RecaladaStatusBadge } from "./components/RecaladaStatusBadge"
import { RecaladaFormDialog } from "./components/RecaladaFormDialog"
import { CancelRecaladaDialog } from "./components/CancelRecaladaDialog"
import { AtencionCard } from "../atenciones/components/AtencionCard"
import { AtencionFormDialog } from "../atenciones/components/AtencionFormDialog"

export function RecaladaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { showToast } = useToast()

  const recaladaId = id ? Number(id) : null
  const { recalada, isLoading, arriveRecaladaAsync, departRecaladaAsync, isArriving, isDeparting } =
    useRecalada(recaladaId)

  const { atenciones, isLoading: loadingAtenciones } = useAtenciones({
    recaladaId: recaladaId ?? undefined,
  })

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [isAtencionDialogOpen, setIsAtencionDialogOpen] = useState(false)

  const canEdit = user?.rol === Rol.SUPER_ADMIN || user?.rol === Rol.SUPERVISOR
  const canOperate = user?.rol === Rol.SUPER_ADMIN || user?.rol === Rol.SUPERVISOR

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-CO", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleArrive = async () => {
    try {
      await arriveRecaladaAsync()
      showToast("success", "Recalada marcada como arribada")
    } catch (error) {
      showToast("error", "Error al marcar arribo")
    }
  }

  const handleDepart = async () => {
    try {
      await departRecaladaAsync()
      showToast("success", "Recalada marcada como zarpada")
    } catch (error) {
      showToast("error", "Error al marcar zarpe")
    }
  }

  if (isLoading) {
    return (
      <AppShell>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </AppShell>
    )
  }

  if (!recalada) {
    return (
      <AppShell>
        <div className="text-center py-12">
          <p className="text-[rgb(var(--color-muted))]">Recalada no encontrada</p>
          <GlassButton variant="ghost" onClick={() => navigate("/recaladas")} className="mt-4">
            <ArrowLeft className="w-4 h-4" />
            Volver a recaladas
          </GlassButton>
        </div>
      </AppShell>
    )
  }

  const canArrive = recalada.operationalStatus === "SCHEDULED"
  const canDepart = recalada.operationalStatus === "ARRIVED"
  const canCancel = recalada.operationalStatus === "SCHEDULED" || recalada.operationalStatus === "ARRIVED"
  const canCreateAtencion = recalada.operationalStatus !== "CANCELED" && recalada.operationalStatus !== "DEPARTED"

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-in-up">
          <button
            onClick={() => navigate("/recaladas")}
            className="flex items-center gap-2 text-sm text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-primary))] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a recaladas
          </button>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-[rgb(var(--color-primary)/0.15)] flex items-center justify-center">
                <Anchor className="w-7 h-7 text-[rgb(var(--color-primary))]" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-[rgb(var(--color-fg))]">
                    {recalada.codigoRecalada}
                  </h1>
                  <RecaladaStatusBadge status={recalada.operationalStatus} size="md" />
                </div>
                <p className="text-[rgb(var(--color-muted))]">{recalada.buque?.nombre}</p>
              </div>
            </div>

            {canEdit && (
              <div className="flex gap-2">
                <GlassButton variant="ghost" onClick={() => setIsEditDialogOpen(true)}>
                  <Edit className="w-4 h-4" />
                  Editar
                </GlassButton>
              </div>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Buque Info */}
          <GlassCard className="animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[rgb(var(--color-accent)/0.1)] flex items-center justify-center">
                <Ship className="w-5 h-5 text-[rgb(var(--color-accent))]" />
              </div>
              <div>
                <p className="text-sm text-[rgb(var(--color-muted))]">Buque</p>
                <p className="font-semibold text-[rgb(var(--color-fg))]">{recalada.buque?.nombre}</p>
              </div>
            </div>
          </GlassCard>

          {/* Origin */}
          <GlassCard className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[rgb(var(--color-primary)/0.1)] flex items-center justify-center">
                <MapPin className="w-5 h-5 text-[rgb(var(--color-primary))]" />
              </div>
              <div>
                <p className="text-sm text-[rgb(var(--color-muted))]">Origen</p>
                <p className="font-semibold text-[rgb(var(--color-fg))]">
                  {recalada.paisOrigen?.nombre}
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Passengers */}
          {recalada.pasajerosEstimados && (
            <GlassCard className="animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-[rgb(var(--color-muted))]">Pasajeros Estimados</p>
                  <p className="font-semibold text-[rgb(var(--color-fg))]">
                    {recalada.pasajerosEstimados.toLocaleString()}
                  </p>
                </div>
              </div>
            </GlassCard>
          )}
        </div>

        {/* Schedule */}
        <GlassCard className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-lg font-semibold text-[rgb(var(--color-fg))] mb-4">Programacion</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-[rgb(var(--color-muted))]">Llegada Programada</p>
                <p className="font-semibold text-[rgb(var(--color-fg))]">
                  {formatDate(recalada.fechaLlegada)}
                </p>
                <p className="text-sm text-[rgb(var(--color-muted))]">
                  {formatTime(recalada.fechaLlegada)}
                </p>
                {recalada.arrivedAt && (
                  <p className="text-xs text-green-500 mt-1">
                    Arribo real: {formatTime(recalada.arrivedAt)}
                  </p>
                )}
              </div>
            </div>

            {recalada.fechaSalida && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-[rgb(var(--color-muted))]">Salida Programada</p>
                  <p className="font-semibold text-[rgb(var(--color-fg))]">
                    {formatDate(recalada.fechaSalida)}
                  </p>
                  <p className="text-sm text-[rgb(var(--color-muted))]">
                    {formatTime(recalada.fechaSalida)}
                  </p>
                  {recalada.departedAt && (
                    <p className="text-xs text-purple-500 mt-1">
                      Zarpe real: {formatTime(recalada.departedAt)}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {(recalada.terminal || recalada.muelle) && (
            <div className="mt-4 pt-4 border-t border-[rgb(var(--color-border)/0.06)]">
              <div className="flex gap-4">
                {recalada.terminal && (
                  <span className="text-sm bg-[rgb(var(--color-glass)/0.5)] px-3 py-1 rounded-lg">
                    Terminal: {recalada.terminal}
                  </span>
                )}
                {recalada.muelle && (
                  <span className="text-sm bg-[rgb(var(--color-glass)/0.5)] px-3 py-1 rounded-lg">
                    Muelle: {recalada.muelle}
                  </span>
                )}
              </div>
            </div>
          )}
        </GlassCard>

        {/* Operations */}
        {canOperate && (canArrive || canDepart || canCancel) && (
          <GlassCard className="animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
            <h2 className="text-lg font-semibold text-[rgb(var(--color-fg))] mb-4">Operaciones</h2>
            <div className="flex flex-wrap gap-3">
              {canArrive && (
                <GlassButton
                  variant="primary"
                  onClick={handleArrive}
                  loading={isArriving}
                >
                  <PlayCircle className="w-4 h-4" />
                  Marcar Arribo
                </GlassButton>
              )}
              {canDepart && (
                <GlassButton
                  variant="secondary"
                  onClick={handleDepart}
                  loading={isDeparting}
                >
                  <StopCircle className="w-4 h-4" />
                  Marcar Zarpe
                </GlassButton>
              )}
              {canCancel && (
                <GlassButton variant="danger" onClick={() => setIsCancelDialogOpen(true)}>
                  <XCircle className="w-4 h-4" />
                  Cancelar Recalada
                </GlassButton>
              )}
            </div>
          </GlassCard>
        )}

        {/* Observations */}
        {recalada.observaciones && (
          <GlassCard className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <h2 className="text-lg font-semibold text-[rgb(var(--color-fg))] mb-2">Observaciones</h2>
            <p className="text-[rgb(var(--color-muted))]">{recalada.observaciones}</p>
          </GlassCard>
        )}

        {/* Atenciones Section */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.35s" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <ListChecks className="w-5 h-5 text-[rgb(var(--color-primary))]" />
              <h2 className="text-lg font-semibold text-[rgb(var(--color-fg))]">
                Atenciones ({atenciones.length})
              </h2>
            </div>
            {canOperate && canCreateAtencion && (
              <GlassButton variant="primary" size="sm" onClick={() => setIsAtencionDialogOpen(true)}>
                Crear Atencion
              </GlassButton>
            )}
          </div>

          {loadingAtenciones ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <GlassCard key={i}>
                  <Skeleton className="h-32 w-full" />
                </GlassCard>
              ))}
            </div>
          ) : atenciones.length === 0 ? (
            <GlassCard>
              <GlassCardContent>
                <div className="py-8 text-center">
                  <p className="text-[rgb(var(--color-muted))]">
                    No hay atenciones programadas para esta recalada
                  </p>
                  {canOperate && canCreateAtencion && (
                    <GlassButton
                      variant="primary"
                      size="sm"
                      onClick={() => setIsAtencionDialogOpen(true)}
                      className="mt-4"
                    >
                      Crear primera atencion
                    </GlassButton>
                  )}
                </div>
              </GlassCardContent>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
      </div>

      {/* Dialogs */}
      <RecaladaFormDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        recalada={recalada}
        onSuccess={() => {
          setIsEditDialogOpen(false)
          showToast("success", "Recalada actualizada exitosamente")
        }}
      />

      <CancelRecaladaDialog
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        recaladaId={recalada.id}
        onSuccess={() => {
          setIsCancelDialogOpen(false)
          showToast("success", "Recalada cancelada")
        }}
      />

      <AtencionFormDialog
        isOpen={isAtencionDialogOpen}
        onClose={() => setIsAtencionDialogOpen(false)}
        recaladaId={recalada.id}
        onSuccess={() => {
          setIsAtencionDialogOpen(false)
          showToast("success", "Atencion creada exitosamente")
        }}
      />
    </AppShell>
  )
}
