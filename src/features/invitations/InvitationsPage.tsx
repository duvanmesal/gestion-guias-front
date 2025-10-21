"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AppShell } from "@/shared/components/layout/AppShell"
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from "@/shared/components/glass/GlassCard"
import { GlassInput } from "@/shared/components/glass/GlassInput"
import { GlassSelect } from "@/shared/components/glass/GlassSelect"
import { GlassButton } from "@/shared/components/glass/GlassButton"
import { GlassModal, GlassModalFooter } from "@/shared/components/glass/GlassModal"
import { Skeleton } from "@/shared/components/feedback/Skeleton"
import { useToast } from "@/shared/components/feedback/Toast"
import { useInvitations } from "@/hooks/use-invitations"
import { createInvitationSchema, type CreateInvitationFormData } from "@/core/utils/validation"
import { Rol } from "@/core/models/auth"
import { InvitationStatus } from "@/core/models/invitations"
import { Plus, Mail, Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { AxiosError } from "axios"
import type { ApiResponse } from "@/core/models/api"

export function InvitationsPage() {
  const { showToast } = useToast()
  const { invitations, isLoading, createInvitation, resendInvitation, isCreating, isResending } = useInvitations()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateInvitationFormData>({
    resolver: zodResolver(createInvitationSchema),
  })

  const onSubmit = (data: CreateInvitationFormData) => {
    createInvitation(data, {
      onSuccess: () => {
        showToast("success", "Invitación enviada exitosamente")
        setIsCreateDialogOpen(false)
        reset()
      },
      onError: (error) => {
        const axiosError = error as AxiosError<ApiResponse<unknown>>
        const errorMessage = axiosError.response?.data?.error?.message || "Error al enviar invitación"
        showToast("error", errorMessage)
      },
    })
  }

  const handleResend = (id: string) => {
    resendInvitation(id, {
      onSuccess: () => {
        showToast("success", "Invitación reenviada exitosamente")
      },
      onError: (error) => {
        const axiosError = error as AxiosError<ApiResponse<unknown>>
        const errorMessage = axiosError.response?.data?.error?.message || "Error al reenviar invitación"
        showToast("error", errorMessage)
      },
    })
  }

  const getStatusIcon = (status: InvitationStatus) => {
    switch (status) {
      case InvitationStatus.PENDING:
        return <Clock className="w-4 h-4 text-yellow-400" />
      case InvitationStatus.ACCEPTED:
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case InvitationStatus.EXPIRED:
        return <XCircle className="w-4 h-4 text-red-400" />
    }
  }

  const getStatusColor = (status: InvitationStatus) => {
    switch (status) {
      case InvitationStatus.PENDING:
        return "text-yellow-400"
      case InvitationStatus.ACCEPTED:
        return "text-green-400"
      case InvitationStatus.EXPIRED:
        return "text-red-400"
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-[rgb(var(--color-fg))]">Invitaciones</h2>
            <p className="text-[rgb(var(--color-fg)/0.6)]">Invita nuevos usuarios al sistema</p>
          </div>

          <GlassButton variant="primary" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            Nueva Invitación
          </GlassButton>
        </div>

        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle>Lista de Invitaciones</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton height="5rem" />
                <Skeleton height="5rem" />
                <Skeleton height="5rem" />
              </div>
            ) : invitations.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="w-12 h-12 text-[rgb(var(--color-fg)/0.3)] mx-auto mb-3" />
                <p className="text-[rgb(var(--color-fg)/0.6)]">No hay invitaciones</p>
                <p className="text-sm text-[rgb(var(--color-fg)/0.5)] mt-1">Crea una nueva invitación para comenzar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {invitations.map((invitation) => (
                  <div key={invitation.id} className="glass p-4 rounded-xl">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-medium text-[rgb(var(--color-fg))]">{invitation.email}</p>
                          <span className="text-xs px-2 py-1 rounded bg-[rgb(var(--color-primary)/0.2)] text-[rgb(var(--color-primary))]">
                            {invitation.role}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          {getStatusIcon(invitation.status)}
                          <span className={getStatusColor(invitation.status)}>{invitation.status}</span>
                        </div>
                        <p className="text-xs text-[rgb(var(--color-fg)/0.5)] mt-2">
                          Expira: {format(new Date(invitation.expiresAt), "PPp", { locale: es })}
                        </p>
                      </div>

                      {invitation.status === InvitationStatus.PENDING && (
                        <GlassButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResend(invitation.id)}
                          disabled={isResending}
                        >
                          <RefreshCw className="w-4 h-4" />
                          Reenviar
                        </GlassButton>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCardContent>
        </GlassCard>
      </div>

      {/* Create Invitation Dialog */}
      <GlassModal
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        title="Nueva Invitación"
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <GlassInput
            label="Email"
            type="email"
            placeholder="usuario@ejemplo.com"
            error={errors.email?.message}
            {...register("email")}
          />

          <GlassSelect
            label="Rol"
            options={[
              { value: Rol.GUIA, label: "Guía" },
              { value: Rol.SUPERVISOR, label: "Supervisor" },
            ]}
            error={errors.role?.message}
            {...register("role")}
          />

          <div className="glass p-3 rounded-xl border border-[rgb(var(--color-accent)/0.2)] bg-[rgb(var(--color-accent)/0.05)]">
            <p className="text-sm text-[rgb(var(--color-fg)/0.8)]">
              Se enviará un correo electrónico con las instrucciones para crear la cuenta. La invitación expirará en 24
              horas.
            </p>
          </div>

          <GlassModalFooter>
            <GlassButton type="button" variant="ghost" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </GlassButton>
            <GlassButton type="submit" variant="primary" loading={isCreating}>
              Enviar Invitación
            </GlassButton>
          </GlassModalFooter>
        </form>
      </GlassModal>
    </AppShell>
  )
}
