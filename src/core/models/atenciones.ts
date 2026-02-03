import type { StatusType } from "./catalog"
import type { SupervisorMini, RecaladaListItem } from "./recaladas"
import type { TurnoListItem } from "./turnos"

// Atencion Operative Status
export type AtencionOperativeStatus = "OPEN" | "CLOSED" | "CANCELED"

// Atencion Entity
export interface Atencion {
  id: number
  recaladaId: number
  recalada?: {
    id: number
    codigoRecalada: string
    buque: {
      id: number
      nombre: string
    }
  } | null
  supervisorId: string
  supervisor?: SupervisorMini | null
  fechaInicio: string
  fechaFin: string
  turnosTotal: number
  descripcion?: string | null
  status: StatusType
  operationalStatus: AtencionOperativeStatus
  canceledAt?: string | null
  cancelReason?: string | null
  canceledById?: string | null
  createdById: string
  turnos?: TurnoListItem[]
  createdAt: string
  updatedAt: string
}

// Atencion List Item (lighter for lists)
export interface AtencionListItem {
  id: number
  recaladaId: number
  supervisorId: string
  fechaInicio: string
  fechaFin: string
  turnosTotal: number
  descripcion?: string | null
  status: StatusType
  operationalStatus: AtencionOperativeStatus
  canceledAt?: string | null
  cancelReason?: string | null
  createdAt: string
  updatedAt: string
}

// Query Params for listing atenciones
export interface AtencionesQueryParams {
  page?: number
  pageSize?: number
  from?: string
  to?: string
  recaladaId?: number
  supervisorId?: string
  status?: StatusType
  operationalStatus?: AtencionOperativeStatus
}

// Create Atencion Request
export interface CreateAtencionRequest {
  recaladaId: number
  fechaInicio: string
  fechaFin: string
  turnosTotal: number
  descripcion?: string | null
}

// Update Atencion Request
export interface UpdateAtencionRequest {
  fechaInicio?: string
  fechaFin?: string
  turnosTotal?: number
  descripcion?: string | null
}

// Cancel Atencion Request
export interface CancelAtencionRequest {
  reason: string
}

// Atencion Summary (for turnero dashboard)
export interface AtencionSummary {
  turnosTotal: number
  counts: {
    available: number
    assigned: number
    inProgress: number
    completed: number
    noShow: number
    canceled: number
  }
}
