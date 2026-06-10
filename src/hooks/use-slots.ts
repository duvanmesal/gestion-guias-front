import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { slotsApi, type ToggleSlotRequest } from "@/core/api"

export function useSlots() {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ["slots"],
    queryFn: () => slotsApi.getSlots(),
    staleTime: 30_000,
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ToggleSlotRequest }) =>
      slotsApi.toggleSlot(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slots"] })
    },
  })

  return {
    slots: data?.data ?? [],
    isLoading,
    error,
    toggleSlotAsync: toggleMutation.mutateAsync,
    isToggling: toggleMutation.isPending,
  }
}

export function useSlotsLookup() {
  const { data, isLoading } = useQuery({
    queryKey: ["slots", "lookup"],
    queryFn: () => slotsApi.getSlots(),
    staleTime: 60_000,
  })

  const activeSlots = (data?.data ?? []).filter((s) => s.status === "ACTIVO")

  return { slots: data?.data ?? [], activeSlots, isLoading }
}
