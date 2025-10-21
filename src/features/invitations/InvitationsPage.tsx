import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { GlassModal, GlassModalFooter } from "@/shared/components/glass/GlassModal"
import { Skeleton } from "@/shared/components/feedback/Skeleton"
import { useToast } from "@/shared/components/feedback/Toast"
import type { Invitation } from "@/core/models/invitations"
import { useInvitations } from "@/hooks/use-invitations"
import {
  createInvitationSchema,
  type CreateInvitationFormData,
} from "@/core/utils/validation"
import { Rol } from "@/core/models/auth"
import { InvitationStatus } from "@/core/models/invitations"
import {
  Plus,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Send,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { AxiosError } from "axios"
import type { ApiResponse } from "@/core/models/api"

export function InvitationsPage() {
  const { showToast } = useToast()
  const {
    invitations,
    isLoading,
    createInvitation,
    resendInvitation,
    isCreating,
    isResending,
  } = useInvitations()
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
        const errorMessage =
          axiosError.response?.data?.error?.message ||
          "Error al enviar invitación"
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
        const errorMessage =
          axiosError.response?.data?.error?.message ||
          "Error al reenviar invitación"
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
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
      case InvitationStatus.ACCEPTED:
        return "text-green-400 bg-green-400/10 border-green-400/20"
      case InvitationStatus.EXPIRED:
        return "text-red-400 bg-red-400/10 border-red-400/20"
    }
  }

  // ✅ siempre es array, incluso si backend devuelve null, objeto o string
  const safeInvitations: Invitation[] = Array.isArray(invitations)
    ? (invitations as Invitation[])
    : Array.isArray((invitations as any)?.data)
    ? ((invitations as any).data as Invitation[])
    : []

  return (
    <AppShell>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="glass-strong p-8 rounded-2xl border border-white/10 hover-lift animate-fade-in-up relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[rgb(var(--color-primary)/0.1)] to-transparent rounded-full blur-3xl" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-[rgb(var(--color-primary))] via-[rgb(var(--color-accent))] to-[rgb(var(--color-primary))] bg-clip-text text-transparent mb-2">
                Invitaciones
              </h2>
              <p className="text-[rgb(var(--color-fg)/0.6)] text-base">
                Invita nuevos usuarios al sistema
              </p>
            </div>

            <GlassButton
              variant="primary"
              onClick={() => setIsCreateDialogOpen(true)}
              className="hover-glow"
            >
              <Plus className="w-4 h-4" />
              Nueva Invitación
            </GlassButton>
          </div>
        </div>

        {/* LISTA */}
        <GlassCard
          className="border border-white/5 animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          <GlassCardHeader>
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-[rgb(var(--color-primary))]" />
              <GlassCardTitle>Lista de Invitaciones</GlassCardTitle>
            </div>
          </GlassCardHeader>

          <GlassCardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton height="5rem" />
                <Skeleton height="5rem" />
                <Skeleton height="5rem" />
              </div>
            ) : safeInvitations.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[rgb(var(--color-primary)/0.2)] to-[rgb(var(--color-accent)/0.1)] flex items-center justify-center mx-auto mb-4 border border-white/10">
                  <Mail className="w-8 h-8 text-[rgb(var(--color-primary))]" />
                </div>
                <p className="text-[rgb(var(--color-fg))] font-medium mb-1">
                  No hay invitaciones
                </p>
                <p className="text-sm text-[rgb(var(--color-fg)/0.5)]">
                  Crea una nueva invitación para comenzar
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {safeInvitations.map((invitation, index) => (
                  <div
                    key={invitation.id}
                    className="glass-strong p-5 rounded-xl border border-white/5 hover-lift animate-fade-in-up relative overflow-hidden group"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[rgb(var(--color-primary)/0.05)] to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[rgb(var(--color-primary)/0.2)] to-[rgb(var(--color-accent)/0.1)] flex items-center justify-center border border-white/10">
                            <Mail className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-[rgb(var(--color-fg))]">
                              {invitation.email}
                            </p>
                            <span className="inline-block text-xs px-2.5 py-1 rounded-lg glass border border-white/10 bg-gradient-to-r from-[rgb(var(--color-primary)/0.2)] to-[rgb(var(--color-accent)/0.15)] text-[rgb(var(--color-primary))] font-medium mt-1">
                              {invitation.role}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(invitation.status)}
                          <span
                            className={`text-sm font-medium px-3 py-1 rounded-lg border ${getStatusColor(
                              invitation.status
                            )}`}
                          >
                            {invitation.status}
                          </span>
                        </div>

                        <p className="text-xs text-[rgb(var(--color-fg)/0.5)] flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          Expira:{" "}
                          {format(new Date(invitation.expiresAt), "PPp", {
                            locale: es,
                          })}
                        </p>
                      </div>

                      {invitation.status === InvitationStatus.PENDING && (
                        <GlassButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResend(invitation.id)}
                          disabled={isResending}
                          className="hover-glow"
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

      {/* MODAL CREAR INVITACIÓN */}
      <GlassModal
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        title="Nueva Invitación"
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <GlassInput
            label="Email"
            type="email"
            error={errors.email?.message}
            {...register("email")}
          />

          <GlassSelect
            label="Rol"
            options={[
              { value: "", label: "Seleccionar rol..." },
              { value: Rol.GUIA, label: "Guía" },
              { value: Rol.SUPERVISOR, label: "Supervisor" },
            ]}
            error={errors.role?.message}
            {...register("role")}
          />

          <div className="glass-strong p-4 rounded-xl border border-[rgb(var(--color-accent)/0.2)] bg-[rgb(var(--color-accent)/0.05)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[rgb(var(--color-accent)/0.1)] to-transparent rounded-full blur-2xl" />
            <p className="text-sm text-[rgb(var(--color-fg)/0.8)] relative z-10 leading-relaxed">
              Se enviará un correo electrónico con las instrucciones para crear
              la cuenta. La invitación expirará en 24 horas.
            </p>
          </div>

          <GlassModalFooter>
            <GlassButton
              type="button"
              variant="ghost"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancelar
            </GlassButton>
            <GlassButton
              type="submit"
              variant="primary"
              loading={isCreating}
              className="hover-glow"
            >
              <Send className="w-4 h-4" />
              Enviar Invitación
            </GlassButton>
          </GlassModalFooter>
        </form>
      </GlassModal>
    </AppShell>
  )
}
