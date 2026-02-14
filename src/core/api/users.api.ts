// src/core/api/users.api.ts
import { http } from "./http";
import type { ApiResponse, MetaPage } from "@/core/models/api";
import type { User } from "@/core/models/auth";
import type {
  UsersSearchParams,
  CreateUserRequest,
  UpdateUserRequest,
  UpdateMeRequest,
  ChangePasswordRequest,
  UpdateProfileRequest,
  UserMeResponse,
} from "@/core/models/users";

type AnyParams = Record<string, unknown>;

function cleanParams<T extends object>(params?: T): Partial<T> | undefined {
  if (!params) return undefined;

  const p = { ...(params as AnyParams) };

  // Empty string "q" should not be sent
  if (typeof p.q === "string" && p.q.trim().length === 0) {
    delete p.q;
  }

  // undefined values should not be sent
  for (const [k, v] of Object.entries(p)) {
    if (v === undefined) delete p[k];
  }

  return p as Partial<T>;
}

export type GuidesLookupParams = {
  search?: string;
  activo?: boolean;
  page?: number;
  pageSize?: number;
};

export type GuideLookupItem = {
  guiaId: number;
  nombres: string;
  apellidos: string;
  email: string;
  activo: boolean;
};

export const usersApi = {
  // Get current user with operational IDs (guiaId, supervisorId)
  async getMe(): Promise<ApiResponse<UserMeResponse>> {
    const response = await http.get<ApiResponse<UserMeResponse>>("/users/me");
    return response.data;
  },

  // Update current user basic data (nombres, apellidos, telefono)
  async updateMe(data: UpdateMeRequest): Promise<ApiResponse<UserMeResponse>> {
    const response = await http.patch<ApiResponse<UserMeResponse>>(
      "/users/me",
      data,
    );
    return response.data;
  },

  // Search users with advanced filters and pagination (admin)
  async searchUsers(
    params?: UsersSearchParams,
  ): Promise<ApiResponse<User[]> & { meta: MetaPage }> {
    const apiParams = params
      ? {
          ...params,
          // ✅ map a lo que espera el back
          search: (params as any).search ?? (params as any).q,
          rol: (params as any).rol ?? (params as any).role,

          // ❌ no mandes los aliases
          q: undefined,
          role: undefined,
        }
      : undefined;

    const response = await http.get<ApiResponse<User[]> & { meta: MetaPage }>(
      "/users/search",
      {
        params: cleanParams(apiParams),
      },
    );
    return response.data;
  },

  // ✅ Safe lookup for supervisors: guides only, minimal fields
  async getGuidesLookup(
    params?: GuidesLookupParams,
  ): Promise<ApiResponse<GuideLookupItem[]> & { meta?: MetaPage }> {
    const response = await http.get<
      ApiResponse<GuideLookupItem[]> & { meta?: MetaPage }
    >("/users/guides", {
      params: cleanParams(params),
    });
    return response.data;
  },

  // Get user by ID
  async getUser(id: string): Promise<ApiResponse<User>> {
    const response = await http.get<ApiResponse<User>>(`/users/${id}`);
    return response.data;
  },

  // Create new user
  async createUser(data: CreateUserRequest): Promise<ApiResponse<User>> {
    const response = await http.post<ApiResponse<User>>("/users", data);
    return response.data;
  },

  // Update user (admin)
  async updateUser(
    id: string,
    data: UpdateUserRequest,
  ): Promise<ApiResponse<User>> {
    const response = await http.patch<ApiResponse<User>>(`/users/${id}`, data);
    return response.data;
  },

  // Delete user
  async deleteUser(id: string): Promise<void> {
    await http.delete(`/users/${id}`);
  },

  // Change password
  async changePassword(id: string, data: ChangePasswordRequest): Promise<void> {
    await http.patch(`/users/${id}/password`, data);
  },

  // Update own profile (for onboarding - completeProfile)
  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<User>> {
    const response = await http.patch<ApiResponse<User>>(
      "/users/me/profile",
      data,
    );
    return response.data;
  },
};
