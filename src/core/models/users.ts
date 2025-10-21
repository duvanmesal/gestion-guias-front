import type { Rol, DocumentType } from "./auth"

// User List Query Params
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

// Update User Request
export interface UpdateUserRequest {
  email?: string
  nombres?: string
  apellidos?: string
  rol?: Rol
  activo?: boolean
}

// Change Password Request
export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

// Update Profile Request
export interface UpdateProfileRequest {
  nombres?: string
  apellidos?: string
  telefono?: string
  documentType?: DocumentType
  documentNumber?: string
}
