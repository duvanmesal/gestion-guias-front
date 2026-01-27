'use client';

import React from "react"

import { useState, useEffect } from "react"
import { Link, useSearchParams, useNavigate } from "react-router-dom"
import { Lock, ArrowLeft, CheckCircle, AlertCircle, Eye, EyeOff, Ship, XCircle } from "lucide-react"
import { GlassCard, GlassInput, GlassButton } from "@/shared/components/glass"
import { Spinner } from "@/shared/components/feedback"
import { authApi } from "@/core/api"

// Password validation rules
const passwordRules = {
  minLength: 8,
  hasUpperCase: /[A-Z]/,
  hasLowerCase: /[a-z]/,
  hasNumber: /[0-9]/,
  hasSpecial: /[!@#$%^&*(),.?":{}|<>]/,
}

function validatePassword(password: string) {
  return {
    minLength: password.length >= passwordRules.minLength,
    hasUpperCase: passwordRules.hasUpperCase.test(password),
    hasLowerCase: passwordRules.hasLowerCase.test(password),
    hasNumber: passwordRules.hasNumber.test(password),
    hasSpecial: passwordRules.hasSpecial.test(password),
  }
}

function PasswordRequirement({ met, label }: { met: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-2 text-sm ${met ? "text-primary" : "text-[rgb(var(--color-fg)/0.5)]"}`}>
      {met ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
      {label}
    </div>
  )
}

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get("token")

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validation = validatePassword(newPassword)
  const isPasswordValid = Object.values(validation).every(Boolean)
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0

  useEffect(() => {
    if (!token) {
      setError("Enlace inválido. No se encontró el token de recuperación.")
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !isPasswordValid || !passwordsMatch) return

    setError(null)
    setIsLoading(true)

    try {
      await authApi.resetPassword({ token, newPassword })
      setIsSuccess(true)
    } catch {
      setError("Token inválido o expirado. Por favor, solicita un nuevo enlace de recuperación.")
    } finally {
      setIsLoading(false)
    }
  }

  // No token state
  if (!token && !isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[rgb(var(--color-bg))]">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-danger/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <GlassCard className="w-full max-w-md relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-danger/10 mb-4">
            <AlertCircle className="w-8 h-8 text-danger" />
          </div>
          <h2 className="text-xl font-semibold text-[rgb(var(--color-fg))] mb-2">
            Enlace Inválido
          </h2>
          <p className="text-[rgb(var(--color-fg)/0.7)] mb-6">
            El enlace de recuperación no es válido o ha expirado.
          </p>
          <Link to="/forgot-password">
            <GlassButton variant="primary" className="w-full">
              Solicitar Nuevo Enlace
            </GlassButton>
          </Link>
        </GlassCard>
      </div>
    )
  }

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
            Nueva Contraseña
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
              Contraseña Actualizada
            </h2>
            <p className="text-[rgb(var(--color-fg)/0.7)] mb-6">
              Tu contraseña ha sido restablecida correctamente. Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
            <GlassButton
              variant="primary"
              className="w-full"
              onClick={() => navigate("/login")}
            >
              Iniciar Sesión
            </GlassButton>
          </div>
        ) : (
          /* Form State */
          <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-[rgb(var(--color-fg)/0.7)] text-sm">
              Ingresa tu nueva contraseña. Asegúrate de que sea segura y que puedas recordarla.
            </p>

            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-danger/10 border border-danger/20">
                <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-danger">{error}</p>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-danger underline hover:no-underline mt-1 inline-block"
                  >
                    Solicitar nuevo enlace
                  </Link>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <GlassInput
                label="Nueva Contraseña"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Ingresa tu nueva contraseña"
                icon={<Lock className="w-5 h-5" />}
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[rgb(var(--color-fg)/0.5)] hover:text-[rgb(var(--color-fg))] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                }
                required
              />

              {/* Password requirements */}
              {newPassword.length > 0 && (
                <div className="glass-subtle p-4 rounded-xl space-y-2">
                  <p className="text-xs font-medium text-[rgb(var(--color-fg)/0.7)] mb-2">
                    Requisitos de contraseña:
                  </p>
                  <PasswordRequirement met={validation.minLength} label="Mínimo 8 caracteres" />
                  <PasswordRequirement met={validation.hasUpperCase} label="Una letra mayúscula" />
                  <PasswordRequirement met={validation.hasLowerCase} label="Una letra minúscula" />
                  <PasswordRequirement met={validation.hasNumber} label="Un número" />
                  <PasswordRequirement met={validation.hasSpecial} label="Un carácter especial" />
                </div>
              )}

              <GlassInput
                label="Confirmar Contraseña"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirma tu nueva contraseña"
                icon={<Lock className="w-5 h-5" />}
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-[rgb(var(--color-fg)/0.5)] hover:text-[rgb(var(--color-fg))] transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                }
                error={confirmPassword.length > 0 && !passwordsMatch ? "Las contraseñas no coinciden" : undefined}
                required
              />
            </div>

            <GlassButton
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading || !isPasswordValid || !passwordsMatch}
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Actualizando...
                </>
              ) : (
                "Restablecer Contraseña"
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
