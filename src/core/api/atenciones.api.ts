import { http } from "./http";
import type { ApiResponse, MetaPage } from "@/core/models/api";
import type {
  Atencion,
  AtencionListItem,
  AtencionesQueryParams,
  AtencionSummary,
  CreateAtencionRequest,
  UpdateAtencionRequest,
  CancelAtencionRequest,
} from "@/core/models/atenciones";
import type { Turno } from "@/core/models/turnos";

type AnyParams = Record<string, unknown>;

function cleanParams<T extends object>(params?: T): Partial<T> | undefined {
  if (!params) return undefined;

  const p = { ...(params as AnyParams) };

  for (const [k, v] of Object.entries(p)) {
    if (v === undefined) delete p[k];
  }

  return p as Partial<T>;
}

export const atencionesApi = {
  // List atenciones with filters and pagination
  async getAtenciones(
    params?: AtencionesQueryParams,
  ): Promise<ApiResponse<AtencionListItem[]> & { meta: MetaPage }> {
    const response = await http.get<
      ApiResponse<AtencionListItem[]> & { meta: MetaPage }
    >("/atenciones", {
      params: cleanParams(params),
    });
    return response.data;
  },

// Get atencion by ID
  async getAtencion(id: number): Promise<ApiResponse<Atencion>> {
    const response = await http.get<ApiResponse<Atencion>>(`/atenciones/${id}`);
    return response.data;
  },

  // Get atencion summary (turnero stats)
  async getSummary(id: number): Promise<ApiResponse<AtencionSummary>> {
    const response = await http.get<ApiResponse<AtencionSummary>>(
      `/atenciones/${id}/summary`
    );
    return response.data;
  },

  // Create new atencion
  async createAtencion(
    data: CreateAtencionRequest,
  ): Promise<ApiResponse<Atencion>> {
    const response = await http.post<ApiResponse<Atencion>>(
      "/atenciones",
      data,
    );
    return response.data;
  },

// Update atencion
  async updateAtencion(
    id: number,
    data: UpdateAtencionRequest,
  ): Promise<ApiResponse<Atencion>> {
    const response = await http.patch<ApiResponse<Atencion>>(
      `/atenciones/${id}`,
      data,
    );
    return response.data;
  },

  // NOTE: DELETE /atenciones/:id removed - backend does not support it
  // Use cancelAtencion or closeAtencion instead

  // Close atencion
  async closeAtencion(id: number): Promise<ApiResponse<Atencion>> {
    const response = await http.patch<ApiResponse<Atencion>>(
      `/atenciones/${id}/close`,
    );
    return response.data;
  },

  // Cancel atencion
  async cancelAtencion(
    id: number,
    data: CancelAtencionRequest,
  ): Promise<ApiResponse<Atencion>> {
    const response = await http.patch<ApiResponse<Atencion>>(
      `/atenciones/${id}/cancel`,
      data,
    );
    return response.data;
  },

  // Get turnos for an atencion
  async getAtencionTurnos(id: number): Promise<ApiResponse<Turno[]>> {
    const response = await http.get<ApiResponse<Turno[]>>(
      `/atenciones/${id}/turnos`,
    );
    return response.data;
  },

  // Claim turno (for guias)
  async claimTurno(atencionId: number): Promise<ApiResponse<Turno>> {
    const response = await http.post<ApiResponse<Turno>>(
      `/atenciones/${atencionId}/claim`,
    );
    return response.data;
  },
};
