'use client';

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Mail, LogOut, Ship, CheckCircle, AlertCircle } from "lucide-react"
import { GlassCard, GlassButton } from "@/shared/components/glass"
import { Spinner } from "@/shared/components/feedback"
import { authApi } from "@/core/api"
import { useAuthStore } from "@/app/stores/auth-store"

export function VerifyNeededPage() {
  const navigate = useNavigate()
  const { user, clearSession } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleResendVerification = async () => {
    if (!user?.email) return

    setIsLoading(true)
    setError(null)

    try {
      await authApi.requestEmailVerification({ email: user.email })
      setIsSuccess(true)
    } catch {
      setError("No pudimos enviar la solicitud. Intenta de nuevo más tarde.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch {
      // Ignore logout errors
    } finally {
      clearSession()
      navigate("/login")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[rgb(var(--color-bg))]">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <GlassCard className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-4">
            <Ship className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-[rgb(var(--color-fg))]">
            Verificación Requerida
          </h1>
          <p className="text-[rgb(var(--color-fg)/0.7)] mt-2">
            CORPOTURISMO - Sistema de Gestión de Guías
          </p>
        </div>

        <div className="space-y-6">
          {/* Info Box */}
          <div className="glass-subtle p-4 rounded-xl">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-[rgb(var(--color-fg))] mb-1">
                  Verifica tu correo para continuar
                </h3>
                <p className="text-sm text-[rgb(var(--color-fg)/0.7)]">
                  Por seguridad, necesitas verificar tu correo electrónico antes de acceder al sistema.
                </p>
              </div>
            </div>
          </div>

          {user && (
            <div className="text-center py-2">
              <p className="text-sm text-[rgb(var(--color-fg)/0.7)]">
                Correo registrado:
              </p>
              <p className="font-medium text-[rgb(var(--color-fg))]">
                {user.email}
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-danger/10 border border-danger/20">
              <AlertCircle className="w-5 h-5 text-danger flex-shrink-0" />
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          {isSuccess ? (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20">
              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-primary font-medium">
                  Correo de verificación enviado
                </p>
                <p className="text-sm text-[rgb(var(--color-fg)/0.7)] mt-1">
                  Revisa tu bandeja de entrada y haz clic en el enlace de verificación.
                </p>
              </div>
            </div>
          ) : (
            <GlassButton
              variant="primary"
              className="w-full"
              onClick={handleResendVerification}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  {isSuccess ? "Reenviar Verificación" : "Enviar Verificación"}
                </>
              )}
            </GlassButton>
          )}

          {isSuccess && (
            <GlassButton
              variant="ghost"
              className="w-full"
              onClick={handleResendVerification}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Reenviar Verificación
                </>
              )}
            </GlassButton>
          )}

          <div className="pt-4 border-t border-[rgb(var(--color-fg)/0.1)]">
            <GlassButton
              variant="ghost"
              className="w-full text-danger hover:bg-danger/10"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </GlassButton>
          </div>

          <p className="text-xs text-center text-[rgb(var(--color-fg)/0.5)]">
            Si no recibes el correo, revisa tu carpeta de spam o solicita un nuevo enlace.
          </p>
        </div>
      </GlassCard>
    </div>
  )
}
