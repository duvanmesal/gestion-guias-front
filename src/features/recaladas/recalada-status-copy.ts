import type { RecaladaOperativeStatus } from "@/core/models/recaladas"

export const RECALADA_STATUS_COPY: Record<
  RecaladaOperativeStatus,
  { singular: string; plural: string }
> = {
  SCHEDULED: { singular: "Programada", plural: "Programadas" },
  ARRIVED: { singular: "Llegada", plural: "Llegadas" },
  DEPARTED: { singular: "Zarpada", plural: "Zarpadas" },
  CANCELED: { singular: "Cancelada", plural: "Canceladas" },
}
