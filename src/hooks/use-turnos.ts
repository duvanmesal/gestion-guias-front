// src/hooks/use-turnos.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { turnosApi } from "@/core/api"
import type {
  TurnosQueryParams,
  AssignTurnoRequest,
  UnassignTurnoRequest,
  NoShowTurnoRequest,
} from "@/core/models/turnos"

// ✅ Mimi: intentamos leer el rol desde tu auth si existe.
// Si en tu proyecto el path/nombre es distinto, cambia este import.
// Si NO existe, el try/catch evita romper el build.
let useAuth: any = null
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  useAuth = require("@/hooks/use-auth").useAuth
} catch {
  // no-op
}

type TurnosSourceMode = "auto" | "all" | "me"

type UseTurnosOptions = {
  /**
   * auto: decide por rol (GUIA -> /turnos/me, otros -> /turnos)
   * all: fuerza /turnos
   * me: fuerza /turnos/me
   */
  mode?: TurnosSourceMode
  /**
   * Si no quieres depender del auth hook o no existe, puedes pasar rol aquí.
   * Ej: "GUIA" | "SUPERVISOR" | "SUPER_ADMIN"
   */
  rolOverride?: string | null
}

function resolveIsGuia(options?: UseTurnosOptions): boolean {
  if (options?.rolOverride) return options.rolOverride === "GUIA"

  if (useAuth) {
    const auth = useAuth()
    const rol = auth?.user?.rol ?? auth?.me?.rol ?? auth?.session?.user?.rol
    return rol === "GUIA"
  }

  return false
}

function resolveMode(options?: UseTurnosOptions): TurnosSourceMode {
  return options?.mode ?? "auto"
}

export function useTurnos(params?: TurnosQueryParams, options?: UseTurnosOptions) {
  const queryClient = useQueryClient()

  const mode = resolveMode(options)
  const isGuia = resolveIsGuia(options)

  const shouldUseMe =
    mode === "me" ? true : mode === "all" ? false : /* auto */ isGuia

  const queryKey = shouldUseMe ? ["turnos-me", params] : ["turnos", params]

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: () => (shouldUseMe ? turnosApi.getMyTurnos(params) : turnosApi.getTurnos(params)),
    staleTime: 15_000,
  })

  const invalidateAllTurnosLists = () => {
    queryClient.invalidateQueries({ queryKey: ["turnos"] })
    queryClient.invalidateQueries({ queryKey: ["turnos-me"] })
    queryClient.invalidateQueries({ queryKey: ["turno"] })
    queryClient.invalidateQueries({ queryKey: ["atencion-turnos"] })
    // para dashboard guia
    queryClient.invalidateQueries({ queryKey: ["turnos-me-next"] })
    queryClient.invalidateQueries({ queryKey: ["turnos-me-active"] })
  }

  const assignMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AssignTurnoRequest }) =>
      turnosApi.assignTurno(id, data),
    onSuccess: invalidateAllTurnosLists,
  })

  const unassignMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data?: UnassignTurnoRequest }) =>
      turnosApi.unassignTurno(id, data),
    onSuccess: invalidateAllTurnosLists,
  })

  const checkInMutation = useMutation({
    mutationFn: (id: number) => turnosApi.checkInTurno(id),
    onSuccess: invalidateAllTurnosLists,
  })

  const checkOutMutation = useMutation({
    mutationFn: (id: number) => turnosApi.checkOutTurno(id),
    onSuccess: invalidateAllTurnosLists,
  })

  const noShowMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data?: NoShowTurnoRequest }) =>
      turnosApi.noShowTurno(id, data),
    onSuccess: invalidateAllTurnosLists,
  })

  const cancelMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data?: { reason?: string } }) =>
      turnosApi.cancelTurno(id, data),
    onSuccess: invalidateAllTurnosLists,
  })

  const claimMutation = useMutation({
    mutationFn: (id: number) => turnosApi.claimTurno(id),
    onSuccess: invalidateAllTurnosLists,
  })

  const meta = data?.meta
    ? {
        ...data.meta,
        totalPages: data.meta.totalPages ?? Math.max(1, Math.ceil(data.meta.total / data.meta.pageSize)),
      }
    : undefined

  return {
    // data
    turnos: data?.data ?? [],
    meta,
    isLoading,
    error,
    refetch,

    // helper
    source: shouldUseMe ? "me" : "all",

    // Assign
    assignTurno: assignMutation.mutate,
    assignTurnoAsync: assignMutation.mutateAsync,
    isAssigning: assignMutation.isPending,

    // Unassign
    unassignTurno: unassignMutation.mutate,
    unassignTurnoAsync: unassignMutation.mutateAsync,
    isUnassigning: unassignMutation.isPending,

    // Check-in
    checkInTurno: checkInMutation.mutate,
    checkInTurnoAsync: checkInMutation.mutateAsync,
    isCheckingIn: checkInMutation.isPending,

    // Check-out
    checkOutTurno: checkOutMutation.mutate,
    checkOutTurnoAsync: checkOutMutation.mutateAsync,
    isCheckingOut: checkOutMutation.isPending,

    // No-show
    noShowTurno: noShowMutation.mutate,
    noShowTurnoAsync: noShowMutation.mutateAsync,
    isMarkingNoShow: noShowMutation.isPending,

    // Cancel
    cancelTurno: cancelMutation.mutate,
    cancelTurnoAsync: cancelMutation.mutateAsync,
    isCanceling: cancelMutation.isPending,

    // Claim
    claimTurno: claimMutation.mutate,
    claimTurnoAsync: claimMutation.mutateAsync,
    isClaiming: claimMutation.isPending,
  }
}

export function useTurno(id: number | null) {
  const queryClient = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["turno", id],
    queryFn: () => (id ? turnosApi.getTurno(id) : Promise.resolve(null)),
    enabled: !!id,
    staleTime: 15_000,
  })

  const invalidateAllTurnosLists = () => {
    queryClient.invalidateQueries({ queryKey: ["turno", id] })
    queryClient.invalidateQueries({ queryKey: ["turnos"] })
    queryClient.invalidateQueries({ queryKey: ["turnos-me"] })
    queryClient.invalidateQueries({ queryKey: ["atencion-turnos"] })
    queryClient.invalidateQueries({ queryKey: ["turnos-me-next"] })
    queryClient.invalidateQueries({ queryKey: ["turnos-me-active"] })
  }

  const assignMutation = useMutation({
    mutationFn: (payload: AssignTurnoRequest) =>
      id ? turnosApi.assignTurno(id, payload) : Promise.reject("No ID"),
    onSuccess: invalidateAllTurnosLists,
  })

  const unassignMutation = useMutation({
    mutationFn: (payload?: UnassignTurnoRequest) =>
      id ? turnosApi.unassignTurno(id, payload) : Promise.reject("No ID"),
    onSuccess: invalidateAllTurnosLists,
  })

  const checkInMutation = useMutation({
    mutationFn: () => (id ? turnosApi.checkInTurno(id) : Promise.reject("No ID")),
    onSuccess: invalidateAllTurnosLists,
  })

  const checkOutMutation = useMutation({
    mutationFn: () => (id ? turnosApi.checkOutTurno(id) : Promise.reject("No ID")),
    onSuccess: invalidateAllTurnosLists,
  })

  const noShowMutation = useMutation({
    mutationFn: (payload?: NoShowTurnoRequest) =>
      id ? turnosApi.noShowTurno(id, payload) : Promise.reject("No ID"),
    onSuccess: invalidateAllTurnosLists,
  })

  const cancelMutation = useMutation({
    mutationFn: (payload?: { reason?: string }) =>
      id ? turnosApi.cancelTurno(id, payload) : Promise.reject("No ID"),
    onSuccess: invalidateAllTurnosLists,
  })

  const claimMutation = useMutation({
    mutationFn: () => (id ? turnosApi.claimTurno(id) : Promise.reject("No ID")),
    onSuccess: invalidateAllTurnosLists,
  })

  return {
    turno: data?.data ?? null,
    isLoading,
    error,
    refetch,

    // Assign
    assignTurno: assignMutation.mutate,
    assignTurnoAsync: assignMutation.mutateAsync,
    isAssigning: assignMutation.isPending,

    // Unassign
    unassignTurno: unassignMutation.mutate,
    unassignTurnoAsync: unassignMutation.mutateAsync,
    isUnassigning: unassignMutation.isPending,

    // Check-in
    checkInTurno: checkInMutation.mutate,
    checkInTurnoAsync: checkInMutation.mutateAsync,
    isCheckingIn: checkInMutation.isPending,

    // Check-out
    checkOutTurno: checkOutMutation.mutate,
    checkOutTurnoAsync: checkOutMutation.mutateAsync,
    isCheckingOut: checkOutMutation.isPending,

    // No-show
    noShowTurno: noShowMutation.mutate,
    noShowTurnoAsync: noShowMutation.mutateAsync,
    isMarkingNoShow: noShowMutation.isPending,

    // Cancel
    cancelTurno: cancelMutation.mutate,
    cancelTurnoAsync: cancelMutation.mutateAsync,
    isCanceling: cancelMutation.isPending,

    // Claim
    claimTurno: claimMutation.mutate,
    claimTurnoAsync: claimMutation.mutateAsync,
    isClaiming: claimMutation.isPending,
  }
}

/**
 * ✅ Small hooks for guía dashboard
 */

export function useMyNextTurno() {
  return useQuery({
    queryKey: ["turnos-me-next"],
    queryFn: () => turnosApi.getMyNextTurno(),
    staleTime: 15_000,
  })
}

export function useMyActiveTurno() {
  return useQuery({
    queryKey: ["turnos-me-active"],
    queryFn: () => turnosApi.getMyActiveTurno(),
    staleTime: 15_000,
  })
}
