import { http } from "./http"
import type { ApiResponse } from "@/core/models/api"
import type { DisponibilidadQueueItem, MiDisponibilidad } from "@/core/models/disponibilidad"

export const disponibilidadApi = {
  async getMe(atencionId: number): Promise<ApiResponse<MiDisponibilidad>> {
    const res = await http.get<ApiResponse<MiDisponibilidad>>(
      `/atenciones/${atencionId}/disponibilidad/me`,
    )
    return res.data
  },

  async getQueue(atencionId: number): Promise<ApiResponse<DisponibilidadQueueItem[]>> {
    const res = await http.get<ApiResponse<DisponibilidadQueueItem[]>>(
      `/atenciones/${atencionId}/disponibilidad`,
    )
    return res.data
  },

  async marcar(atencionId: number): Promise<ApiResponse<{ id: string; posicion: number }>> {
    const res = await http.post<ApiResponse<{ id: string; posicion: number }>>(
      `/atenciones/${atencionId}/disponibilidad`,
    )
    return res.data
  },

  async desmarcar(atencionId: number): Promise<ApiResponse<null>> {
    const res = await http.delete<ApiResponse<null>>(
      `/atenciones/${atencionId}/disponibilidad`,
    )
    return res.data
  },
}
