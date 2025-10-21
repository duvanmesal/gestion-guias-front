"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AppShell } from "@/shared/components/layout/AppShell"
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from "@/shared/components/glass/GlassCard"
import { GlassInput } from "@/shared/components/glass/GlassInput"
import { GlassSelect } from "@/shared/components/glass/GlassSelect"
import { GlassButton } from "@/shared/components/glass/GlassButton"
import { useToast } from "@/shared/components/feedback/Toast"
import { useAuthStore } from "@/app/stores/auth-store"
import { usersApi } from "@/core/api"
import { updateProfileSchema, changePasswordSchema } from "@/core/utils/validation"
import type { UpdateProfileFormData, ChangePasswordFormData } from "@/core/utils/validation"
import { DocumentType } from "@/core/models/auth"
import { User, Lock, Monitor } from "lucide-react"
import type { AxiosError } from "axios"
import type { ApiResponse } from "@/core/models/api"
import { SessionsCard } from "./SessionsCard"

export function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "sessions">("profile")

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileFormData) => usersApi.updateProfile(data),
    onSuccess: (response) => {
      if (response.data) {
        updateUser(response.data)
        queryClient.invalidateQueries({ queryKey: ["me"] })
        showToast("success", "Perfil actualizado exitosamente")
      }
    },
    onError: (error: AxiosError<ApiResponse<unknown>>) => {
      const errorMessage = error.response?.data?.error?.message || "Error al actualizar perfil"
      showToast("error", errorMessage)
    },
  })

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordFormData) => {
      if (!user?.id) throw new Error("User ID not found")
      return usersApi.changePassword(user.id, data)
    },
    onSuccess: () => {
      showToast("success", "Contraseña actualizada exitosamente")
      resetPasswordForm()
    },
    onError: (error: AxiosError<ApiResponse<unknown>>) => {
      const errorMessage = error.response?.data?.error?.message || "Error al cambiar contraseña"
      showToast("error", errorMessage)
    },
  })

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      nombres: user?.nombres || "",
      apellidos: user?.apellidos || "",
      telefono: user?.telefono || "",
      documentType: user?.documentType || undefined,
      documentNumber: user?.documentNumber || "",
    },
  })

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  })

  const onSubmitProfile = (data: UpdateProfileFormData) => {
    updateProfileMutation.mutate(data)
  }

  const onSubmitPassword = (data: ChangePasswordFormData) => {
    changePasswordMutation.mutate(data)
  }

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h2 className="text-3xl font-bold text-[rgb(var(--color-fg))]">Mi Perfil</h2>
          <p className="text-[rgb(var(--color-fg)/0.6)]">Gestiona tu información personal y configuración</p>
        </div>

        {/* Tabs */}
        <div className="glass p-1 inline-flex rounded-xl">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 rounded-lg transition-colors focus-ring ${
              activeTab === "profile"
                ? "bg-[rgb(var(--color-primary)/0.2)] text-[rgb(var(--color-primary))]"
                : "text-[rgb(var(--color-fg)/0.8)] hover:bg-white/10"
            }`}
          >
            <User className="w-4 h-4 inline mr-2" />
            Perfil
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`px-4 py-2 rounded-lg transition-colors focus-ring ${
              activeTab === "password"
                ? "bg-[rgb(var(--color-primary)/0.2)] text-[rgb(var(--color-primary))]"
                : "text-[rgb(var(--color-fg)/0.8)] hover:bg-white/10"
            }`}
          >
            <Lock className="w-4 h-4 inline mr-2" />
            Contraseña
          </button>
          <button
            onClick={() => setActiveTab("sessions")}
            className={`px-4 py-2 rounded-lg transition-colors focus-ring ${
              activeTab === "sessions"
                ? "bg-[rgb(var(--color-primary)/0.2)] text-[rgb(var(--color-primary))]"
                : "text-[rgb(var(--color-fg)/0.8)] hover:bg-white/10"
            }`}
          >
            <Monitor className="w-4 h-4 inline mr-2" />
            Sesiones
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Información Personal</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">
                <div className="glass p-4 rounded-xl">
                  <p className="text-sm text-[rgb(var(--color-fg)/0.6)] mb-1">Email</p>
                  <p className="font-medium text-[rgb(var(--color-fg))]">{user?.email}</p>
                  <p className="text-xs text-[rgb(var(--color-fg)/0.5)] mt-1">El email no se puede modificar</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <GlassInput
                    label="Nombres"
                    placeholder="Juan"
                    error={profileErrors.nombres?.message}
                    {...registerProfile("nombres")}
                  />

                  <GlassInput
                    label="Apellidos"
                    placeholder="Pérez"
                    error={profileErrors.apellidos?.message}
                    {...registerProfile("apellidos")}
                  />
                </div>

                <GlassInput
                  label="Teléfono"
                  placeholder="+57 300 123 4567"
                  error={profileErrors.telefono?.message}
                  {...registerProfile("telefono")}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <GlassSelect
                    label="Tipo de Documento"
                    options={[
                      { value: "", label: "Seleccionar..." },
                      { value: DocumentType.CC, label: "Cédula de Ciudadanía" },
                      { value: DocumentType.CE, label: "Cédula de Extranjería" },
                      { value: DocumentType.PASAPORTE, label: "Pasaporte" },
                    ]}
                    error={profileErrors.documentType?.message}
                    {...registerProfile("documentType")}
                  />

                  <GlassInput
                    label="Número de Documento"
                    placeholder="1020304050"
                    error={profileErrors.documentNumber?.message}
                    {...registerProfile("documentNumber")}
                  />
                </div>

                <div className="flex justify-end">
                  <GlassButton type="submit" variant="primary" loading={updateProfileMutation.isPending}>
                    Guardar Cambios
                  </GlassButton>
                </div>
              </form>
            </GlassCardContent>
          </GlassCard>
        )}

        {/* Password Tab */}
        {activeTab === "password" && (
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Cambiar Contraseña</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
                <GlassInput
                  label="Contraseña Actual"
                  type="password"
                  placeholder="••••••••"
                  error={passwordErrors.currentPassword?.message}
                  {...registerPassword("currentPassword")}
                />

                <GlassInput
                  label="Nueva Contraseña"
                  type="password"
                  placeholder="••••••••"
                  error={passwordErrors.newPassword?.message}
                  helperText="Mínimo 8 caracteres con mayúscula, minúscula, número y símbolo"
                  {...registerPassword("newPassword")}
                />

                <div className="flex justify-end">
                  <GlassButton type="submit" variant="primary" loading={changePasswordMutation.isPending}>
                    Cambiar Contraseña
                  </GlassButton>
                </div>
              </form>
            </GlassCardContent>
          </GlassCard>
        )}

        {/* Sessions Tab */}
        {activeTab === "sessions" && <SessionsCard />}
      </div>
    </AppShell>
  )
}
