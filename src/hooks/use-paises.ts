import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { paisesApi } from "@/core/api"
import type { PaisesQueryParams, CreatePaisRequest, UpdatePaisRequest } from "@/core/models/catalog"

export function usePaises(params?: PaisesQueryParams) {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ["paises", params],
    queryFn: () => paisesApi.getPaises(params),
    staleTime: 30_000,
  })

  const createMutation = useMutation({
    mutationFn: (payload: CreatePaisRequest) => paisesApi.createPais(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["paises"] }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePaisRequest }) => paisesApi.updatePais(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["paises"] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => paisesApi.deletePais(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["paises"] }),
  })

  // Calculate totalPages if not provided by backend
  const meta = data?.meta
    ? {
        ...data.meta,
        totalPages: data.meta.totalPages ?? Math.max(1, Math.ceil(data.meta.total / data.meta.pageSize)),
      }
    : undefined

  return {
    paises: data?.data ?? [],
    meta,
    isLoading,
    error,
    createPais: createMutation.mutate,
    createPaisAsync: createMutation.mutateAsync,
    updatePais: updateMutation.mutate,
    updatePaisAsync: updateMutation.mutateAsync,
    deletePais: deleteMutation.mutate,
    deletePaisAsync: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
  }
}

export function usePaisesLookup() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["paises", "lookup"],
    queryFn: () => paisesApi.lookup(),
    staleTime: 60_000,
  })

  return {
    paises: data?.data ?? [],
    isLoading,
    error,
  }
}
