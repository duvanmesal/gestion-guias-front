"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuth } from "@/hooks/use-auth"
import { loginSchema, type LoginFormData } from "@/core/utils/validation"
import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardContent,
} from "@/shared/components/glass/GlassCard"
import { GlassInput } from "@/shared/components/glass/GlassInput"
import { GlassButton } from "@/shared/components/glass/GlassButton"
import { useToast } from "@/shared/components/feedback/Toast"
import { Compass, Mail, Lock } from "lucide-react"
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
          const errorMessage =
            axiosError.response?.data?.error?.message || "Error al iniciar sesion"
          showToast("error", errorMessage)
        },
      }
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      {/* Animated background */}
      <div className="animated-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <div className="w-full max-w-md animate-scale-in">
        <GlassCard variant="strong" className="hover-lift">
          <GlassCardHeader className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-[rgb(var(--color-primary))] flex items-center justify-center shadow-lg">
                <Compass className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Title */}
            <GlassCardTitle className="text-2xl text-center mb-1">
              CORPOTURISMO
            </GlassCardTitle>
            <p className="text-sm text-[rgb(var(--color-muted))]">
              Sistema de Gestion de Guias Turisticos
            </p>
          </GlassCardHeader>

          <GlassCardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <GlassInput
                label="Correo electronico"
                type="email"
                placeholder="correo@ejemplo.com"
                error={errors.email?.message}
                leftIcon={<Mail className="w-4 h-4" />}
                {...register("email")}
              />

              <GlassInput
                label="Contrasena"
                type="password"
                placeholder="********"
                error={errors.password?.message}
                leftIcon={<Lock className="w-4 h-4" />}
                {...register("password")}
              />

              {loginError && (
                <div className="glass-subtle p-4 border border-[rgb(var(--color-danger)/0.3)] bg-[rgb(var(--color-danger)/0.1)] rounded-xl animate-fade-in-up">
                  <p className="text-sm text-[rgb(var(--color-danger))] font-medium">
                    {(loginError as AxiosError<ApiResponse<unknown>>).response?.data
                      ?.error?.message || "Error al iniciar sesion"}
                  </p>
                </div>
              )}

              <GlassButton
                type="submit"
                variant="primary"
                fullWidth
                loading={isLoggingIn}
                size="lg"
              >
                Iniciar Sesion
              </GlassButton>
            </form>
          </GlassCardContent>
        </GlassCard>

        {/* Footer */}
        <p className="text-center mt-6 text-sm text-[rgb(var(--color-muted))] animate-fade-in-up">
          Corporacion de Turismo del Estado Nueva Esparta
        </p>
      </div>
    </div>
  )
}
