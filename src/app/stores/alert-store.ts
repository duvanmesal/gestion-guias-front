import { create } from "zustand"

/**
 * Bandeja de alertas operativas en memoria (sesión).
 *
 * Recoge los eventos realtime `notif:*` recibidos durante la sesión para que el
 * usuario pueda revisarlos desde el Topbar aunque el toast ya se haya cerrado o
 * silenciado por cooldown. No se persiste entre recargas a propósito: el
 * dashboard sigue siendo la fuente de verdad de las alertas agregadas.
 */

export type OperationalAlertSeverity = "info" | "success" | "warning"

export interface OperationalAlert {
  /** Id interno único de la entrada en la bandeja. */
  id: string
  /** Id estable de la notificación de origen (clave de deduplicación). */
  notificationId: string
  type: string
  severity: OperationalAlertSeverity
  title: string
  body: string
  /** Ruta normalizada hacia el contexto de la alerta (puede no existir). */
  route?: string | null
  receivedAt: number
  lastReceivedAt: number
  /** Veces que llegó esta misma notificación durante la sesión. */
  count: number
  read: boolean
}

const MAX_ALERTS = 50

export interface PushAlertInput {
  notificationId: string
  type: string
  severity: OperationalAlertSeverity
  title: string
  body: string
  route?: string | null
}

interface AlertStoreState {
  alerts: OperationalAlert[]
  pushAlert: (input: PushAlertInput) => void
  markRead: (id: string) => void
  markAllRead: () => void
  remove: (id: string) => void
  clear: () => void
}

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export const useAlertStore = create<AlertStoreState>((set) => ({
  alerts: [],

  pushAlert: (input) =>
    set((state) => {
      const now = Date.now()
      const existing = state.alerts.find(
        (a) => a.notificationId === input.notificationId,
      )

      if (existing) {
        // Misma notificación: actualizar contador y subirla al tope sin leer.
        const updated: OperationalAlert = {
          ...existing,
          severity: input.severity,
          title: input.title,
          body: input.body,
          route: input.route ?? existing.route,
          lastReceivedAt: now,
          count: existing.count + 1,
          read: false,
        }
        const rest = state.alerts.filter((a) => a.id !== existing.id)
        return { alerts: [updated, ...rest].slice(0, MAX_ALERTS) }
      }

      const alert: OperationalAlert = {
        id: makeId(),
        notificationId: input.notificationId,
        type: input.type,
        severity: input.severity,
        title: input.title,
        body: input.body,
        route: input.route ?? null,
        receivedAt: now,
        lastReceivedAt: now,
        count: 1,
        read: false,
      }
      return { alerts: [alert, ...state.alerts].slice(0, MAX_ALERTS) }
    }),

  markRead: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, read: true } : a)),
    })),

  markAllRead: () =>
    set((state) => ({
      alerts: state.alerts.map((a) => ({ ...a, read: true })),
    })),

  remove: (id) =>
    set((state) => ({ alerts: state.alerts.filter((a) => a.id !== id) })),

  clear: () => set({ alerts: [] }),
}))

/** Hook derivado: número de alertas sin leer. */
export function useUnreadAlertCount(): number {
  return useAlertStore((s) => s.alerts.reduce((n, a) => (a.read ? n : n + 1), 0))
}
