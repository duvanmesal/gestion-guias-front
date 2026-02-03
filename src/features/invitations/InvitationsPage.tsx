"use client"

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
  Search,
  AlertCircle,
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
    getByEmail,
    isSearchingByEmail,
    resendByEmail,
    isResendingByEmail,
  } = useInvitations()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  
  // Email search state
  const [searchEmail, setSearchEmail] = useState("")
  const [foundInvitation, setFoundInvitation] = useState<Invitation | null | undefined>(undefined)

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
        showToast("success", "Invitacion enviada exitosamente")
        setIsCreateDialogOpen(false)
        reset()
      },
      onError: (error) => {
        const axiosError = error as AxiosError<ApiResponse<unknown>>
        const errorMessage =
          axiosError.response?.data?.error?.message ||
          "Error al enviar invitacion"
        showToast("error", errorMessage)
      },
    })
  }

  const handleResend = (id: string) => {
    resendInvitation(id, {
      onSuccess: () => {
        showToast("success", "Invitacion reenviada exitosamente")
      },
      onError: (error) => {
        const axiosError = error as AxiosError<ApiResponse<unknown>>
        const errorMessage =
          axiosError.response?.data?.error?.message ||
          "Error al reenviar invitacion"
        showToast("error", errorMessage)
      },
    })
  }

  const handleSearchByEmail = async () => {
    if (!searchEmail.trim()) {
      showToast("error", "Ingresa un email para buscar")
      return
    }
    try {
      const result = await getByEmail(searchEmail.trim())
      setFoundInvitation(result)
      if (!result) {
        showToast("info", "No se encontro invitacion para este email")
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<unknown>>
      const errorMessage =
        axiosError.response?.data?.error?.message ||
        "Error al buscar invitacion"
      showToast("error", errorMessage)
    }
  }

  const handleResendByEmail = () => {
    if (!searchEmail.trim()) {
      showToast("error", "Ingresa un email para reenviar")
      return
    }
    resendByEmail(searchEmail.trim(), {
      onSuccess: () => {
        showToast("success", "Invitacion reenviada exitosamente")
        setFoundInvitation(undefined)
        setSearchEmail("")
      },
      onError: (error) => {
        const axiosError = error as AxiosError<ApiResponse<unknown>>
        const errorMessage =
          axiosError.response?.data?.error?.message ||
          "Error al reenviar invitacion"
        showToast("error", errorMessage)
      },
    })
  }

  const getStatusBadge = (status: InvitationStatus) => {
    const configs = {
      [InvitationStatus.PENDING]: {
        icon: Clock,
        color: "text-[rgb(var(--color-warning))] bg-[rgb(var(--color-warning)/0.15)]",
        label: "Pendiente",
      },
      [InvitationStatus.ACCEPTED]: {
        icon: CheckCircle,
        color: "text-[rgb(var(--color-success))] bg-[rgb(var(--color-success)/0.15)]",
        label: "Aceptada",
      },
      [InvitationStatus.EXPIRED]: {
        icon: XCircle,
        color: "text-[rgb(var(--color-danger))] bg-[rgb(var(--color-danger)/0.15)]",
        label: "Expirada",
      },
    }

    const config = configs[status]
    const Icon = config.icon

    return (
      <span
        className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-lg ${config.color}`}
      >
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    )
  }

  const safeInvitations: Invitation[] = Array.isArray(invitations)
    ? (invitations as Invitation[])
    : Array.isArray((invitations as any)?.data)
      ? ((invitations as any).data as Invitation[])
      : []

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-bold text-[rgb(var(--color-fg))] mb-1">
              Invitaciones
            </h1>
            <p className="text-[rgb(var(--color-muted))]">
              Invita nuevos usuarios al sistema
            </p>
          </div>

          <GlassButton
            variant="primary"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Nueva Invitacion
          </GlassButton>
        </div>

        {/* Email Search */}
        <GlassCard className="animate-fade-in-up" style={{ animationDelay: "0.03s" }}>
          <GlassCardContent>
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-4 h-4 text-[rgb(var(--color-primary))]" />
              <span className="text-sm font-medium text-[rgb(var(--color-muted))]">
                Buscar por Email
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <GlassInput
                  placeholder="correo@ejemplo.com"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchByEmail()}
                />
              </div>
              <div className="flex gap-2">
                <GlassButton
                  variant="secondary"
                  onClick={handleSearchByEmail}
                  loading={isSearchingByEmail}
                >
                  <Search className="w-4 h-4" />
                  Buscar
                </GlassButton>
                <GlassButton
                  variant="ghost"
                  onClick={handleResendByEmail}
                  loading={isResendingByEmail}
                >
                  <RefreshCw className="w-4 h-4" />
                  Reenviar por Email
                </GlassButton>
              </div>
            </div>

            {/* Search Result */}
            {foundInvitation !== undefined && (
              <div className="mt-4 pt-4 border-t border-[rgb(var(--color-border)/0.1)]">
                {foundInvitation ? (
                  <div className="glass-subtle p-4 rounded-xl">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-[rgb(var(--color-fg))]">
                          {foundInvitation.email}
                        </p>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          {getStatusBadge(foundInvitation.status)}
                          <span className="inline-block text-xs px-2.5 py-0.5 rounded bg-[rgb(var(--color-accent)/0.15)] text-[rgb(var(--color-accent))] font-semibold">
                            {foundInvitation.role}
                          </span>
                          <p className="text-xs text-[rgb(var(--color-muted))] flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            Expira:{" "}
                            {format(new Date(foundInvitation.expiresAt), "PPp", {
                              locale: es,
                            })}
                          </p>
                        </div>
                      </div>
                      {(foundInvitation.status === InvitationStatus.PENDING ||
                        foundInvitation.status === InvitationStatus.EXPIRED) && (
                        <GlassButton
                          variant="primary"
                          size="sm"
                          onClick={handleResendByEmail}
                          loading={isResendingByEmail}
                        >
                          <RefreshCw className="w-4 h-4" />
                          Reenviar
                        </GlassButton>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-[rgb(var(--color-warning))]">
                    <AlertCircle className="w-5 h-5" />
                    <div>
                      <p className="font-medium">No se encontro invitacion</p>
                      <p className="text-sm text-[rgb(var(--color-muted))]">
                        Puedes crear una nueva invitacion para este email
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </GlassCardContent>
        </GlassCard>

        {/* Invitations List */}
        <GlassCard className="animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
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
                <div className="w-16 h-16 rounded-2xl bg-[rgb(var(--color-primary)/0.1)] flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-[rgb(var(--color-primary))]" />
                </div>
                <p className="text-[rgb(var(--color-fg))] font-medium mb-1">
                  No hay invitaciones
                </p>
                <p className="text-sm text-[rgb(var(--color-muted))]">
                  Crea una nueva invitacion para comenzar
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {safeInvitations.map((invitation, index) => (
                  <div
                    key={invitation.id}
                    className="glass-subtle p-5 rounded-xl animate-fade-in-up hover:bg-[rgb(var(--color-glass-hover)/0.3)] transition-colors"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-[rgb(var(--color-primary)/0.15)] flex items-center justify-center">
                            <Mail className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-[rgb(var(--color-fg))]">
                              {invitation.email}
                            </p>
                            <span className="inline-block text-xs px-2.5 py-0.5 rounded bg-[rgb(var(--color-accent)/0.15)] text-[rgb(var(--color-accent))] font-semibold mt-1">
                              {invitation.role}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                          {getStatusBadge(invitation.status)}
                          <p className="text-xs text-[rgb(var(--color-muted))] flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            Expira:{" "}
                            {format(new Date(invitation.expiresAt), "PPp", {
                              locale: es,
                            })}
                          </p>
                        </div>
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

      {/* Create Invitation Modal */}
      <GlassModal
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        title="Nueva Invitacion"
        description="Envia una invitacion por correo electronico"
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <GlassInput
            label="Email"
            type="email"
            placeholder="correo@ejemplo.com"
            error={errors.email?.message}
            {...register("email")}
          />

          <GlassSelect
            label="Rol"
            options={[
              { value: "", label: "Seleccionar rol..." },
              { value: Rol.GUIA, label: "Guia" },
              { value: Rol.SUPERVISOR, label: "Supervisor" },
            ]}
            error={errors.role?.message}
            {...register("role")}
          />

          <div className="glass-subtle p-4 rounded-xl">
            <p className="text-sm text-[rgb(var(--color-fg)/0.8)] leading-relaxed">
              Se enviara un correo electronico con las instrucciones para crear
              la cuenta. La invitacion expirara en 24 horas.
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
            <GlassButton type="submit" variant="primary" loading={isCreating}>
              <Send className="w-4 h-4" />
              Enviar Invitacion
            </GlassButton>
          </GlassModalFooter>
        </form>
      </GlassModal>
    </AppShell>
  )
}
