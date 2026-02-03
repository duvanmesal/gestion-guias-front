"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AppShell } from "@/shared/components/layout/AppShell"
import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardContent,
} from "@/shared/components/glass/GlassCard"
import { GlassInput } from "@/shared/components/glass/GlassInput"
import { GlassSelect } from "@/shared/components/glass/GlassSelect"
import { GlassButton } from "@/shared/components/glass/GlassButton"
import { useToast } from "@/shared/components/feedback/Toast"
import { useAuthStore } from "@/app/stores/auth-store"
import { usersApi } from "@/core/api"
import { useMe } from "@/hooks/use-me"
import {
  updateProfileSchema,
  changePasswordSchema,
} from "@/core/utils/validation"
import type {
  UpdateProfileFormData,
  ChangePasswordFormData,
} from "@/core/utils/validation"
import { DocumentType } from "@/core/models/auth"
import type { UpdateMeRequest } from "@/core/models/users"
import { User, Lock, Monitor, Save, AlertCircle } from "lucide-react"
import type { AxiosError } from "axios"
import type { ApiResponse } from "@/core/models/api"
import { SessionsCard } from "./SessionsCard"

export function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const { me, isLoading: isLoadingMe } = useMe()
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "sessions">(
    "profile"
  )

  // Determine if user needs to complete onboarding
  const isOnboarding = me?.profileStatus === "INCOMPLETE"

  // Update basic profile mutation (PATCH /users/me for nombres, apellidos, telefono)
  const updateMeMutation = useMutation({
    mutationFn: (data: UpdateMeRequest) => usersApi.updateMe(data),
    onSuccess: (response) => {
      if (response.data) {
        updateUser(response.data as any)
        queryClient.invalidateQueries({ queryKey: ["me"] })
        showToast("success", "Perfil actualizado exitosamente")
      }
    },
    onError: (error: AxiosError<ApiResponse<unknown>>) => {
      const errorMessage =
        error.response?.data?.error?.message || "Error al actualizar perfil"
      showToast("error", errorMessage)
    },
  })

  // Onboarding profile completion mutation (PATCH /users/me/profile)
  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileFormData) => usersApi.updateProfile(data),
    onSuccess: (response) => {
      if (response.data) {
        updateUser(response.data)
        queryClient.invalidateQueries({ queryKey: ["me"] })
        showToast("success", "Perfil completado exitosamente")
      }
    },
    onError: (error: AxiosError<ApiResponse<unknown>>) => {
      const errorMessage =
        error.response?.data?.error?.message || "Error al completar perfil"
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
      showToast("success", "Contrasena actualizada exitosamente")
      resetPasswordForm()
    },
    onError: (error: AxiosError<ApiResponse<unknown>>) => {
      const errorMessage =
        error.response?.data?.error?.message || "Error al cambiar contrasena"
      showToast("error", errorMessage)
    },
  })

  // Profile form (use me data for defaults)
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfileForm,
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      nombres: me?.nombres || user?.nombres || "",
      apellidos: me?.apellidos || user?.apellidos || "",
      telefono: me?.telefono || user?.telefono || "",
      documentType: me?.documentType || user?.documentType || undefined,
      documentNumber: me?.documentNumber || user?.documentNumber || "",
    },
  })

  // Reset form when me data loads
  useEffect(() => {
    if (me) {
      resetProfileForm({
        nombres: me.nombres || "",
        apellidos: me.apellidos || "",
        telefono: me.telefono || "",
        documentType: me.documentType || undefined,
        documentNumber: me.documentNumber || "",
      })
    }
  }, [me, resetProfileForm])

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
    if (isOnboarding) {
      // For onboarding, use the complete profile endpoint
      updateProfileMutation.mutate(data)
    } else {
      // For regular profile updates, use PATCH /users/me with only basic fields
      const basicData: UpdateMeRequest = {}
      if (data.nombres) basicData.nombres = data.nombres
      if (data.apellidos) basicData.apellidos = data.apellidos
      if (data.telefono) basicData.telefono = data.telefono
      
      // Only send if there are changes
      if (Object.keys(basicData).length > 0) {
        updateMeMutation.mutate(basicData)
      }
    }
  }

  const onSubmitPassword = (data: ChangePasswordFormData) => {
    changePasswordMutation.mutate(data)
  }

  const tabs = [
    { id: "profile" as const, label: "Perfil", icon: User },
    { id: "password" as const, label: "Contrasena", icon: Lock },
    { id: "sessions" as const, label: "Sesiones", icon: Monitor },
  ]

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="animate-fade-in-up">
          <h1 className="text-3xl font-bold text-[rgb(var(--color-fg))] mb-1">
            Mi Perfil
          </h1>
          <p className="text-[rgb(var(--color-muted))]">
            Gestiona tu informacion personal y configuracion
          </p>
        </div>

        {/* Tabs */}
        <div
          className="glass-subtle p-1.5 inline-flex rounded-xl animate-fade-in-up"
          style={{ animationDelay: "0.05s" }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-lg transition-all duration-200 focus-ring flex items-center gap-2 ${
                activeTab === tab.id
                  ? "glass bg-[rgb(var(--color-primary)/0.15)] text-[rgb(var(--color-primary))]"
                  : "text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-fg))] hover:bg-[rgb(var(--color-glass-hover)/0.3)]"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="font-medium text-sm">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <GlassCard className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <GlassCardHeader>
              <GlassCardTitle>Informacion Personal</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <form
                onSubmit={handleSubmitProfile(onSubmitProfile)}
                className="space-y-5"
              >
                {/* Email (read-only) */}
                <div className="glass-subtle p-4 rounded-xl">
                  <p className="text-xs text-[rgb(var(--color-muted))] uppercase tracking-wider mb-1">
                    Email
                  </p>
                  <p className="font-semibold text-[rgb(var(--color-fg))]">
                    {user?.email}
                  </p>
                  <p className="text-xs text-[rgb(var(--color-muted))] mt-1">
                    El email no se puede modificar
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <GlassInput
                    label="Nombres"
                    error={profileErrors.nombres?.message}
                    {...registerProfile("nombres")}
                  />
                  <GlassInput
                    label="Apellidos"
                    error={profileErrors.apellidos?.message}
                    {...registerProfile("apellidos")}
                  />
                </div>

                <GlassInput
                  label="Telefono"
                  error={profileErrors.telefono?.message}
                  {...registerProfile("telefono")}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <GlassSelect
                    label="Tipo de Documento"
                    options={[
                      { value: "", label: "Seleccionar..." },
                      { value: DocumentType.CC, label: "Cedula de Ciudadania" },
                      { value: DocumentType.CE, label: "Cedula de Extranjeria" },
                      { value: DocumentType.PASAPORTE, label: "Pasaporte" },
                    ]}
                    error={profileErrors.documentType?.message}
                    {...registerProfile("documentType")}
                  />

                  <GlassInput
                    label="Numero de Documento"
                    error={profileErrors.documentNumber?.message}
                    {...registerProfile("documentNumber")}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <GlassButton
                    type="submit"
                    variant="primary"
                    loading={updateProfileMutation.isPending || updateMeMutation.isPending}
                  >
                    <Save className="w-4 h-4" />
                    {isOnboarding ? "Completar Perfil" : "Guardar Cambios"}
                  </GlassButton>
                </div>
              </form>
            </GlassCardContent>
          </GlassCard>
        )}

        {/* Password Tab */}
        {activeTab === "password" && (
          <GlassCard className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <GlassCardHeader>
              <GlassCardTitle>Cambiar Contrasena</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <form
                onSubmit={handleSubmitPassword(onSubmitPassword)}
                className="space-y-5"
              >
                <GlassInput
                  label="Contrasena Actual"
                  type="password"
                  error={passwordErrors.currentPassword?.message}
                  {...registerPassword("currentPassword")}
                />

                <GlassInput
                  label="Nueva Contrasena"
                  type="password"
                  error={passwordErrors.newPassword?.message}
                  helperText="Minimo 8 caracteres con mayuscula, minuscula, numero y simbolo"
                  {...registerPassword("newPassword")}
                />

                <div className="flex justify-end pt-2">
                  <GlassButton
                    type="submit"
                    variant="primary"
                    loading={changePasswordMutation.isPending}
                  >
                    <Lock className="w-4 h-4" />
                    Cambiar Contrasena
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
