import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { muellesApi } from "@/core/api"
import type {
  CreateMuelleRequest,
  MuellesQueryParams,
  UpdateMuelleRequest,
} from "@/core/models/catalog"

export function useMuelles(params?: MuellesQueryParams) {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ["muelles", params],
    queryFn: () => muellesApi.getMuelles(params),
    staleTime: 30_000,
  })

  const createMutation = useMutation({
    mutationFn: (payload: CreateMuelleRequest) => muellesApi.createMuelle(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["muelles"] })
      queryClient.invalidateQueries({ queryKey: ["muelles", "lookup"] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMuelleRequest }) =>
      muellesApi.updateMuelle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["muelles"] })
      queryClient.invalidateQueries({ queryKey: ["muelles", "lookup"] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => muellesApi.deleteMuelle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["muelles"] })
      queryClient.invalidateQueries({ queryKey: ["muelles", "lookup"] })
    },
  })

  const meta = data?.meta
    ? {
        ...data.meta,
        totalPages: data.meta.totalPages ?? Math.max(1, Math.ceil(data.meta.total / data.meta.pageSize)),
      }
    : undefined

  return {
    muelles: data?.data ?? [],
    meta,
    isLoading,
    error,
    createMuelleAsync: createMutation.mutateAsync,
    updateMuelleAsync: updateMutation.mutateAsync,
    deleteMuelleAsync: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

export function useMuellesLookup(puertoId?: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["muelles", "lookup", puertoId ?? "all"],
    queryFn: () => muellesApi.lookup(puertoId),
    staleTime: 60_000,
  })

  return { muelles: data?.data ?? [], isLoading, error }
}
