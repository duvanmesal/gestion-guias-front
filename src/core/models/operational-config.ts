import type { TurnoAssignmentMode } from "./auth"

export interface OperationalConfig {
  id: string
  turnoAssignmentMode: TurnoAssignmentMode
  updatedById?: string | null
  createdAt: string
  updatedAt: string
}

export interface UpdateTurnoAssignmentModeRequest {
  mode: TurnoAssignmentMode
}
