import { http } from "./http"
import type { ApiResponse, MetaPage } from "@/core/models/api"
import type {
  CreateMuelleRequest,
  Muelle,
  MuellesQueryParams,
  UpdateMuelleRequest,
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

export const muellesApi = {
  async getMuelles(params?: MuellesQueryParams): Promise<ApiResponse<Muelle[]> & { meta: MetaPage }> {
    const response = await http.get<ApiResponse<Muelle[]> & { meta: MetaPage }>("/muelles", {
      params: cleanParams(params),
    })
    return response.data
  },

  async lookup(puertoId?: string): Promise<ApiResponse<Muelle[]>> {
    const response = await http.get<ApiResponse<Muelle[]>>("/muelles/lookup", {
      params: cleanParams({ puertoId }),
    })
    return response.data
  },

  async createMuelle(data: CreateMuelleRequest): Promise<ApiResponse<Muelle>> {
    const response = await http.post<ApiResponse<Muelle>>("/muelles", data)
    return response.data
  },

  async updateMuelle(id: string, data: UpdateMuelleRequest): Promise<ApiResponse<Muelle>> {
    const response = await http.patch<ApiResponse<Muelle>>(`/muelles/${id}`, data)
    return response.data
  },

  async deleteMuelle(id: string): Promise<void> {
    await http.delete(`/muelles/${id}`)
  },
}
