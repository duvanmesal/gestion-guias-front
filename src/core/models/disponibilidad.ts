export interface DisponibilidadQueueItem {
  id: string
  atencionId: number
  guiaId: string
  guiaUserId: string
  nombres: string
  apellidos: string
  email: string
  marcadoAt: string
  penalizado: boolean
  posicion: number
}

export interface MiDisponibilidad {
  marcado: boolean
  posicion: number | null
  penalizado: boolean | null
  pendingPenalty: boolean
}
