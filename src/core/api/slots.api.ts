import { http } from "./http"
import type { ApiResponse } from "@/core/models/api"

export interface SlotOperativo {
  id: number
  numero: number
  status: "ACTIVO" | "INACTIVO" | "SUSPENDIDO"
  motivoInactividad?: string | null
  createdAt: string
  updatedAt: string
}

export interface ToggleSlotRequest {
  status: "ACTIVO" | "INACTIVO" | "SUSPENDIDO"
  motivoInactividad?: string | null
}

export const slotsApi = {
  async getSlots(): Promise<ApiResponse<SlotOperativo[]>> {
    const response = await http.get<ApiResponse<SlotOperativo[]>>("/slots")
    return response.data
  },

  async toggleSlot(id: number, data: ToggleSlotRequest): Promise<ApiResponse<SlotOperativo>> {
    const response = await http.patch<ApiResponse<SlotOperativo>>(`/slots/${id}`, data)
    return response.data
  },
}
