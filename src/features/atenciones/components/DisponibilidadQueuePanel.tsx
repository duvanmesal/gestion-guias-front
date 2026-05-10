import { Users, AlertTriangle, Loader2, ListOrdered } from "lucide-react"
import { GlassCard } from "@/shared/components/glass/GlassCard"
import { useDisponibilidadQueue } from "@/hooks/use-disponibilidad"

interface Props {
  atencionId: number
  turnosTotal: number
}

export function DisponibilidadQueuePanel({ atencionId, turnosTotal }: Props) {
  const { queue, isLoading } = useDisponibilidadQueue(atencionId)

  return (
    <GlassCard className="animate-fade-in-up space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[rgb(var(--color-accent)/0.15)] flex items-center justify-center">
            <ListOrdered className="w-4 h-4 text-[rgb(var(--color-accent))]" />
          </div>
          <h3 className="text-sm font-semibold text-[rgb(var(--color-fg))]">Cola de disponibilidad</h3>
        </div>
        <span className="text-xs text-[rgb(var(--color-muted))]">
          {queue.length} / {turnosTotal}
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 py-2">
          <Loader2 className="w-4 h-4 animate-spin text-[rgb(var(--color-muted))]" />
          <span className="text-xs text-[rgb(var(--color-muted))]">Cargando cola…</span>
        </div>
      ) : queue.length === 0 ? (
        <div className="glass-subtle rounded-xl px-3 py-3">
          <p className="text-xs text-[rgb(var(--color-muted))]">
            Ningún guía ha marcado disponibilidad aún.
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {queue.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 glass-subtle rounded-xl px-3 py-2"
            >
              <span className="w-5 h-5 rounded-full bg-[rgb(var(--color-accent)/0.15)] flex items-center justify-center text-[10px] font-bold text-[rgb(var(--color-accent))] shrink-0">
                {item.posicion}
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-[rgb(var(--color-fg))] truncate">
                  {item.nombres} {item.apellidos}
                </p>
                <p className="text-[10px] text-[rgb(var(--color-muted))] truncate">
                  {new Date(item.marcadoAt).toLocaleTimeString("es-CO", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              {item.penalizado && (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" aria-label="Penalizado" />
              )}

              {item.posicion <= turnosTotal ? (
                <Users className="w-3.5 h-3.5 text-[rgb(var(--color-success))] shrink-0" aria-label="Recibirá turno" />
              ) : null}
            </div>
          ))}
        </div>
      )}

      {queue.length > 0 && (
        <p className="text-[10px] text-[rgb(var(--color-muted))]">
          Los primeros {turnosTotal} recibirán turno al marcar el arribo.
        </p>
      )}
    </GlassCard>
  )
}
