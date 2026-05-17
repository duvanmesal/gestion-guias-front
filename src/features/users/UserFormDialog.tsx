"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { GlassModal, GlassModalFooter } from "@/shared/components/glass/GlassModal"
import { GlassInput } from "@/shared/components/glass/GlassInput"
import { SearchableCombobox } from "@/shared/components/glass/SearchableCombobox"
import { GlassButton } from "@/shared/components/glass/GlassButton"
import { useToast } from "@/shared/components/feedback/Toast"
import { useUsers } from "@/hooks/use-users"
import { createUserSchema, updateUserSchema } from "@/core/utils/validation"
import type { CreateUserFormData, UpdateUserFormData } from "@/core/utils/validation"
import type { User } from "@/core/models/auth"
import { Rol } from "@/core/models/auth"
import type { AxiosError } from "axios"
import type { ApiResponse } from "@/core/models/api"
import { useEffect } from "react"
import { useGuidesLookup } from "@/hooks/use-guides"
import { useOperationalConfig } from "@/hooks/use-operational-config"
import { AlertTriangle, CheckCircle2, Clock3 } from "lucide-react"

interface UserFormDialogProps {
  isOpen: boolean
  onClose: () => void
  user?: User | null
  onSuccess?: () => void
}

const ROL_OPTIONS = [
  { value: Rol.GUIA, label: "Guía" },
  { value: Rol.SUPERVISOR, label: "Supervisor" },
  { value: Rol.SUPER_ADMIN, label: "Super Admin" },
]

const ACTIVO_OPTIONS = [
  { value: "true", label: "Activo" },
  { value: "false", label: "Inactivo" },
]

export function UserFormDialog({ isOpen, onClose, user, onSuccess }: UserFormDialogProps) {
  const { showToast } = useToast()
  const { createUser, updateUser, isCreating, isUpdating } = useUsers()

  const isEditing = !!user
  const isGuiaUser = isEditing && user?.rol === Rol.GUIA

  // Pull live availability for guides (only fetch when editing a guide)
  const { guides } = useGuidesLookup({
    pageSize: 500,
    enabled: isOpen && isGuiaUser,
  })
  const { config } = useOperationalConfig({ enabled: isOpen && isGuiaUser })

  const guideOpInfo =
    isGuiaUser && user?.guiaId
      ? guides.find((g) => g.guiaId === user.guiaId)
      : undefined

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CreateUserFormData | UpdateUserFormData>({
    resolver: zodResolver(isEditing ? updateUserSchema : createUserSchema),
    defaultValues: isEditing
      ? {
          email: user.email,
          nombres: user.nombres || "",
          apellidos: user.apellidos || "",
          rol: user.rol,
          activo: user.activo,
        }
      : undefined,
  })

  useEffect(() => {
    if (isOpen && user) {
      reset({
        email: user.email,
        nombres: user.nombres || "",
        apellidos: user.apellidos || "",
        rol: user.rol,
        activo: user.activo,
      })
    } else if (isOpen && !user) {
      reset({
        email: "",
        nombres: "",
        apellidos: "",
        rol: Rol.GUIA,
        password: "",
      })
    }
  }, [isOpen, user, reset])

  const rolValue = watch("rol") as string | undefined
  const activoValue = watch("activo") as boolean | undefined

  const onSubmit = (data: CreateUserFormData | UpdateUserFormData) => {
    if (isEditing && user) {
      updateUser(
        { id: user.id, data: data as UpdateUserFormData },
        {
          onSuccess: () => { onSuccess?.() },
          onError: (error) => {
            const axiosError = error as AxiosError<ApiResponse<unknown>>
            const errorMessage = axiosError.response?.data?.error?.message || "Error al actualizar usuario"
            showToast("error", errorMessage)
          },
        },
      )
    } else {
      createUser(data as CreateUserFormData, {
        onSuccess: () => { onSuccess?.() },
        onError: (error) => {
          const axiosError = error as AxiosError<ApiResponse<unknown>>
          const errorMessage = axiosError.response?.data?.error?.message || "Error al crear usuario"
          showToast("error", errorMessage)
        },
      })
    }
  }

  return (
    <GlassModal isOpen={isOpen} onClose={onClose} title={isEditing ? "Editar Usuario" : "Nuevo Usuario"} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <GlassInput
          label="Email"
          type="email"
          placeholder="usuario@ejemplo.com"
          error={errors.email?.message}
          {...register("email")}
        />

        {!isEditing && (
          <GlassInput
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            error={"password" in errors ? (errors as { password?: { message?: string } }).password?.message : undefined}
            helperText="Mínimo 8 caracteres con mayúscula, minúscula, número y símbolo"
            {...register("password")}
          />
        )}

        <GlassInput label="Nombres" placeholder="Juan" error={errors.nombres?.message} {...register("nombres")} />

        <GlassInput
          label="Apellidos"
          placeholder="Pérez"
          error={errors.apellidos?.message}
          {...register("apellidos")}
        />

        <SearchableCombobox
          label="Rol"
          options={ROL_OPTIONS}
          value={rolValue ?? ""}
          onChange={(val) => setValue("rol", val as Rol, { shouldValidate: true })}
          error={errors.rol?.message}
          searchable={false}
        />

        {isEditing && (
          <SearchableCombobox
            label="Estado"
            options={ACTIVO_OPTIONS}
            value={activoValue != null ? String(activoValue) : "true"}
            onChange={(val) => setValue("activo", val === "true", { shouldValidate: true })}
            searchable={false}
          />
        )}

        {isGuiaUser && (
          <GuideOperationalStatus
            disponible={guideOpInfo?.disponibleParaTurnos ?? user?.disponibleParaTurnos ?? false}
            pendingPenalty={guideOpInfo?.pendingPenalty ?? user?.pendingPenalty ?? false}
            updatedAt={guideOpInfo?.disponibilidadUpdatedAt ?? user?.disponibilidadUpdatedAt ?? null}
            mode={config?.turnoAssignmentMode ?? "MANUAL_RECLAMO"}
          />
        )}

        <GlassModalFooter>
          <GlassButton type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </GlassButton>
          <GlassButton type="submit" variant="primary" loading={isCreating || isUpdating}>
            {isEditing ? "Actualizar" : "Crear"}
          </GlassButton>
        </GlassModalFooter>
      </form>
    </GlassModal>
  )
}

function GuideOperationalStatus({
  disponible,
  pendingPenalty,
  updatedAt,
  mode,
}: {
  disponible: boolean
  pendingPenalty: boolean
  updatedAt: string | null
  mode: "MANUAL_RECLAMO" | "FIFO_GLOBAL"
}) {
  const formatted = updatedAt
    ? new Date(updatedAt).toLocaleString("es-CO", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Sin registro"

  const status = pendingPenalty
    ? {
        label: "Penalizado",
        detail: "Este guía tiene una penalización pendiente y no puede tomar turnos.",
        fg: "rgb(var(--color-warning))",
        bg: "rgba(var(--color-warning), 0.08)",
        border: "rgba(var(--color-warning), 0.22)",
        Icon: AlertTriangle,
      }
    : disponible
      ? {
          label: "Disponible",
          detail: "Puede reclamar turnos o recibir asignaciones automáticas.",
          fg: "rgb(var(--color-success))",
          bg: "rgba(var(--color-success), 0.08)",
          border: "rgba(var(--color-success), 0.22)",
          Icon: CheckCircle2,
        }
      : {
          label: "No disponible",
          detail: "Está fuera del pool de asignación. El cambio lo hace el propio guía o desde Configuración operativa.",
          fg: "rgb(var(--color-muted))",
          bg: "rgba(var(--color-border), 0.04)",
          border: "rgba(var(--color-border), 0.10)",
          Icon: CheckCircle2,
        }

  return (
    <div>
      <p
        className="text-[11px] font-semibold uppercase mb-2"
        style={{
          color: "rgb(var(--color-muted))",
          letterSpacing: "0.1em",
        }}
      >
        Estado operativo
      </p>
      <div
        className="rounded-xl p-3.5"
        style={{
          background: status.bg,
          border: `1px solid ${status.border}`,
        }}
      >
        <div className="flex items-start gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "rgba(255,255,255,0.6)", color: status.fg }}
          >
            <status.Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p
                className="text-[10.5px] font-semibold uppercase"
                style={{ color: status.fg, letterSpacing: "0.08em" }}
              >
                Disponibilidad
              </p>
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: status.fg, animation: "pulse-ring 2s ease-in-out infinite" }}
              />
            </div>
            <p
              className="text-sm font-semibold mt-0.5"
              style={{ color: "rgb(var(--color-fg))" }}
            >
              {status.label}
            </p>
            <p
              className="text-xs mt-1 leading-relaxed"
              style={{ color: "rgb(var(--color-muted))" }}
            >
              {status.detail}
            </p>
          </div>
        </div>

        <div
          className="mt-3 pt-3 grid grid-cols-2 gap-3"
          style={{ borderTop: "1px dashed rgba(var(--color-border), 0.10)" }}
        >
          <div>
            <p
              className="text-[10px] font-semibold uppercase"
              style={{
                color: "rgb(var(--color-muted))",
                letterSpacing: "0.08em",
              }}
            >
              Última actualización
            </p>
            <p
              className="text-xs mt-1 flex items-center gap-1.5"
              style={{ color: "rgb(var(--color-fg))" }}
            >
              <Clock3
                className="w-3 h-3"
                style={{ color: "rgb(var(--color-muted))" }}
              />
              {formatted}
            </p>
          </div>
          <div>
            <p
              className="text-[10px] font-semibold uppercase"
              style={{
                color: "rgb(var(--color-muted))",
                letterSpacing: "0.08em",
              }}
            >
              Modo global
            </p>
            <p
              className="text-xs mt-1 font-medium"
              style={{ color: "rgb(var(--color-fg))" }}
            >
              {mode === "FIFO_GLOBAL" ? "FIFO automático" : "Reclamo manual"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
