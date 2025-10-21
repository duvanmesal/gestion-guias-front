"use client"

import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from "@/shared/components/glass/GlassCard"
import { GlassButton } from "@/shared/components/glass/GlassButton"
import { Skeleton } from "@/shared/components/feedback/Skeleton"
import { useToast } from "@/shared/components/feedback/Toast"
import { useSessions } from "@/hooks/use-sessions"
import { Monitor, Smartphone, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export function SessionsCard() {
  const { sessions, isLoading, deleteSession, isDeletingSession } = useSessions()
  const { showToast } = useToast()

  const handleDeleteSession = (sessionId: string) => {
    deleteSession(sessionId, {
      onSuccess: () => {
        showToast("success", "Sesión cerrada exitosamente")
      },
      onError: () => {
        showToast("error", "Error al cerrar sesión")
      },
    })
  }

  return (
    <GlassCard>
      <GlassCardHeader>
        <GlassCardTitle>Sesiones Activas</GlassCardTitle>
      </GlassCardHeader>
      <GlassCardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton height="4rem" />
            <Skeleton height="4rem" />
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-center text-[rgb(var(--color-fg)/0.6)] py-8">No hay sesiones activas</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div key={session.id} className="glass p-4 rounded-xl flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-[rgb(var(--color-primary)/0.2)] flex items-center justify-center flex-shrink-0">
                    {session.platform === "WEB" ? (
                      <Monitor className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                    ) : (
                      <Smartphone className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[rgb(var(--color-fg))]">{session.platform}</p>
                    {session.userAgent && (
                      <p className="text-sm text-[rgb(var(--color-fg)/0.6)] truncate">{session.userAgent}</p>
                    )}
                    {session.ip && <p className="text-xs text-[rgb(var(--color-fg)/0.5)]">IP: {session.ip}</p>}
                    <p className="text-xs text-[rgb(var(--color-fg)/0.5)] mt-1">
                      Creada: {format(new Date(session.createdAt), "PPp", { locale: es })}
                    </p>
                    {session.lastActivityAt && (
                      <p className="text-xs text-[rgb(var(--color-fg)/0.5)]">
                        Última actividad: {format(new Date(session.lastActivityAt), "PPp", { locale: es })}
                      </p>
                    )}
                  </div>
                </div>
                <GlassButton
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteSession(session.id)}
                  disabled={isDeletingSession}
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </GlassButton>
              </div>
            ))}
          </div>
        )}
      </GlassCardContent>
    </GlassCard>
  )
}
