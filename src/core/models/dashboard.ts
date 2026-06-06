export type DashboardRole = "SUPER_ADMIN" | "SUPERVISOR" | "GUIA"

export type DashboardMilestoneKind =
  | "RECALADA_ARRIVAL"
  | "RECALADA_DEPARTURE"
  | "ATENCION_START"
  | "ATENCION_END"

export interface DashboardMilestone {
  kind: DashboardMilestoneKind
  at: string
  title: string
  ref: { recaladaId?: number; atencionId?: number; turnoId?: number }
}

export interface SupervisorAlert {
  code: string
  label: string
  count: number
}

export interface SupervisorCounts {
  recaladas: number
  atenciones: number
  turnos: number
  turnosAssigned?: number
  turnosAvailable?: number
  turnosInProgress?: number
  turnosDone?: number
  turnosCanceled?: number
  turnosNoShow?: number
  overdueRecaladas?: number
}

export interface SupervisorGuides {
  activos: number
  asignados: number
  libres: number
  disponibles?: number
  noDisponibles?: number
  penalizados?: number
}

export interface SupervisorRates {
  assignmentRate: number
  executionRate: number
  noShowRate: number
  guideAvailabilityRate: number
}

export interface SupervisorPendingWork {
  pendingCheckIns: number
  overdueRecaladas: number
  unresolvedTurnos: number
}

export interface TrendDay {
  date: string
  atenciones: number
  turnos: number
  completed: number
  noShows: number
}

export interface SupervisorOverview {
  counts: SupervisorCounts
  guides?: SupervisorGuides
  turnosBreakdown?: Record<string, number>
  alerts?: SupervisorAlert[]
  upcoming: DashboardMilestone[]
  pendingWork?: SupervisorPendingWork
  rates?: SupervisorRates
  trend7d?: { days: TrendDay[] }
}

export interface GuiaTurnoLite {
  id: number
  numero: number
  status: string
  checkInAt: string | null
  checkOutAt: string | null
  atencion: {
    id: number
    fechaInicio: string
    fechaFin: string
    recalada: {
      id: number
      codigoRecalada: string
      fechaLlegada: string
      fechaSalida: string | null
      operationalStatus: string
      buque: { nombre: string }
    }
  }
}

export interface GuiaDisponibilidad {
  guiaId: string | null
  disponibleParaTurnos: boolean
  disponibilidadUpdatedAt: string | null
  pendingPenalty: boolean
}

export interface AtencionDisponibleLite {
  id: number
  fechaInicio: string
  fechaFin: string
  operationalStatus: string
  recalada: {
    id: number
    codigoRecalada: string
    fechaLlegada: string
    fechaSalida: string | null
    operationalStatus: string
    buque: { nombre: string }
  }
  availableTurnos: number
}

export interface GuiaOverview {
  assignmentMode: string
  disponibilidad: GuiaDisponibilidad
  nextTurno: GuiaTurnoLite | null
  activeTurno: GuiaTurnoLite | null
  atencionesDisponibles: AtencionDisponibleLite[]
}

export interface DashboardOverview {
  role: DashboardRole
  turnoAssignmentMode: string
  date: string
  tzOffsetMinutes: number
  generatedAt: string
  serverTime: string
  dateContext: { date: string; timezoneHint: string }
  widgets: unknown[]
  supervisor?: SupervisorOverview
  guia?: GuiaOverview
}

export interface DashboardOverviewParams {
  date?: string
  tzOffsetMinutes?: number
  upcomingLimit?: number
  availableAtencionesLimit?: number
}
