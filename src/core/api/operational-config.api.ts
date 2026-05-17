import { http } from "./http"
import type { ApiResponse } from "@/core/models/api"
import type {
  OperationalConfig,
  UpdateTurnoAssignmentModeRequest,
} from "@/core/models/operational-config"

export const operationalConfigApi = {
  async get(): Promise<ApiResponse<OperationalConfig>> {
    const response = await http.get<ApiResponse<OperationalConfig>>("/operational-config")
    return response.data
  },

  async updateTurnoAssignmentMode(
    data: UpdateTurnoAssignmentModeRequest,
  ): Promise<ApiResponse<OperationalConfig>> {
    const response = await http.patch<ApiResponse<OperationalConfig>>(
      "/operational-config/turnos-assignment-mode",
      data,
    )
    return response.data
  },
}
