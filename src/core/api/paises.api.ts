import { http } from "./http";
import type { ApiResponse, MetaPage } from "@/core/models/api";
import type { PaisMini } from "@/core/models/catalog";
import type {
  Pais,
  PaisesQueryParams,
  CreatePaisRequest,
  UpdatePaisRequest,
} from "@/core/models/catalog";

function cleanParams<T extends object>(params?: T): T | undefined {
  if (!params) return undefined;

  const p = { ...(params as any) } as Record<string, unknown>;

  if (typeof p.q === "string" && p.q.trim().length === 0) delete p.q;

  return p as T;
}

export const paisesApi = {
  async getPaises(
    params?: PaisesQueryParams,
  ): Promise<ApiResponse<Pais[]> & { meta: MetaPage }> {
    const response = await http.get<ApiResponse<Pais[]> & { meta: MetaPage }>(
      "/paises",
      {
        params: cleanParams(params),
      },
    );
    return response.data;
  },

  async lookup(): Promise<ApiResponse<PaisMini[]>> {
    const response = await http.get<ApiResponse<PaisMini[]>>("/paises/lookup");
    return response.data;
  },

  async getPais(id: string): Promise<ApiResponse<Pais>> {
    const response = await http.get<ApiResponse<Pais>>(`/paises/${id}`);
    return response.data;
  },

  async createPais(data: CreatePaisRequest): Promise<ApiResponse<Pais>> {
    const response = await http.post<ApiResponse<Pais>>("/paises", data);
    return response.data;
  },

  async updatePais(
    id: string,
    data: UpdatePaisRequest,
  ): Promise<ApiResponse<Pais>> {
    const response = await http.patch<ApiResponse<Pais>>(`/paises/${id}`, data);
    return response.data;
  },

  async deletePais(id: string): Promise<void> {
    await http.delete(`/paises/${id}`);
  },
};
