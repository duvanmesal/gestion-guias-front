import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { turnosApi } from "@/core/api"
import type {
  TurnosQueryParams,
  AssignTurnoRequest,
  UnassignTurnoRequest,
  NoShowTurnoRequest,
} from "@/core/models/turnos"

export function useTurnos(params?: TurnosQueryParams) {
  const queryClient = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["turnos", params],
    queryFn: () => turnosApi.getTurnos(params),
    staleTime: 15_000,
  })

  const assignMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AssignTurnoRequest }) =>
      turnosApi.assignTurno(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["turnos"] })
      queryClient.invalidateQueries({ queryKey: ["atencion-turnos"] })
    },
  })

  const unassignMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data?: UnassignTurnoRequest }) =>
      turnosApi.unassignTurno(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["turnos"] })
      queryClient.invalidateQueries({ queryKey: ["atencion-turnos"] })
    },
  })

  const checkInMutation = useMutation({
    mutationFn: (id: number) => turnosApi.checkInTurno(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["turnos"] })
      queryClient.invalidateQueries({ queryKey: ["atencion-turnos"] })
    },
  })

  const checkOutMutation = useMutation({
    mutationFn: (id: number) => turnosApi.checkOutTurno(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["turnos"] })
      queryClient.invalidateQueries({ queryKey: ["atencion-turnos"] })
    },
  })

  const noShowMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data?: NoShowTurnoRequest }) =>
      turnosApi.noShowTurno(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["turnos"] })
      queryClient.invalidateQueries({ queryKey: ["atencion-turnos"] })
    },
  })

  const meta = data?.meta
    ? {
        ...data.meta,
        totalPages: data.meta.totalPages ?? Math.max(1, Math.ceil(data.meta.total / data.meta.pageSize)),
      }
    : undefined

  return {
    turnos: data?.data ?? [],
    meta,
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

  const assignMutation = useMutation({
    mutationFn: (payload: AssignTurnoRequest) =>
      id ? turnosApi.assignTurno(id, payload) : Promise.reject("No ID"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["turno", id] })
      queryClient.invalidateQueries({ queryKey: ["turnos"] })
      queryClient.invalidateQueries({ queryKey: ["atencion-turnos"] })
    },
  })

  const unassignMutation = useMutation({
    mutationFn: (payload?: UnassignTurnoRequest) =>
      id ? turnosApi.unassignTurno(id, payload) : Promise.reject("No ID"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["turno", id] })
      queryClient.invalidateQueries({ queryKey: ["turnos"] })
      queryClient.invalidateQueries({ queryKey: ["atencion-turnos"] })
    },
  })

  const checkInMutation = useMutation({
    mutationFn: () => (id ? turnosApi.checkInTurno(id) : Promise.reject("No ID")),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["turno", id] })
      queryClient.invalidateQueries({ queryKey: ["turnos"] })
      queryClient.invalidateQueries({ queryKey: ["atencion-turnos"] })
    },
  })

  const checkOutMutation = useMutation({
    mutationFn: () => (id ? turnosApi.checkOutTurno(id) : Promise.reject("No ID")),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["turno", id] })
      queryClient.invalidateQueries({ queryKey: ["turnos"] })
      queryClient.invalidateQueries({ queryKey: ["atencion-turnos"] })
    },
  })

  const noShowMutation = useMutation({
    mutationFn: (payload?: NoShowTurnoRequest) =>
      id ? turnosApi.noShowTurno(id, payload) : Promise.reject("No ID"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["turno", id] })
      queryClient.invalidateQueries({ queryKey: ["turnos"] })
      queryClient.invalidateQueries({ queryKey: ["atencion-turnos"] })
    },
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
  }
}
