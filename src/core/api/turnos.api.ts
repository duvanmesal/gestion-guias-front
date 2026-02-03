import { http } from "./http";
import type { ApiResponse, MetaPage } from "@/core/models/api";
import type {
  Turno,
  TurnoListItem,
  TurnosQueryParams,
  AssignTurnoRequest,
  UnassignTurnoRequest,
  NoShowTurnoRequest,
} from "@/core/models/turnos";

function cleanParams<T extends object>(params?: T): T | undefined {
  if (!params) return undefined;
  return params;
}

export const turnosApi = {
  // List turnos with filters and pagination
  async getTurnos(
    params?: TurnosQueryParams,
  ): Promise<ApiResponse<TurnoListItem[]> & { meta: MetaPage }> {
    const response = await http.get<
      ApiResponse<TurnoListItem[]> & { meta: MetaPage }
    >("/turnos", {
      params: cleanParams(params),
    });
    return response.data;
  },

  // Get turno by ID
  async getTurno(id: number): Promise<ApiResponse<Turno>> {
    const response = await http.get<ApiResponse<Turno>>(`/turnos/${id}`);
    return response.data;
  },

  // Assign turno to guia (supervisor mode)
  async assignTurno(
    id: number,
    data: AssignTurnoRequest,
  ): Promise<ApiResponse<Turno>> {
    const response = await http.patch<ApiResponse<Turno>>(
      `/turnos/${id}/assign`,
      data,
    );
    return response.data;
  },

  // Unassign turno (supervisor mode)
  async unassignTurno(
    id: number,
    data?: UnassignTurnoRequest,
  ): Promise<ApiResponse<Turno>> {
    const response = await http.patch<ApiResponse<Turno>>(
      `/turnos/${id}/unassign`,
      data,
    );
    return response.data;
  },

  // Check-in turno (guia mode)
  async checkInTurno(id: number): Promise<ApiResponse<Turno>> {
    const response = await http.patch<ApiResponse<Turno>>(
      `/turnos/${id}/check-in`,
    );
    return response.data;
  },

  // Check-out turno (guia mode)
  async checkOutTurno(id: number): Promise<ApiResponse<Turno>> {
    const response = await http.patch<ApiResponse<Turno>>(
      `/turnos/${id}/check-out`,
    );
    return response.data;
  },

  // Mark turno as no-show (supervisor mode)
  async noShowTurno(
    id: number,
    data?: NoShowTurnoRequest,
  ): Promise<ApiResponse<Turno>> {
    const response = await http.patch<ApiResponse<Turno>>(
      `/turnos/${id}/no-show`,
      data,
    );
    return response.data;
  },
};
