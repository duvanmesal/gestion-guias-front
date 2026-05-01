"use client"

import { useState } from "react"
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from "@/shared/components/glass/GlassCard"
import { GlassButton } from "@/shared/components/glass/GlassButton"
import { GlassInput } from "@/shared/components/glass/GlassInput"
import { GlassModal, GlassModalFooter } from "@/shared/components/glass/GlassModal"
import { Skeleton } from "@/shared/components/feedback/Skeleton"
import { useToast } from "@/shared/components/feedback/Toast"
import { useSessions } from "@/hooks/use-sessions"
import { useAuth } from "@/hooks/use-auth"
import { authApi } from "@/core/api"
import { Monitor, Smartphone, Trash2, LogOut, ShieldCheck } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export function SessionsCard() {
  const { sessions, isLoading, deleteSession, isDeletingSession } = useSessions()
  const { logoutAll, isLoggingOutAll } = useAuth()
  const { showToast } = useToast()
  const [isLogoutAllOpen, setIsLogoutAllOpen] = useState(false)
  const [logoutAllCode, setLogoutAllCode] = useState("")
  const [isRequestingCode, setIsRequestingCode] = useState(false)

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

  const handleOpenLogoutAll = async () => {
    setIsRequestingCode(true)
    try {
      await authApi.requestLogoutAllCode()
      setLogoutAllCode("")
      setIsLogoutAllOpen(true)
      showToast("success", "Te enviamos un código de confirmación al correo.")
    } catch {
      showToast("error", "No pudimos enviar el código. Intenta de nuevo.")
    } finally {
      setIsRequestingCode(false)
    }
  }

  const handleConfirmLogoutAll = () => {
    const code = logoutAllCode.trim()
    if (!/^\d{6}$/.test(code)) {
      showToast("error", "Ingresa el código de 6 dígitos.")
      return
    }

    logoutAll(
      { verification: { method: "code", code } },
      {
        onError: () => {
          showToast("error", "Código inválido o expirado.")
        },
      },
    )
  }

  return (
    <>
      <GlassCard>
        <GlassCardHeader>
          <div className="flex items-center justify-between gap-3">
            <GlassCardTitle>Sesiones Activas</GlassCardTitle>
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={handleOpenLogoutAll}
              disabled={isLoading || isRequestingCode || isLoggingOutAll}
            >
              {isRequestingCode ? (
                "Enviando..."
              ) : (
                <>
                  <LogOut className="w-4 h-4 mr-2 text-red-400" />
                  Cerrar todas
                </>
              )}
            </GlassButton>
          </div>
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

      <GlassModal
        isOpen={isLogoutAllOpen}
        onClose={() => setIsLogoutAllOpen(false)}
        title="Cerrar todas las sesiones"
        description="Ingresa el código de 6 dígitos que enviamos a tu correo."
        size="sm"
      >
        <div className="space-y-4">
          <div className="glass-subtle p-4 rounded-xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[rgb(var(--color-primary))] mt-0.5" />
            <p className="text-sm text-[rgb(var(--color-fg)/0.75)]">
              Esta acción cerrará tu sesión actual y todas las sesiones abiertas en web y móvil.
            </p>
          </div>

          <GlassInput
            label="Código"
            inputMode="numeric"
            maxLength={6}
            value={logoutAllCode}
            onChange={(event) => {
              setLogoutAllCode(event.target.value.replace(/\D/g, "").slice(0, 6))
            }}
            placeholder="123456"
          />

          <GlassModalFooter>
            <GlassButton variant="ghost" onClick={() => setIsLogoutAllOpen(false)}>
              Cancelar
            </GlassButton>
            <GlassButton
              variant="primary"
              onClick={handleConfirmLogoutAll}
              disabled={isLoggingOutAll}
            >
              {isLoggingOutAll ? "Cerrando..." : "Confirmar"}
            </GlassButton>
          </GlassModalFooter>
        </div>
      </GlassModal>
    </>
  )
}
