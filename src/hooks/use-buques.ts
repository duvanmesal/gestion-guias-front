import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { buquesApi } from "@/core/api"
import type { BuquesQueryParams, CreateBuqueRequest, UpdateBuqueRequest } from "@/core/models/catalog"

export function useBuques(params?: BuquesQueryParams) {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ["buques", params],
    queryFn: () => buquesApi.getBuques(params),
    staleTime: 30_000,
  })

  const createMutation = useMutation({
    mutationFn: (payload: CreateBuqueRequest) => buquesApi.createBuque(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["buques"] }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBuqueRequest }) => buquesApi.updateBuque(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["buques"] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => buquesApi.deleteBuque(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["buques"] }),
  })

  // Calculate totalPages if not provided by backend
  const meta = data?.meta
    ? {
        ...data.meta,
        totalPages: data.meta.totalPages ?? Math.max(1, Math.ceil(data.meta.total / data.meta.pageSize)),
      }
    : undefined

  return {
    buques: data?.data ?? [],
    meta,
    isLoading,
    error,
    createBuque: createMutation.mutate,
    createBuqueAsync: createMutation.mutateAsync,
    updateBuque: updateMutation.mutate,
    updateBuqueAsync: updateMutation.mutateAsync,
    deleteBuque: deleteMutation.mutate,
    deleteBuqueAsync: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
  }
}

export function useBuquesLookup() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["buques", "lookup"],
    queryFn: () => buquesApi.lookup(),
    staleTime: 60_000,
  })

  return {
    buques: data?.data ?? [],
    isLoading,
    error,
  }
}
