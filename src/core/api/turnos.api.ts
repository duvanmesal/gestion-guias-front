// src/core/api/turnos.api.ts
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
  // List turnos with filters and pagination (supervisor/admin)
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

  // ✅ List my turnos (guia)
  async getMyTurnos(
    params?: TurnosQueryParams,
  ): Promise<ApiResponse<TurnoListItem[]> & { meta: MetaPage }> {
    const response = await http.get<
      ApiResponse<TurnoListItem[]> & { meta: MetaPage }
    >("/turnos/me", {
      params: cleanParams(params),
    });
    return response.data;
  },

  // ✅ Get my next turno (guia)
  async getMyNextTurno(): Promise<ApiResponse<Turno | TurnoListItem | null>> {
    const response = await http.get<ApiResponse<Turno | TurnoListItem | null>>(
      "/turnos/me/next",
    );
    return response.data;
  },

  // ✅ Get my active turno (guia)
  async getMyActiveTurno(): Promise<ApiResponse<Turno | TurnoListItem | null>> {
    const response = await http.get<ApiResponse<Turno | TurnoListItem | null>>(
      "/turnos/me/active",
    );
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

  // Cancel turno (supervisor mode)
  async cancelTurno(
    id: number,
    data?: { reason?: string },
  ): Promise<ApiResponse<Turno>> {
    const response = await http.patch<ApiResponse<Turno>>(
      `/turnos/${id}/cancel`,
      data,
    );
    return response.data;
  },

  // Claim turno (guia mode) - guia claims an available turno
  // por defecto POST (más típico para "acciones")
  async claimTurno(id: number): Promise<ApiResponse<Turno>> {
    const response = await http.post<ApiResponse<Turno>>(
      `/turnos/${id}/claim`,
    );
    return response.data;
  },

};
