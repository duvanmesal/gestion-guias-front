'use client';

import React from "react"

import { useState, useEffect } from "react"
import { Link, useSearchParams, useNavigate } from "react-router-dom"
import { CheckCircle, AlertCircle, Ship, Mail, ArrowRight } from "lucide-react"
import { GlassCard, GlassInput, GlassButton } from "@/shared/components/glass"
import { Spinner } from "@/shared/components/feedback"
import { authApi } from "@/core/api"
import { useAuthStore } from "@/app/stores/auth-store"

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get("token")
  const { isAuthenticated, user, updateUser } = useAuthStore()

  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(!!token)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendEmail, setResendEmail] = useState("")
  const [resendSuccess, setResendSuccess] = useState(false)

  // Auto-verify if token is present
  useEffect(() => {
    if (token) {
      verifyEmail(token)
    }
  }, [token])

  const verifyEmail = async (verificationToken: string) => {
    setIsVerifying(true)
    setError(null)

    try {
      await authApi.confirmEmailVerification({ token: verificationToken })
      setIsSuccess(true)

      // If user is logged in, update their profile
      if (isAuthenticated && user) {
        const response = await authApi.me()
        if (response.data) {
          updateUser(response.data)
        }
      }
    } catch {
      setError("Token inválido o expirado.")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    const emailToUse = isAuthenticated && user ? user.email : resendEmail
    if (!emailToUse) return

    setIsLoading(true)
    setError(null)

    try {
      await authApi.requestEmailVerification({ email: emailToUse })
      setResendSuccess(true)
    } catch {
      setError("No pudimos enviar la solicitud. Intenta de nuevo más tarde.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleContinue = () => {
    if (isAuthenticated) {
      navigate("/dashboard")
    } else {
      navigate("/login")
    }
  }

  // Verifying state
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[rgb(var(--color-bg))]">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <GlassCard className="w-full max-w-md relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Spinner size="lg" />
          </div>
          <h2 className="text-xl font-semibold text-[rgb(var(--color-fg))] mb-2">
            Verificando Correo
          </h2>
          <p className="text-[rgb(var(--color-fg)/0.7)]">
            Por favor espera mientras verificamos tu correo electrónico...
          </p>
        </GlassCard>
      </div>
    )
  }

  // No token and not verifying - show resend form or success
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[rgb(var(--color-bg))]">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <GlassCard className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Ship className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-[rgb(var(--color-fg))]">
            Verificar Correo
          </h1>
          <p className="text-[rgb(var(--color-fg)/0.7)] mt-2">
            CORPOTURISMO - Sistema de Gestión de Guías
          </p>
        </div>

        {isSuccess ? (
          /* Success State */
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-[rgb(var(--color-fg))] mb-2">
              Correo Verificado
            </h2>
            <p className="text-[rgb(var(--color-fg)/0.7)] mb-6">
              Tu correo electrónico ha sido verificado exitosamente.
            </p>
            <GlassButton
              variant="primary"
              className="w-full"
              onClick={handleContinue}
            >
              {isAuthenticated ? "Continuar al Dashboard" : "Iniciar Sesión"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </GlassButton>
          </div>
        ) : resendSuccess ? (
          /* Resend Success State */
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-[rgb(var(--color-fg))] mb-2">
              Correo Enviado
            </h2>
            <p className="text-[rgb(var(--color-fg)/0.7)] mb-6">
              Si el correo existe, se ha enviado un mensaje de verificación.
            </p>
            <Link to="/login">
              <GlassButton variant="ghost" className="w-full">
                Volver a Iniciar Sesión
              </GlassButton>
            </Link>
          </div>
        ) : (
          /* Error or Resend Form State */
          <div className="space-y-6">
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-danger/10 border border-danger/20">
                <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}

            {!token && (
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-danger/10 mb-4">
                  <AlertCircle className="w-8 h-8 text-danger" />
                </div>
                <h2 className="text-xl font-semibold text-[rgb(var(--color-fg))] mb-2">
                  Enlace Inválido
                </h2>
                <p className="text-[rgb(var(--color-fg)/0.7)] mb-4">
                  El enlace de verificación no es válido o no se proporcionó un token.
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-[rgb(var(--color-fg)/0.1)]">
              <p className="text-sm text-[rgb(var(--color-fg)/0.7)] mb-4 text-center">
                {token ? "¿Necesitas un nuevo enlace de verificación?" : "Solicita un nuevo enlace de verificación:"}
              </p>

              <form onSubmit={handleResendVerification} className="space-y-4">
                {isAuthenticated && user ? (
                  <div className="glass-subtle p-4 rounded-xl">
                    <p className="text-sm text-[rgb(var(--color-fg)/0.7)]">
                      Se enviará a:
                    </p>
                    <p className="font-medium text-[rgb(var(--color-fg))]">
                      {user.email}
                    </p>
                  </div>
                ) : (
                  <GlassInput
                    label="Correo Electrónico"
                    type="email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    icon={<Mail className="w-5 h-5" />}
                    required
                  />
                )}

                <GlassButton
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={isLoading || (!isAuthenticated && !resendEmail.includes("@"))}
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
              </form>
            </div>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Volver a Iniciar Sesión
              </Link>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  )
}
