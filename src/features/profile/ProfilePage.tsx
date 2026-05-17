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
import { SearchableCombobox } from "@/shared/components/glass/SearchableCombobox"
import { GlassButton } from "@/shared/components/glass/GlassButton"
import { useToast } from "@/shared/components/feedback/Toast"
import { useAuthStore } from "@/app/stores/auth-store"
import { usersApi } from "@/core/api"
import { useMe } from "@/hooks/use-me"
import { useGuideAvailability } from "@/hooks/use-guide-availability"
import {
  updateProfileSchema,
  changePasswordSchema,
} from "@/core/utils/validation"
import type {
  UpdateProfileFormData,
  ChangePasswordFormData,
} from "@/core/utils/validation"
import { DocumentType } from "@/core/models/auth"
import { Rol } from "@/core/models/auth"
import type { UpdateMeRequest } from "@/core/models/users"
import { User, Lock, Monitor, Save, CheckCircle2, AlertTriangle } from "lucide-react"
import { SessionsCard } from "./SessionsCard"

export function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const { me } = useMe()
  const isGuia = user?.rol === Rol.GUIA
  const {
    availability,
    setAvailabilityAsync,
    isUpdating: isUpdatingAvailability,
  } = useGuideAvailability({ enabled: isGuia })
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "sessions">(
    "profile"
  )

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
  })

  // Profile form (use me data for defaults)
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfileForm,
    watch: watchProfile,
    setValue: setProfileValue,
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
    // Regular profile updates use PATCH /users/me with only basic fields.
    const basicData: UpdateMeRequest = {}
    if (data.nombres) basicData.nombres = data.nombres
    if (data.apellidos) basicData.apellidos = data.apellidos
    if (data.telefono) basicData.telefono = data.telefono

    if (Object.keys(basicData).length > 0) {
      updateMeMutation.mutate(basicData)
    }
  }

  const onSubmitPassword = (data: ChangePasswordFormData) => {
    changePasswordMutation.mutate(data)
  }

  const disponibilidadActiva =
    availability?.disponibleParaTurnos ?? me?.disponibleParaTurnos ?? user?.disponibleParaTurnos ?? false
  const pendingPenalty =
    availability?.pendingPenalty ?? me?.pendingPenalty ?? user?.pendingPenalty ?? false

  const handleAvailabilityChange = async (disponible: boolean) => {
    try {
      await setAvailabilityAsync(disponible)
      showToast("success", disponible ? "Disponibilidad activada" : "Disponibilidad desactivada")
    } catch (error: any) {
      const message =
        error?.response?.data?.error?.message ?? "No fue posible actualizar tu disponibilidad"
      showToast("error", message)
    }
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
              {isGuia && (
                <div className="mb-5 glass-subtle rounded-xl p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl ${
                          pendingPenalty
                            ? "bg-[rgb(var(--color-warning)/0.12)]"
                            : disponibilidadActiva
                              ? "bg-[rgb(var(--color-success)/0.12)]"
                              : "bg-[rgb(var(--color-border)/0.08)]"
                        }`}
                      >
                        {pendingPenalty ? (
                          <AlertTriangle className="h-4 w-4 text-[rgb(var(--color-warning))]" />
                        ) : (
                          <CheckCircle2
                            className={`h-4 w-4 ${
                              disponibilidadActiva
                                ? "text-[rgb(var(--color-success))]"
                                : "text-[rgb(var(--color-muted))]"
                            }`}
                          />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[rgb(var(--color-fg))]">
                          Disponibilidad para turnos
                        </p>
                        <p className="mt-1 text-xs text-[rgb(var(--color-muted))]">
                          {pendingPenalty
                            ? "Tienes una penalización pendiente y no puedes tomar turnos."
                            : disponibilidadActiva
                              ? "Estás disponible para reclamo manual o asignación FIFO."
                              : "Marca disponibilidad para poder tomar turnos."}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <GlassButton
                        type="button"
                        variant={disponibilidadActiva ? "primary" : "ghost"}
                        disabled={pendingPenalty || isUpdatingAvailability}
                        loading={isUpdatingAvailability && !disponibilidadActiva}
                        onClick={() => handleAvailabilityChange(true)}
                      >
                        Disponible
                      </GlassButton>
                      <GlassButton
                        type="button"
                        variant={!disponibilidadActiva ? "primary" : "ghost"}
                        disabled={isUpdatingAvailability}
                        loading={isUpdatingAvailability && disponibilidadActiva}
                        onClick={() => handleAvailabilityChange(false)}
                      >
                        No disponible
                      </GlassButton>
                    </div>
                  </div>
                </div>
              )}

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
                  <SearchableCombobox
                    label="Tipo de Documento"
                    options={[
                      { value: DocumentType.CC, label: "Cedula de Ciudadania" },
                      { value: DocumentType.CE, label: "Cedula de Extranjeria" },
                      { value: DocumentType.PAS, label: "Pasaporte" },
                      { value: DocumentType.NIT, label: "NIT" },
                      { value: DocumentType.OTRO, label: "Otro" },
                    ]}
                    value={watchProfile("documentType") ?? ""}
                    onChange={(val) => setProfileValue("documentType", val as DocumentType, { shouldValidate: true })}
                    placeholder="Seleccionar..."
                    error={profileErrors.documentType?.message}
                    searchable={false}
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
                    loading={updateMeMutation.isPending}
                  >
                    <Save className="w-4 h-4" />
                    Guardar Cambios
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
