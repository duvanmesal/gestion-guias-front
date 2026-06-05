import { http } from "./http"
import type { ApiResponse, MetaPage } from "@/core/models/api"
import type {
  CreatePuertoRequest,
  Puerto,
  PuertosQueryParams,
  UpdatePuertoRequest,
} from "@/core/models/catalog"

function cleanParams<T extends object>(params?: T): Partial<T> | undefined {
  if (!params) return undefined
  const p = { ...params } as Record<string, unknown>
  if (typeof p.q === "string" && p.q.trim().length === 0) delete p.q
  for (const [key, value] of Object.entries(p)) {
    if (value === undefined || value === "") delete p[key]
  }
  return p as Partial<T>
}

export const puertosApi = {
  async getPuertos(params?: PuertosQueryParams): Promise<ApiResponse<Puerto[]> & { meta: MetaPage }> {
    const response = await http.get<ApiResponse<Puerto[]> & { meta: MetaPage }>("/puertos", {
      params: cleanParams(params),
    })
    return response.data
  },

  async lookup(): Promise<ApiResponse<Puerto[]>> {
    const response = await http.get<ApiResponse<Puerto[]>>("/puertos/lookup")
    return response.data
  },

  async createPuerto(data: CreatePuertoRequest): Promise<ApiResponse<Puerto>> {
    const response = await http.post<ApiResponse<Puerto>>("/puertos", data)
    return response.data
  },

  async updatePuerto(id: string, data: UpdatePuertoRequest): Promise<ApiResponse<Puerto>> {
    const response = await http.patch<ApiResponse<Puerto>>(`/puertos/${id}`, data)
    return response.data
  },

  async deletePuerto(id: string): Promise<void> {
    await http.delete(`/puertos/${id}`)
  },
}
