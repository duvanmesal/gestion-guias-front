import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Anchor, Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react"
import type { AxiosError } from "axios"

import { useAuth } from "@/hooks/use-auth"
import { loginSchema, type LoginFormData } from "@/core/utils/validation"
import { GlassInput } from "@/shared/components/glass/GlassInput"
import { useToast } from "@/shared/components/feedback/Toast"
import type { ApiResponse } from "@/core/models/api"

const MAX_ATTEMPTS = 3
const LOCKOUT_SECONDS = 30

export function LoginPage() {
  const { login, isLoggingIn, loginError, isAuthenticated, isLoading, user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const failedAttempts = useRef(0)
  const [lockedUntil, setLockedUntil] = useState<number | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(0)

  useEffect(() => {
    if (!lockedUntil) return
    const tick = setInterval(() => {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000)
      if (remaining <= 0) {
        setLockedUntil(null)
        setSecondsLeft(0)
        clearInterval(tick)
      } else {
        setSecondsLeft(remaining)
      }
    }, 1000)
    return () => clearInterval(tick)
  }, [lockedUntil])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  useEffect(() => {
    if (!isAuthenticated || isLoading) return

    navigate(user?.emailVerifiedAt ? "/dashboard" : "/verify-needed", {
      replace: true,
    })
  }, [isAuthenticated, isLoading, navigate, user?.emailVerifiedAt])

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil

  const onSubmit = (data: LoginFormData) => {
    if (isLocked) return

    login(
      { ...data },
      {
        onError: (error) => {
          const axiosError = error as AxiosError<ApiResponse<unknown>>
          const msg = axiosError.response?.data?.error?.message || "Error al iniciar sesión"
          failedAttempts.current += 1
          if (failedAttempts.current >= MAX_ATTEMPTS) {
            failedAttempts.current = 0
            const until = Date.now() + LOCKOUT_SECONDS * 1000
            setLockedUntil(until)
            setSecondsLeft(LOCKOUT_SECONDS)
            showToast("error", `Demasiados intentos. Espera ${LOCKOUT_SECONDS} segundos.`)
          } else {
            showToast("error", msg)
          }
        },
      }
    )
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[rgb(var(--color-bg))] relative overflow-hidden">
      {/* Top blue glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(var(--color-primary), 0.10) 0%, transparent 70%)" }}
      />

      {/* Content */}
      <div className="flex-1 flex flex-col w-full max-w-sm mx-auto px-6 py-12 sm:py-16 relative z-10">

        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-10">
          <div
            className="w-[72px] h-[72px] rounded-[22px] flex items-center justify-center"
            style={{
              background: "var(--gradient-primary)",
              boxShadow: "0 8px 24px rgba(var(--color-primary), 0.35)",
            }}
          >
            <Anchor className="w-8 h-8 text-white" />
          </div>
          <p className="text-[11px] font-bold tracking-[2.5px] text-[rgb(var(--color-primary))] uppercase">
            Gestión de Guías
          </p>
          <p className="text-xs text-[rgb(var(--color-muted))]">
            Sistema de Operaciones Portuarias
          </p>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-[32px] font-extrabold leading-tight text-[rgb(var(--color-fg))]">
            Bienvenido
          </h1>
          <p className="mt-2 text-sm text-[rgb(var(--color-muted))] leading-relaxed">
            Accede a tu cuenta para continuar
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <GlassInput
            label="Correo electrónico"
            type="email"
            placeholder="correo@ejemplo.com"
            error={errors.email?.message}
            leftIcon={<Mail className="w-[18px] h-[18px] text-[rgb(var(--color-primary))]" />}
            {...register("email")}
          />

          <div className="flex flex-col gap-1">
            <GlassInput
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              leftIcon={<Lock className="w-[18px] h-[18px] text-[rgb(var(--color-primary))]" />}
              {...register("password")}
            />
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-[13px] font-semibold text-[rgb(var(--color-primary))] hover:opacity-80 transition-opacity"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>

          {isLocked && (
            <div className="px-4 py-3 rounded-xl border border-[rgb(var(--color-danger)/0.3)] bg-[rgb(var(--color-danger)/0.08)] animate-fade-in-up">
              <p className="text-sm text-[rgb(var(--color-danger))] font-medium">
                Demasiados intentos fallidos. Espera {secondsLeft}s antes de intentar de nuevo.
              </p>
            </div>
          )}

          {!isLocked && loginError && (
            <div className="px-4 py-3 rounded-xl border border-[rgb(var(--color-danger)/0.3)] bg-[rgb(var(--color-danger)/0.08)] animate-fade-in-up">
              <p className="text-sm text-[rgb(var(--color-danger))] font-medium">
                {(loginError as AxiosError<ApiResponse<unknown>>).response?.data?.error
                  ?.message || "Error al iniciar sesión"}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoggingIn || isLocked}
            className="mt-2 w-full h-[56px] rounded-2xl flex items-center justify-center gap-2.5 text-white text-[16px] font-bold transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: "var(--gradient-primary)",
              boxShadow: "0 6px 20px rgba(var(--color-primary), 0.35)",
            }}
          >
            {isLoggingIn ? (
              <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Iniciar sesión
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 mt-8">
          <div className="flex-1 h-px bg-[rgb(var(--color-glass))]" />
          <span className="text-[11px] text-[rgb(var(--color-muted))]">acceso solo por invitación</span>
          <div className="flex-1 h-px bg-[rgb(var(--color-glass))]" />
        </div>

        {/* Footer badge */}
        <div className="flex items-center justify-center gap-1.5 mt-6">
          <ShieldCheck className="w-[14px] h-[14px] text-[rgb(var(--color-primary))]" />
          <span className="text-[12px] text-[rgb(var(--color-muted))]">Conexión segura y cifrada</span>
        </div>
      </div>
    </div>
  )
}
