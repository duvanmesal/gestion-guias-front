import type { StatusType, Buque, PaisMini } from "./catalog"

// Recalada Operative Status
export type RecaladaOperativeStatus = "SCHEDULED" | "ARRIVED" | "DEPARTED" | "CANCELED"

// Recalada Source
export type RecaladaSource = "MANUAL" | "IMPORT" | "API"

// Supervisor Mini (for relations)
export interface SupervisorMini {
  id: string
  usuario: {
    id: string
    email: string
    nombres?: string | null
    apellidos?: string | null
  }
}

// Recalada Entity
export interface Recalada {
  id: number
  codigoRecalada: string
  buqueId: number
  buque?: Buque | null
  paisOrigenId: number
  paisOrigen?: PaisMini | null
  supervisorId?: string | null
  supervisor?: SupervisorMini | null
  fechaLlegada: string
  fechaSalida?: string | null
  arrivedAt?: string | null
  departedAt?: string | null
  terminal?: string | null
  muelle?: string | null
  pasajerosEstimados?: number | null
  tripulacionEstimada?: number | null
  observaciones?: string | null
  fuente: RecaladaSource
  status: StatusType
  operationalStatus: RecaladaOperativeStatus
  canceledAt?: string | null
  cancelReason?: string | null
  createdAt: string
  updatedAt: string
}

// Recalada List Item (lighter for lists)
export interface RecaladaListItem {
  id: number
  codigoRecalada: string
  fechaLlegada: string
  fechaSalida?: string | null
  status: StatusType
  operationalStatus: RecaladaOperativeStatus
  terminal?: string | null
  muelle?: string | null
  observaciones?: string | null
  buque: {
    id: number
    nombre: string
  }
  paisOrigen: {
    id: number
    codigo: string
    nombre: string
  }
}

// Query Params for listing recaladas
export interface RecaladasQueryParams {
  page?: number
  pageSize?: number
  q?: string
  from?: string
  to?: string
  operationalStatus?: RecaladaOperativeStatus
  buqueId?: number
  paisOrigenId?: number
  status?: StatusType
}

// Create Recalada Request
export interface CreateRecaladaRequest {
  buqueId: number
  paisOrigenId: number
  fechaLlegada: string
  fechaSalida?: string | null
  terminal?: string | null
  muelle?: string | null
  pasajerosEstimados?: number | null
  tripulacionEstimada?: number | null
  observaciones?: string | null
  fuente?: RecaladaSource
}

// Update Recalada Request
export interface UpdateRecaladaRequest {
  buqueId?: number
  paisOrigenId?: number
  fechaLlegada?: string
  fechaSalida?: string | null
  terminal?: string | null
  muelle?: string | null
  pasajerosEstimados?: number | null
  tripulacionEstimada?: number | null
  observaciones?: string | null
  fuente?: RecaladaSource
}

// Cancel Recalada Request
export interface CancelRecaladaRequest {
  reason: string
}
