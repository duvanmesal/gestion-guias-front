"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { CheckCircle, CreditCard, Lock, User } from "lucide-react"

import { useAuthStore } from "@/app/stores/auth-store"
import { usersApi } from "@/core/api"
import { DocumentType } from "@/core/models/auth"
import { socketClient } from "@/core/socket/socket.client"
import { onboardingSchema, type OnboardingFormData } from "@/core/utils/validation"
import { GlassButton } from "@/shared/components/glass/GlassButton"
import {
  GlassCard,
  GlassCardContent,
  GlassCardHeader,
  GlassCardTitle,
} from "@/shared/components/glass/GlassCard"
import { GlassInput } from "@/shared/components/glass/GlassInput"
import { GlassSelect } from "@/shared/components/glass/GlassSelect"
import { useToast } from "@/shared/components/feedback/Toast"

const DOCUMENT_OPTIONS = [
  { value: DocumentType.CC, label: "Cedula de ciudadania" },
  { value: DocumentType.CE, label: "Cedula de extranjeria" },
  { value: DocumentType.PAS, label: "Pasaporte" },
  { value: DocumentType.NIT, label: "NIT" },
  { value: DocumentType.OTRO, label: "Otro" },
]

export function OnboardingPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, clearSession } = useAuthStore()
  const { showToast } = useToast()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      nombres: user?.nombres ?? "",
      apellidos: user?.apellidos ?? "",
      telefono: user?.telefono ?? "",
      documentType: user?.documentType ?? DocumentType.CC,
      documentNumber: user?.documentNumber ?? "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const completeMutation = useMutation({
    mutationFn: async (values: OnboardingFormData) => {
      return usersApi.updateProfile({
        nombres: values.nombres,
        apellidos: values.apellidos,
        telefono: values.telefono,
        documentType: values.documentType,
        documentNumber: values.documentNumber,
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
    },
    onSuccess: () => {
      socketClient.disconnect()
      clearSession()
      queryClient.clear()
      showToast("success", "Perfil activado. Inicia sesion con tu nueva contrasena.")
      navigate("/login", { replace: true })
    },
    onError: (error) => {
      setFormError(error instanceof Error ? error.message : "No se pudo completar el perfil")
    },
  })

  const onSubmit = (values: OnboardingFormData) => {
    setFormError(null)
    completeMutation.mutate(values)
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))] px-4 py-8 md:py-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-[rgb(var(--color-primary)/0.14)] flex items-center justify-center">
            <CheckCircle className="w-7 h-7 text-[rgb(var(--color-primary))]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[rgb(var(--color-fg))]">
              Completa tu perfil
            </h1>
            <p className="text-sm text-[rgb(var(--color-muted))] mt-2">
              Antes de operar, registra tus datos y cambia la contrasena temporal.
            </p>
          </div>
        </div>

        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle>Activacion de cuenta</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[rgb(var(--color-fg))]">
                  <User className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                  Datos personales
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <GlassInput
                    label="Nombres"
                    error={errors.nombres?.message}
                    {...register("nombres")}
                  />
                  <GlassInput
                    label="Apellidos"
                    error={errors.apellidos?.message}
                    {...register("apellidos")}
                  />
                </div>
                <GlassInput
                  label="Telefono"
                  error={errors.telefono?.message}
                  {...register("telefono")}
                />
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[rgb(var(--color-fg))]">
                  <CreditCard className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                  Identificacion
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <GlassSelect
                    label="Tipo de documento"
                    options={DOCUMENT_OPTIONS}
                    error={errors.documentType?.message}
                    {...register("documentType")}
                  />
                  <GlassInput
                    label="Numero de documento"
                    error={errors.documentNumber?.message}
                    {...register("documentNumber")}
                  />
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[rgb(var(--color-fg))]">
                  <Lock className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                  Seguridad
                </div>
                <GlassInput
                  label="Contrasena actual"
                  type="password"
                  error={errors.currentPassword?.message}
                  helperText="Usa la contrasena temporal recibida por correo."
                  {...register("currentPassword")}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <GlassInput
                    label="Nueva contrasena"
                    type="password"
                    error={errors.newPassword?.message}
                    helperText="Minimo 8 caracteres con mayuscula, minuscula, numero y simbolo."
                    {...register("newPassword")}
                  />
                  <GlassInput
                    label="Confirmar contrasena"
                    type="password"
                    error={errors.confirmPassword?.message}
                    {...register("confirmPassword")}
                  />
                </div>
              </section>

              {formError && (
                <div className="rounded-xl border border-[rgb(var(--color-danger)/0.2)] bg-[rgb(var(--color-danger)/0.06)] px-4 py-3 text-sm text-[rgb(var(--color-danger))]">
                  {formError}
                </div>
              )}

              <div className="flex justify-end">
                <GlassButton type="submit" loading={completeMutation.isPending}>
                  Activar cuenta
                </GlassButton>
              </div>
            </form>
          </GlassCardContent>
        </GlassCard>
      </div>
    </div>
  )
}
