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
