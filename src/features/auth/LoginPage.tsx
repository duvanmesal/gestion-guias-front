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
      { ...data,},
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[rgb(var(--color-primary)/0.15)] via-transparent to-[rgb(var(--color-accent)/0.1)]">
      <div className="w-full max-w-md">
        <GlassCard>
          <GlassCardHeader>
            <div className="flex items-center justify-center mb-2">
              <div className="w-12 h-12 rounded-xl bg-[rgb(var(--color-primary))] flex items-center justify-center">
                <LogIn className="w-6 h-6 text-white" />
              </div>
            </div>
            <GlassCardTitle className="text-center">Gestión Guías</GlassCardTitle>
          </GlassCardHeader>

          <GlassCardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <GlassInput
                label="Email"
                type="email"
                placeholder="usuario@ejemplo.com"
                error={errors.email?.message}
                {...register("email")}
              />

              <GlassInput
                label="Contraseña"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register("password")}
              />

              {loginError && (
                <div className="glass p-3 border border-red-400/20 bg-red-400/10">
                  <p className="text-sm text-red-400">
                    {(loginError as AxiosError<ApiResponse<unknown>>).response?.data?.error?.message ||
                      "Error al iniciar sesión"}
                  </p>
                </div>
              )}

              <GlassButton type="submit" variant="primary" fullWidth loading={isLoggingIn}>
                Iniciar Sesión
              </GlassButton>
            </form>
          </GlassCardContent>
        </GlassCard>

        <p className="text-center mt-4 text-sm text-[rgb(var(--color-fg)/0.6)]">
          Sistema de gestión de guías turísticos
        </p>
      </div>
    </div>
  )
}
