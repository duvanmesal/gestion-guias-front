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
import { User, Lock, Monitor, Save } from "lucide-react"
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
        <div className="glass-strong p-8 rounded-2xl border border-white/10 hover-lift animate-fade-in-up relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[rgb(var(--color-primary)/0.1)] to-transparent rounded-full blur-3xl" />
          <div className="relative z-10">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-[rgb(var(--color-primary))] via-[rgb(var(--color-accent))] to-[rgb(var(--color-primary))] bg-clip-text text-transparent mb-2">
              Mi Perfil
            </h2>
            <p className="text-[rgb(var(--color-fg)/0.6)] text-base">
              Gestiona tu información personal y configuración
            </p>
          </div>
        </div>

        <div
          className="glass-strong p-1.5 inline-flex rounded-xl border border-white/10 animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-5 py-2.5 rounded-lg transition-all focus-ring flex items-center gap-2 ${
              activeTab === "profile"
                ? "glass-strong border border-white/10 bg-gradient-to-r from-[rgb(var(--color-primary)/0.2)] to-[rgb(var(--color-accent)/0.15)] text-[rgb(var(--color-primary))] shadow-lg"
                : "text-[rgb(var(--color-fg)/0.7)] hover:bg-white/5 hover:text-[rgb(var(--color-fg))]"
            }`}
          >
            <User className="w-4 h-4" />
            <span className="font-medium">Perfil</span>
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`px-5 py-2.5 rounded-lg transition-all focus-ring flex items-center gap-2 ${
              activeTab === "password"
                ? "glass-strong border border-white/10 bg-gradient-to-r from-[rgb(var(--color-primary)/0.2)] to-[rgb(var(--color-accent)/0.15)] text-[rgb(var(--color-primary))] shadow-lg"
                : "text-[rgb(var(--color-fg)/0.7)] hover:bg-white/5 hover:text-[rgb(var(--color-fg))]"
            }`}
          >
            <Lock className="w-4 h-4" />
            <span className="font-medium">Contraseña</span>
          </button>
          <button
            onClick={() => setActiveTab("sessions")}
            className={`px-5 py-2.5 rounded-lg transition-all focus-ring flex items-center gap-2 ${
              activeTab === "sessions"
                ? "glass-strong border border-white/10 bg-gradient-to-r from-[rgb(var(--color-primary)/0.2)] to-[rgb(var(--color-accent)/0.15)] text-[rgb(var(--color-primary))] shadow-lg"
                : "text-[rgb(var(--color-fg)/0.7)] hover:bg-white/5 hover:text-[rgb(var(--color-fg))]"
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span className="font-medium">Sesiones</span>
          </button>
        </div>

        {activeTab === "profile" && (
          <GlassCard className="border border-white/5 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
            <GlassCardHeader>
              <GlassCardTitle>Información Personal</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-5">
                <div className="glass-strong p-5 rounded-xl border border-white/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[rgb(var(--color-primary)/0.1)] to-transparent rounded-full blur-2xl" />
                  <div className="relative z-10">
                    <p className="text-xs text-[rgb(var(--color-fg)/0.5)] uppercase tracking-wider mb-1.5">Email</p>
                    <p className="font-semibold text-[rgb(var(--color-fg))] text-lg">{user?.email}</p>
                    <p className="text-xs text-[rgb(var(--color-fg)/0.5)] mt-2">El email no se puede modificar</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <GlassInput label="Nombres" error={profileErrors.nombres?.message} {...registerProfile("nombres")} />
                  <GlassInput
                    label="Apellidos"
                    error={profileErrors.apellidos?.message}
                    {...registerProfile("apellidos")}
                  />
                </div>

                <GlassInput label="Teléfono" error={profileErrors.telefono?.message} {...registerProfile("telefono")} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                    error={profileErrors.documentNumber?.message}
                    {...registerProfile("documentNumber")}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <GlassButton
                    type="submit"
                    variant="primary"
                    loading={updateProfileMutation.isPending}
                    className="hover-glow"
                  >
                    <Save className="w-4 h-4" />
                    Guardar Cambios
                  </GlassButton>
                </div>
              </form>
            </GlassCardContent>
          </GlassCard>
        )}

        {activeTab === "password" && (
          <GlassCard className="border border-white/5 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
            <GlassCardHeader>
              <GlassCardTitle>Cambiar Contraseña</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-5">
                <GlassInput
                  label="Contraseña Actual"
                  type="password"
                  error={passwordErrors.currentPassword?.message}
                  {...registerPassword("currentPassword")}
                />

                <GlassInput
                  label="Nueva Contraseña"
                  type="password"
                  error={passwordErrors.newPassword?.message}
                  helperText="Mínimo 8 caracteres con mayúscula, minúscula, número y símbolo"
                  {...registerPassword("newPassword")}
                />

                <div className="flex justify-end pt-2">
                  <GlassButton
                    type="submit"
                    variant="primary"
                    loading={changePasswordMutation.isPending}
                    className="hover-glow"
                  >
                    <Lock className="w-4 h-4" />
                    Cambiar Contraseña
                  </GlassButton>
                </div>
              </form>
            </GlassCardContent>
          </GlassCard>
        )}

        {activeTab === "sessions" && <SessionsCard />}
      </div>
    </AppShell>
  )
}
