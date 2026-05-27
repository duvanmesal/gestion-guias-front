// Turno Status
export type TurnoStatus = "AVAILABLE" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELED" | "NO_SHOW"

// Guia Mini (for relations)
export interface GuiaMini {
  id: string
  usuario: {
    id: string
    email: string
    nombres?: string | null
    apellidos?: string | null
  }
}

// Turno Entity
export interface Turno {
  id: number
  atencionId: number
  atencion?: {
    id: number
    recaladaId: number
    fechaInicio: string
    fechaFin: string
    recalada?: {
      id: number
      codigoRecalada: string
      buque: {
        id: number
        nombre: string
      }
    }
  } | null
  guiaId?: string | null
  guia?: GuiaMini | null
  numero: number
  fechaInicio: string
  fechaFin: string
  status: TurnoStatus
  checkInAt?: string | null
  checkOutAt?: string | null
  checkInRequestedAt?: string | null
  checkInConfirmedAt?: string | null
  checkInConfirmedById?: string | null
  checkInRejectedAt?: string | null
  checkInRejectedById?: string | null
  checkInRejectReason?: string | null
  canceledAt?: string | null
  createdById: string
  createdAt: string
  updatedAt: string
}

// Turno List Item (lighter for lists)
export interface TurnoListItem {
  id: number
  numero: number
  status: TurnoStatus
  guiaId?: string | null
  guia?: GuiaMini | null
  checkInAt?: string | null
  checkOutAt?: string | null
  checkInRequestedAt?: string | null
  checkInConfirmedAt?: string | null
  checkInRejectedAt?: string | null
  checkInRejectReason?: string | null
}

export type TurnoDateField = "overlap" | "createdAt" | "checkInAt" | "checkOutAt" | "canceledAt"

// Query Params for listing turnos
export interface TurnosQueryParams {
  page?: number
  pageSize?: number
  atencionId?: number
  recaladaId?: number
  buqueId?: number
  guiaId?: string
  status?: TurnoStatus
  dateFrom?: string
  dateTo?: string
  dateField?: TurnoDateField
}

// Assign Turno Request
export interface AssignTurnoRequest {
  guiaId: string
}

// Unassign Turno Request
export interface UnassignTurnoRequest {
  reason?: string
}

// No Show Request
export interface NoShowTurnoRequest {
  reason?: string
}

// Reject check-in request (Epica 5)
export interface RejectCheckInRequest {
  reason: string
}

// Query for pending check-ins
export interface PendingCheckInsQueryParams {
  atencionId?: number
  recaladaId?: number
  page?: number
  pageSize?: number
}

// Turno Stats (for dashboard/summaries)
export interface TurnoStats {
  total: number
  available: number
  assigned: number
  inProgress: number
  completed: number
  canceled: number
  noShow: number
}
