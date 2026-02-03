import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { atencionesApi } from "@/core/api"
import type {
  AtencionesQueryParams,
  AtencionSummary,
  CreateAtencionRequest,
  UpdateAtencionRequest,
  CancelAtencionRequest,
} from "@/core/models/atenciones"

export function useAtenciones(params?: AtencionesQueryParams) {
  const queryClient = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["atenciones", params],
    queryFn: () => atencionesApi.getAtenciones(params),
    staleTime: 30_000,
  })

  const createMutation = useMutation({
    mutationFn: (payload: CreateAtencionRequest) => atencionesApi.createAtencion(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["atenciones"] })
      queryClient.invalidateQueries({ queryKey: ["recaladas"] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAtencionRequest }) =>
      atencionesApi.updateAtencion(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["atenciones"] }),
  })

  const closeMutation = useMutation({
    mutationFn: (id: number) => atencionesApi.closeAtencion(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["atenciones"] }),
  })

  const cancelMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CancelAtencionRequest }) =>
      atencionesApi.cancelAtencion(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["atenciones"] }),
  })

  const meta = data?.meta
    ? {
        ...data.meta,
        totalPages: data.meta.totalPages ?? Math.max(1, Math.ceil(data.meta.total / data.meta.pageSize)),
      }
    : undefined

  return {
    atenciones: data?.data ?? [],
    meta,
    isLoading,
    error,
    refetch,
    // Create
    createAtencion: createMutation.mutate,
    createAtencionAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error,
    // Update
    updateAtencion: updateMutation.mutate,
    updateAtencionAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
    // Close
    closeAtencion: closeMutation.mutate,
    closeAtencionAsync: closeMutation.mutateAsync,
    isClosing: closeMutation.isPending,
    // Cancel
    cancelAtencion: cancelMutation.mutate,
    cancelAtencionAsync: cancelMutation.mutateAsync,
    isCanceling: cancelMutation.isPending,
  }
}

export function useAtencion(id: number | null) {
  const queryClient = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["atencion", id],
    queryFn: () => (id ? atencionesApi.getAtencion(id) : Promise.resolve(null)),
    enabled: !!id,
    staleTime: 30_000,
  })

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateAtencionRequest) =>
      id ? atencionesApi.updateAtencion(id, payload) : Promise.reject("No ID"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["atencion", id] })
      queryClient.invalidateQueries({ queryKey: ["atenciones"] })
    },
  })

  const closeMutation = useMutation({
    mutationFn: () => (id ? atencionesApi.closeAtencion(id) : Promise.reject("No ID")),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["atencion", id] })
      queryClient.invalidateQueries({ queryKey: ["atenciones"] })
    },
  })

  const cancelMutation = useMutation({
    mutationFn: (payload: CancelAtencionRequest) =>
      id ? atencionesApi.cancelAtencion(id, payload) : Promise.reject("No ID"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["atencion", id] })
      queryClient.invalidateQueries({ queryKey: ["atenciones"] })
    },
  })

  const claimMutation = useMutation({
    mutationFn: () => (id ? atencionesApi.claimTurno(id) : Promise.reject("No ID")),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["atencion", id] })
      queryClient.invalidateQueries({ queryKey: ["turnos"] })
    },
  })

  return {
    atencion: data?.data ?? null,
    isLoading,
    error,
    refetch,
    // Update
    updateAtencion: updateMutation.mutate,
    updateAtencionAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    // Close
    closeAtencion: closeMutation.mutate,
    closeAtencionAsync: closeMutation.mutateAsync,
    isClosing: closeMutation.isPending,
    // Cancel
    cancelAtencion: cancelMutation.mutate,
    cancelAtencionAsync: cancelMutation.mutateAsync,
    isCanceling: cancelMutation.isPending,
    // Claim
    claimTurno: claimMutation.mutate,
    claimTurnoAsync: claimMutation.mutateAsync,
    isClaiming: claimMutation.isPending,
  }
}

export function useAtencionTurnos(atencionId: number | null) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["atencion-turnos", atencionId],
    queryFn: () => (atencionId ? atencionesApi.getAtencionTurnos(atencionId) : Promise.resolve(null)),
    enabled: !!atencionId,
    staleTime: 15_000,
  })

  return {
    turnos: data?.data ?? [],
    isLoading,
    error,
    refetch,
  }
}

export function useAtencionSummary(atencionId: number | null) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["atencion-summary", atencionId],
    queryFn: () => (atencionId ? atencionesApi.getSummary(atencionId) : Promise.resolve(null)),
    enabled: !!atencionId,
    staleTime: 10_000, // 10 seconds - refresh more often for live dashboard
  })

  return {
    summary: data?.data as AtencionSummary | null,
    isLoading,
    error,
    refetch,
  }
}
