import { http } from "./http";
import type { ApiResponse, MetaPage } from "@/core/models/api";
import type {
  Recalada,
  RecaladaListItem,
  RecaladasQueryParams,
  CreateRecaladaRequest,
  UpdateRecaladaRequest,
  CancelRecaladaRequest,
} from "@/core/models/recaladas";

type AnyParams = Record<string, unknown>;

function cleanParams<T extends object>(params?: T): Partial<T> | undefined {
  if (!params) return undefined;

  const p = { ...(params as AnyParams) };

  // q vacío no se envía
  if (typeof p.q === "string" && p.q.trim().length === 0) {
    delete p.q;
  }

  // undefined no se envía
  for (const [k, v] of Object.entries(p)) {
    if (v === undefined) delete p[k];
  }

  return p as Partial<T>;
}

export const recaladasApi = {
  // List recaladas with filters and pagination
  async getRecaladas(
    params?: RecaladasQueryParams,
  ): Promise<ApiResponse<RecaladaListItem[]> & { meta: MetaPage }> {
    const response = await http.get<
      ApiResponse<RecaladaListItem[]> & { meta: MetaPage }
    >("/recaladas", {
      params: cleanParams(params),
    });
    return response.data;
  },

  // Get recalada by ID
  async getRecalada(id: number): Promise<ApiResponse<Recalada>> {
    const response = await http.get<ApiResponse<Recalada>>(`/recaladas/${id}`);
    return response.data;
  },

  // Create new recalada
  async createRecalada(
    data: CreateRecaladaRequest,
  ): Promise<ApiResponse<Recalada>> {
    const response = await http.post<ApiResponse<Recalada>>("/recaladas", data);
    return response.data;
  },

  // Update recalada
  async updateRecalada(
    id: number,
    data: UpdateRecaladaRequest,
  ): Promise<ApiResponse<Recalada>> {
    const response = await http.patch<ApiResponse<Recalada>>(
      `/recaladas/${id}`,
      data,
    );
    return response.data;
  },

  // Delete recalada (safe delete)
  async deleteRecalada(id: number): Promise<void> {
    await http.delete(`/recaladas/${id}`);
  },

  // Arrive recalada
  async arriveRecalada(id: number): Promise<ApiResponse<Recalada>> {
    const response = await http.patch<ApiResponse<Recalada>>(
      `/recaladas/${id}/arrive`,
    );
    return response.data;
  },

  // Depart recalada
  async departRecalada(id: number): Promise<ApiResponse<Recalada>> {
    const response = await http.patch<ApiResponse<Recalada>>(
      `/recaladas/${id}/depart`,
    );
    return response.data;
  },

  // Cancel recalada
  async cancelRecalada(
    id: number,
    data: CancelRecaladaRequest,
  ): Promise<ApiResponse<Recalada>> {
    const response = await http.patch<ApiResponse<Recalada>>(
      `/recaladas/${id}/cancel`,
      data,
    );
    return response.data;
  },

  // Get atenciones for a recalada
  async getRecaladaAtenciones(id: number): Promise<ApiResponse<unknown[]>> {
    const response = await http.get<ApiResponse<unknown[]>>(
      `/recaladas/${id}/atenciones`,
    );
    return response.data;
  },
};
