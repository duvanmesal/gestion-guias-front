import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { disponibilidadApi } from "@/core/api/disponibilidad.api"

export function useMiDisponibilidad(atencionId: number | null) {
  const queryClient = useQueryClient()

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["disponibilidad-me", atencionId],
    queryFn: () => (atencionId ? disponibilidadApi.getMe(atencionId) : Promise.resolve(null)),
    enabled: !!atencionId,
    staleTime: 10_000,
  })

  const marcarMutation = useMutation({
    mutationFn: () =>
      atencionId ? disponibilidadApi.marcar(atencionId) : Promise.reject("No ID"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disponibilidad-me", atencionId] })
    },
  })

  const desmarcarMutation = useMutation({
    mutationFn: () =>
      atencionId ? disponibilidadApi.desmarcar(atencionId) : Promise.reject("No ID"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disponibilidad-me", atencionId] })
    },
  })

  return {
    miDisponibilidad: data?.data ?? null,
    isLoading,
    refetch,
    marcarAsync: marcarMutation.mutateAsync,
    isMarking: marcarMutation.isPending,
    desmarcarAsync: desmarcarMutation.mutateAsync,
    isDesmarking: desmarcarMutation.isPending,
  }
}

export function useDisponibilidadQueue(atencionId: number | null) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["disponibilidad-queue", atencionId],
    queryFn: () => (atencionId ? disponibilidadApi.getQueue(atencionId) : Promise.resolve(null)),
    enabled: !!atencionId,
    staleTime: 10_000,
  })

  return {
    queue: data?.data ?? [],
    isLoading,
    refetch,
  }
}
