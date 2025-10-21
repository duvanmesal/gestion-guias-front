import { z } from "zod"
import { Rol, DocumentType } from "@/core/models/auth"
import { Platform } from "@/core/models/auth"
// Login validation
export const loginSchema = z.object({
  email: z.string().min(1, "El email es requerido").email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  platform: z.nativeEnum(Platform).optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>

// Create user validation
export const createUserSchema = z.object({
  email: z.string().min(1, "El email es requerido").email("Email inválido"),
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .regex(/[A-Z]/, "Debe incluir al menos una mayúscula")
    .regex(/[a-z]/, "Debe incluir al menos una minúscula")
    .regex(/[0-9]/, "Debe incluir al menos un número")
    .regex(/[^A-Za-z0-9]/, "Debe incluir al menos un símbolo"),
  nombres: z.string().optional(),
  apellidos: z.string().optional(),
  rol: z.nativeEnum(Rol, { required_error: "El rol es requerido" }),
})

export type CreateUserFormData = z.infer<typeof createUserSchema>

// Update user validation
export const updateUserSchema = z.object({
  email: z.string().email("Email inválido").optional(),
  nombres: z.string().optional(),
  apellidos: z.string().optional(),
  rol: z.nativeEnum(Rol).optional(),
  activo: z.boolean().optional(),
})

export type UpdateUserFormData = z.infer<typeof updateUserSchema>

// Change password validation
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "La contraseña actual es requerida"),
  newPassword: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .regex(/[A-Z]/, "Debe incluir al menos una mayúscula")
    .regex(/[a-z]/, "Debe incluir al menos una minúscula")
    .regex(/[0-9]/, "Debe incluir al menos un número")
    .regex(/[^A-Za-z0-9]/, "Debe incluir al menos un símbolo"),
})

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

// Update profile validation
export const updateProfileSchema = z.object({
  nombres: z
    .string()
    .min(1, "Los nombres son requeridos")
    .max(100, "Máximo 100 caracteres")
    .regex(/^[A-Za-zÁÉÍÓÚÑÜäëïöüáéíóúñü' -]+$/, "Solo letras, espacios y guiones"),
  apellidos: z
    .string()
    .min(1, "Los apellidos son requeridos")
    .max(100, "Máximo 100 caracteres")
    .regex(/^[A-Za-zÁÉÍÓÚÑÜäëïöüáéíóúñü' -]+$/, "Solo letras, espacios y guiones"),
  telefono: z
    .string()
    .min(7, "Mínimo 7 caracteres")
    .max(20, "Máximo 20 caracteres")
    .regex(/^[0-9()+\-\s]+$/, "Formato inválido")
    .optional()
    .or(z.literal("")),
  documentType: z.nativeEnum(DocumentType).optional(),
  documentNumber: z
    .string()
    .min(6, "Mínimo 6 caracteres")
    .max(20, "Máximo 20 caracteres")
    .regex(/^[A-Za-z0-9]+$/, "Solo letras y números")
    .optional()
    .or(z.literal("")),
})

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>

// Create invitation validation
export const createInvitationSchema = z.object({
  email: z.string().min(1, "El email es requerido").email("Email inválido"),
  role: z.nativeEnum(Rol, { required_error: "El rol es requerido" }),
})

export type CreateInvitationFormData = z.infer<typeof createInvitationSchema>

// Email test validation
export const emailTestSchema = z.object({
  to: z.string().min(1, "El destinatario es requerido").email("Email inválido"),
  subject: z.string().min(1, "El asunto es requerido").max(120, "Máximo 120 caracteres"),
  message: z.string().min(1, "El mensaje es requerido").max(5000, "Máximo 5000 caracteres"),
})

export type EmailTestFormData = z.infer<typeof emailTestSchema>
