import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { puertosApi } from "@/core/api"
import type {
  CreatePuertoRequest,
  PuertosQueryParams,
  UpdatePuertoRequest,
} from "@/core/models/catalog"

export function usePuertos(params?: PuertosQueryParams) {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ["puertos", params],
    queryFn: () => puertosApi.getPuertos(params),
    staleTime: 30_000,
  })

  const createMutation = useMutation({
    mutationFn: (payload: CreatePuertoRequest) => puertosApi.createPuerto(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["puertos"] })
      queryClient.invalidateQueries({ queryKey: ["puertos", "lookup"] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePuertoRequest }) =>
      puertosApi.updatePuerto(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["puertos"] })
      queryClient.invalidateQueries({ queryKey: ["puertos", "lookup"] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => puertosApi.deletePuerto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["puertos"] })
      queryClient.invalidateQueries({ queryKey: ["puertos", "lookup"] })
    },
  })

  const meta = data?.meta
    ? {
        ...data.meta,
        totalPages: data.meta.totalPages ?? Math.max(1, Math.ceil(data.meta.total / data.meta.pageSize)),
      }
    : undefined

  return {
    puertos: data?.data ?? [],
    meta,
    isLoading,
    error,
    createPuertoAsync: createMutation.mutateAsync,
    updatePuertoAsync: updateMutation.mutateAsync,
    deletePuertoAsync: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

export function usePuertosLookup() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["puertos", "lookup"],
    queryFn: () => puertosApi.lookup(),
    staleTime: 60_000,
  })

  return { puertos: data?.data ?? [], isLoading, error }
}
