// src/core/models/recaladas.ts
import type { StatusType, Buque, Muelle, PaisMini, Puerto } from "./catalog"

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
  id: string
  codigoRecalada: string

  buqueId: string
  buque?: Buque | null

  paisOrigenId: string
  paisOrigen?: PaisMini | null

  puertoId?: string | null
  puerto?: Puerto | null
  muelleId?: string | null
  muelleCatalogo?: Muelle | null

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
  id: string
  codigoRecalada: string
  fechaLlegada: string
  fechaSalida?: string | null
  status: StatusType
  operationalStatus: RecaladaOperativeStatus
  terminal?: string | null
  muelle?: string | null
  puertoId?: string | null
  puerto?: Pick<Puerto, "id" | "codigo" | "nombre" | "ciudad"> | null
  muelleId?: string | null
  muelleCatalogo?: Pick<Muelle, "id" | "codigo" | "nombre" | "capacidadCruceros"> | null
  observaciones?: string | null
  buque: {
    id: string
    nombre: string
  }
  paisOrigen: {
    id: string
    codigo: string
    nombre?: string
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
  buqueId?: string | number
  paisOrigenId?: string | number
  puertoId?: string | number
  muelleId?: string | number
  status?: StatusType
  // Filtro operativo: recaladas ARRIVED cuyo zarpe programado ya venció.
  overdueDeparture?: boolean
}

// Create Recalada Request
export interface CreateRecaladaRequest {
  buqueId: string
  paisOrigenId: string
  puertoId?: string
  muelleId?: string
  fechaLlegada: string
  fechaSalida?: string
  terminal?: string
  muelle?: string
  pasajerosEstimados?: number
  tripulacionEstimada?: number
  observaciones?: string
  fuente?: RecaladaSource
}

// Update Recalada Request
export interface UpdateRecaladaRequest {
  buqueId?: string
  paisOrigenId?: string
  puertoId?: string | null
  muelleId?: string | null
  fechaLlegada?: string
  fechaSalida?: string
  terminal?: string
  muelle?: string
  pasajerosEstimados?: number
  tripulacionEstimada?: number
  observaciones?: string
  fuente?: RecaladaSource
}

// Cancel Recalada Request
export interface CancelRecaladaRequest {
  reason: string
}
