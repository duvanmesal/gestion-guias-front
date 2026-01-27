'use client';

import React from "react"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Ship } from "lucide-react"
import { GlassCard, GlassInput, GlassButton } from "@/shared/components/glass"
import { Spinner } from "@/shared/components/feedback"
import { authApi } from "@/core/api"

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await authApi.forgotPassword({ email })
      setIsSubmitted(true)
    } catch {
      setError("No pudimos enviar la solicitud. Intenta de nuevo más tarde.")
    } finally {
      setIsLoading(false)
    }
  }

  const isValidEmail = email.includes("@") && email.includes(".")

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
            Recuperar Contraseña
          </h1>
          <p className="text-[rgb(var(--color-fg)/0.7)] mt-2">
            CORPOTURISMO - Sistema de Gestión de Guías
          </p>
        </div>

        {isSubmitted ? (
          /* Success State */
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-[rgb(var(--color-fg))] mb-2">
              Solicitud Enviada
            </h2>
            <p className="text-[rgb(var(--color-fg)/0.7)] mb-6">
              Si el correo existe, recibirás instrucciones para restablecer tu contraseña.
            </p>
            <Link to="/login">
              <GlassButton variant="primary" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a Iniciar Sesión
              </GlassButton>
            </Link>
          </div>
        ) : (
          /* Form State */
          <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-[rgb(var(--color-fg)/0.7)] text-sm">
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
            </p>

            {error && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-danger/10 border border-danger/20">
                <AlertCircle className="w-5 h-5 text-danger flex-shrink-0" />
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}

            <GlassInput
              label="Correo Electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              icon={<Mail className="w-5 h-5" />}
              required
              autoFocus
            />

            <GlassButton
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading || !isValidEmail}
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Enviando...
                </>
              ) : (
                "Enviar Enlace de Recuperación"
              )}
            </GlassButton>

            <div className="text-center">
              <Link
                to="/login"
                className="text-sm text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver a Iniciar Sesión
              </Link>
            </div>
          </form>
        )}
      </GlassCard>
    </div>
  )
}
