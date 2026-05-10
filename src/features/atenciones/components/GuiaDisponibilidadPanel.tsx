import { AlertTriangle, CheckCircle2, Hash, Loader2, ListOrdered } from "lucide-react"
import { GlassCard } from "@/shared/components/glass/GlassCard"
import { GlassButton } from "@/shared/components/glass/GlassButton"
import { useToast } from "@/shared/components/feedback/Toast"
import { useMiDisponibilidad } from "@/hooks/use-disponibilidad"

interface Props {
  atencionId: number
  atencionAbierta: boolean
  recaladaArrived: boolean
}

export function GuiaDisponibilidadPanel({ atencionId, atencionAbierta, recaladaArrived }: Props) {
  const { showToast } = useToast()
  const { miDisponibilidad, isLoading, marcarAsync, isMarking, desmarcarAsync, isDesmarking } =
    useMiDisponibilidad(atencionId)

  if (isLoading) {
    return (
      <GlassCard className="animate-fade-in-up">
        <div className="flex items-center gap-2 py-2">
          <Loader2 className="w-4 h-4 animate-spin text-[rgb(var(--color-muted))]" />
          <span className="text-sm text-[rgb(var(--color-muted))]">Cargando disponibilidad…</span>
        </div>
      </GlassCard>
    )
  }

  const marcado = miDisponibilidad?.marcado ?? false
  const posicion = miDisponibilidad?.posicion ?? null
  const penalizado = miDisponibilidad?.penalizado ?? false
  const pendingPenalty = miDisponibilidad?.pendingPenalty ?? false

  const handleMarcar = async () => {
    try {
      await marcarAsync()
      showToast("success", "Disponibilidad marcada correctamente")
    } catch {
      // global error handler
    }
  }

  const handleDesmarcar = async () => {
    try {
      await desmarcarAsync()
      showToast("info", "Disponibilidad desmarcada")
    } catch {
      // global error handler
    }
  }

  return (
    <GlassCard className="animate-fade-in-up space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-[rgb(var(--color-accent)/0.15)] flex items-center justify-center">
          <ListOrdered className="w-4 h-4 text-[rgb(var(--color-accent))]" />
        </div>
        <h3 className="text-sm font-semibold text-[rgb(var(--color-fg))]">Mi disponibilidad</h3>
      </div>

      {/* Penalty warning */}
      {pendingPenalty && !marcado && (
        <div className="flex items-start gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-600 dark:text-amber-400 leading-snug">
            Tienes una penalización — irás al final de la cola al marcar disponibilidad.
          </p>
        </div>
      )}

      {/* Already arrived — window closed */}
      {recaladaArrived ? (
        <div className="glass-subtle rounded-xl px-3 py-2.5">
          <p className="text-xs text-[rgb(var(--color-muted))]">
            El buque ya llegó. La ventana de disponibilidad está cerrada.
          </p>
        </div>
      ) : !atencionAbierta ? (
        <div className="glass-subtle rounded-xl px-3 py-2.5">
          <p className="text-xs text-[rgb(var(--color-muted))]">
            Esta atención ya no está abierta.
          </p>
        </div>
      ) : marcado ? (
        <>
          {/* Position badge */}
          <div className="flex items-center gap-3 glass-subtle rounded-xl px-3 py-3">
            <div className="w-9 h-9 rounded-lg bg-[rgb(var(--color-success)/0.15)] flex items-center justify-center shrink-0">
              {penalizado ? (
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-[rgb(var(--color-success))]" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-[rgb(var(--color-muted))]">
                {penalizado ? "Marcado (penalizado)" : "Marcado como disponible"}
              </p>
              {posicion !== null && (
                <p className="text-sm font-semibold text-[rgb(var(--color-fg))] flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5" />
                  Posición {posicion} en la cola
                </p>
              )}
            </div>
          </div>

          <GlassButton
            variant="secondary"
            fullWidth
            onClick={handleDesmarcar}
            loading={isDesmarking}
          >
            Desmarcar disponibilidad
          </GlassButton>
        </>
      ) : (
        <GlassButton
          variant="primary"
          fullWidth
          onClick={handleMarcar}
          loading={isMarking}
        >
          <CheckCircle2 className="w-4 h-4" />
          Marcar disponibilidad
        </GlassButton>
      )}
    </GlassCard>
  )
}
