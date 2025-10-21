import { http } from "./http"
import type { ApiResponse, MetaPage } from "@/core/models/api"
import type { User } from "@/core/models/auth"
import type {
  UsersQueryParams,
  CreateUserRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
  UpdateProfileRequest,
} from "@/core/models/users"

export const usersApi = {
  // Get users list with pagination and filters
  async getUsers(params?: UsersQueryParams): Promise<ApiResponse<User[]> & { meta: MetaPage }> {
    const response = await http.get<ApiResponse<User[]> & { meta: MetaPage }>("/users", { params })
    return response.data
  },

  // Get user by ID
  async getUser(id: string): Promise<ApiResponse<User>> {
    const response = await http.get<ApiResponse<User>>(`/users/${id}`)
    return response.data
  },

  // Create new user
  async createUser(data: CreateUserRequest): Promise<ApiResponse<User>> {
    const response = await http.post<ApiResponse<User>>("/users", data)
    return response.data
  },

  // Update user
  async updateUser(id: string, data: UpdateUserRequest): Promise<ApiResponse<User>> {
    const response = await http.patch<ApiResponse<User>>(`/users/${id}`, data)
    return response.data
  },

  // Delete user
  async deleteUser(id: string): Promise<void> {
    await http.delete(`/users/${id}`)
  },

  // Change password
  async changePassword(id: string, data: ChangePasswordRequest): Promise<void> {
    await http.patch(`/users/${id}/password`, data)
  },

  // Update own profile
  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<User>> {
    const response = await http.patch<ApiResponse<User>>("/users/me/profile", data)
    return response.data
  },
}
