import { http } from "./http"
import type { ApiResponse, MetaPage } from "@/core/models/api"
import type { Buque, BuquesQueryParams, CreateBuqueRequest, UpdateBuqueRequest } from "@/core/models/catalog"

function cleanParams<T extends Record<string, unknown>>(params?: T): T | undefined {
  if (!params) return undefined
  const p = { ...params } as Record<string, unknown>
  if (typeof p.q === "string" && p.q.trim().length === 0) delete p.q
  return p as T
}

export const buquesApi = {
  async getBuques(params?: BuquesQueryParams): Promise<ApiResponse<Buque[]> & { meta: MetaPage }> {
    const response = await http.get<ApiResponse<Buque[]> & { meta: MetaPage }>("/buques", {
      params: cleanParams(params),
    })
    return response.data
  },

  async lookup(): Promise<ApiResponse<Buque[]>> {
    const response = await http.get<ApiResponse<Buque[]>>("/buques/lookup")
    return response.data
  },

  async getBuque(id: string): Promise<ApiResponse<Buque>> {
    const response = await http.get<ApiResponse<Buque>>(`/buques/${id}`)
    return response.data
  },

  async createBuque(data: CreateBuqueRequest): Promise<ApiResponse<Buque>> {
    const response = await http.post<ApiResponse<Buque>>("/buques", data)
    return response.data
  },

  async updateBuque(id: string, data: UpdateBuqueRequest): Promise<ApiResponse<Buque>> {
    const response = await http.patch<ApiResponse<Buque>>(`/buques/${id}`, data)
    return response.data
  },

  async deleteBuque(id: string): Promise<void> {
    await http.delete(`/buques/${id}`)
  },
}
