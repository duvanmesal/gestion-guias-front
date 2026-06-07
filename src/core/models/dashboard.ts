export type DashboardRole = "SUPER_ADMIN" | "SUPERVISOR" | "GUIA"

// ─── Analytics types ──────────────────────────────────────────────────────────

export interface WorkloadTrendDay {
  date: string
  atenciones: number
  turnos: number
  completed: number
  noShows: number
  canceled: number
  checkInsConfirmed: number
}

export interface CheckInFlowStats {
  solicitados: number
  pendientes: number
  confirmados: number
  rechazados: number
  avgResponseTimeMin: number | null
  pendientesAntiguos: number
}

export interface GuideCapacityStats {
  activos: number
  disponibles: number
  asignados: number
  libres: number
  noDisponibles: number
  penalizados: number
  disponibilidadRate: number
  utilizacionRate: number
  penalizacionRate: number
}

export interface EvaluationStats {
  atencionesEnRango: number
  evaluadas: number
  pendientesEval: number
  avgCalificacion: number | null
  distribucion: { SATISFACTORIA: number; CON_NOVEDADES: number; NO_SATISFACTORIA: number }
}

export interface PriorityAction {
  type: "OVERDUE_RECALADAS" | "UNASSIGNED_TURNOS" | "PENDING_CHECKINS" | "OLD_PENDING_CHECKINS" | "PENDING_EVALS"
  count: number
  label: string
  to: string
}

export interface SupervisorAnalytics {
  range: { startDate: string; endDate: string; days: number; tz: string }
  kpis: {
    assignmentRate: number
    executionRate: number
    noShowRate: number
    guideAvailabilityRate: number
    utilizacionRate: number
    penalizacionRate: number
    pendingCheckIns: number
    overdueRecaladas: number
    unresolvedTurnos: number
    pendientesEval: number
  }
  workloadTrend: WorkloadTrendDay[]
  turnoStatus: Record<string, number>
  checkInFlow: CheckInFlowStats
  guideCapacity: GuideCapacityStats
  evaluations: EvaluationStats
  priorityActions: PriorityAction[]
}

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
  analytics?: SupervisorAnalytics
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
  rangeDays?: 7 | 30
}
