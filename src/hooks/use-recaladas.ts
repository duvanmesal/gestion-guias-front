// src/hooks/use-recaladas.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { recaladasApi } from "@/core/api"
import type {
  RecaladasQueryParams,
  CreateRecaladaRequest,
  UpdateRecaladaRequest,
  CancelRecaladaRequest,
} from "@/core/models/recaladas"

export function useRecaladas(params?: RecaladasQueryParams) {
  const queryClient = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["recaladas", params],
    queryFn: () => recaladasApi.getRecaladas(params),
    staleTime: 30_000,
  })

  const createMutation = useMutation({
    mutationFn: (payload: CreateRecaladaRequest) => recaladasApi.createRecalada(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recaladas"] }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRecaladaRequest }) =>
      recaladasApi.updateRecalada(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recaladas"] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => recaladasApi.deleteRecalada(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recaladas"] }),
  })

  const arriveMutation = useMutation({
    mutationFn: (id: string) => recaladasApi.arriveRecalada(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recaladas"] }),
  })

  const departMutation = useMutation({
    mutationFn: (id: string) => recaladasApi.departRecalada(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recaladas"] }),
  })

  const cancelMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CancelRecaladaRequest }) =>
      recaladasApi.cancelRecalada(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recaladas"] }),
  })

  const meta = data?.meta
    ? {
        ...data.meta,
        totalPages: data.meta.totalPages ?? Math.max(1, Math.ceil(data.meta.total / data.meta.pageSize)),
      }
    : undefined

  return {
    recaladas: data?.data ?? [],
    meta,
    isLoading,
    error,
    refetch,
    // Create
    createRecalada: createMutation.mutate,
    createRecaladaAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error,
    // Update
    updateRecalada: updateMutation.mutate,
    updateRecaladaAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
    // Delete
    deleteRecalada: deleteMutation.mutate,
    deleteRecaladaAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
    // Arrive
    arriveRecalada: arriveMutation.mutate,
    arriveRecaladaAsync: arriveMutation.mutateAsync,
    isArriving: arriveMutation.isPending,
    // Depart
    departRecalada: departMutation.mutate,
    departRecaladaAsync: departMutation.mutateAsync,
    isDeparting: departMutation.isPending,
    // Cancel
    cancelRecalada: cancelMutation.mutate,
    cancelRecaladaAsync: cancelMutation.mutateAsync,
    isCanceling: cancelMutation.isPending,
  }
}

export function useRecalada(id: string | null) {
  const queryClient = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["recalada", id],
    queryFn: () => (id ? recaladasApi.getRecalada(id) : Promise.resolve(null)),
    enabled: !!id,
    staleTime: 30_000,
  })

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateRecaladaRequest) =>
      id ? recaladasApi.updateRecalada(id, payload) : Promise.reject("No ID"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recalada", id] })
      queryClient.invalidateQueries({ queryKey: ["recaladas"] })
    },
  })

  const arriveMutation = useMutation({
    mutationFn: () => (id ? recaladasApi.arriveRecalada(id) : Promise.reject("No ID")),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recalada", id] })
      queryClient.invalidateQueries({ queryKey: ["recaladas"] })
    },
  })

  const departMutation = useMutation({
    mutationFn: () => (id ? recaladasApi.departRecalada(id) : Promise.reject("No ID")),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recalada", id] })
      queryClient.invalidateQueries({ queryKey: ["recaladas"] })
    },
  })

  const cancelMutation = useMutation({
    mutationFn: (payload: CancelRecaladaRequest) =>
      id ? recaladasApi.cancelRecalada(id, payload) : Promise.reject("No ID"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recalada", id] })
      queryClient.invalidateQueries({ queryKey: ["recaladas"] })
    },
  })

  return {
    recalada: data?.data ?? null,
    isLoading,
    error,
    refetch,
    // Update
    updateRecalada: updateMutation.mutate,
    updateRecaladaAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    // Arrive
    arriveRecalada: arriveMutation.mutate,
    arriveRecaladaAsync: arriveMutation.mutateAsync,
    isArriving: arriveMutation.isPending,
    // Depart
    departRecalada: departMutation.mutate,
    departRecaladaAsync: departMutation.mutateAsync,
    isDeparting: departMutation.isPending,
    // Cancel
    cancelRecalada: cancelMutation.mutate,
    cancelRecaladaAsync: cancelMutation.mutateAsync,
    isCanceling: cancelMutation.isPending,
  }
}
