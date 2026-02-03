import type { Rol, DocumentType } from "./auth"

// Profile Status
export type ProfileStatus = "INCOMPLETE" | "COMPLETE"

// User Me Response (includes operational IDs)
export interface UserMeResponse {
  id: string
  email: string
  rol: Rol
  profileStatus: ProfileStatus
  activo: boolean
  nombres: string | null
  apellidos: string | null
  telefono: string | null
  documentType: DocumentType | null
  documentNumber: string | null
  emailVerifiedAt: string | null
  guiaId?: string | null
  supervisorId?: string | null
  createdAt: string
  updatedAt: string
}

// User Search Query Params (new advanced search)
export interface UsersSearchParams {
  q?: string
  role?: Rol
  activo?: boolean
  profileStatus?: ProfileStatus
  createdFrom?: string
  createdTo?: string
  updatedFrom?: string
  updatedTo?: string
  page?: number
  pageSize?: number
  orderBy?: "createdAt" | "updatedAt" | "email"
  orderDir?: "asc" | "desc"
}

// Legacy User List Query Params (deprecated, use UsersSearchParams)
export interface UsersQueryParams {
  page?: number
  pageSize?: number
  search?: string
  rol?: Rol
  activo?: boolean
}

// Create User Request
export interface CreateUserRequest {
  email: string
  password: string
  nombres?: string
  apellidos?: string
  rol: Rol
}

// Update User Request (admin updating other users)
export interface UpdateUserRequest {
  email?: string
  nombres?: string
  apellidos?: string
  rol?: Rol
  activo?: boolean
}

// Update Me Request (user updating their own basic data)
export interface UpdateMeRequest {
  nombres?: string
  apellidos?: string
  telefono?: string
}

// Change Password Request
export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

// Update Profile Request (for onboarding - completeProfile)
export interface UpdateProfileRequest {
  nombres?: string
  apellidos?: string
  telefono?: string
  documentType?: DocumentType
  documentNumber?: string
}
