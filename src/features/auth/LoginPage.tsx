"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuth } from "@/hooks/use-auth"
import { loginSchema, type LoginFormData } from "@/core/utils/validation"
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from "@/shared/components/glass/GlassCard"
import { GlassInput } from "@/shared/components/glass/GlassInput"
import { GlassButton } from "@/shared/components/glass/GlassButton"
import { useToast } from "@/shared/components/feedback/Toast"
import { LogIn } from "lucide-react"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import type { AxiosError } from "axios"
import type { ApiResponse } from "@/core/models/api"

export function LoginPage() {
  const { login, isLoggingIn, loginError, isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard")
    }
  }, [isAuthenticated, navigate])

  const onSubmit = (data: LoginFormData) => {
    login(
      { ...data },
      {
        onError: (error) => {
          const axiosError = error as AxiosError<ApiResponse<unknown>>
          const errorMessage = axiosError.response?.data?.error?.message || "Error al iniciar sesión"
          showToast("error", errorMessage)
        },
      },
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10 bg-gradient-to-br from-[rgb(var(--color-primary)/0.1)] via-transparent to-[rgb(var(--color-accent)/0.08)]">
      <div className="w-full max-w-md animate-scale-in">
        <GlassCard className="hover-lift">
          <GlassCardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[rgb(var(--color-primary))] to-[rgb(var(--color-accent))] flex items-center justify-center shadow-lg shadow-[rgb(var(--color-primary)/0.3)] hover-glow">
                <LogIn className="w-8 h-8 text-white" />
              </div>
            </div>
            <GlassCardTitle className="text-center text-3xl font-bold bg-gradient-to-r from-[rgb(var(--color-primary))] to-[rgb(var(--color-accent))] bg-clip-text text-transparent">
              Gestión Guías
            </GlassCardTitle>
            <p className="text-center text-sm text-[rgb(var(--color-fg)/0.6)] mt-2">Inicia sesión para continuar</p>
          </GlassCardHeader>

          <GlassCardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <GlassInput label="Email" type="email" error={errors.email?.message} {...register("email")} />

              <GlassInput
                label="Contraseña"
                type="password"
                error={errors.password?.message}
                {...register("password")}
              />

              {loginError && (
                <div className="glass p-4 border-2 border-red-400/30 bg-red-400/10 rounded-xl animate-fade-in-up">
                  <p className="text-sm text-red-400 font-medium">
                    {(loginError as AxiosError<ApiResponse<unknown>>).response?.data?.error?.message ||
                      "Error al iniciar sesión"}
                  </p>
                </div>
              )}

              <GlassButton type="submit" variant="primary" fullWidth loading={isLoggingIn} className="hover-glow">
                Iniciar Sesión
              </GlassButton>
            </form>
          </GlassCardContent>
        </GlassCard>

        <p className="text-center mt-6 text-sm text-[rgb(var(--color-fg)/0.5)] animate-fade-in-up">
          Sistema de gestión de guías turísticos
        </p>
      </div>
    </div>
  )
}
