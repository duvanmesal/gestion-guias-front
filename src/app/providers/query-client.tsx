import { useState, useRef } from "react"
import { QueryClient, QueryClientProvider, MutationCache } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { useToast } from "@/shared/components/feedback/Toast"
import { extractApiError } from "@/core/utils/api-error"

interface QueryProviderProps {
  children: ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  const { showToast } = useToast()
  const showToastRef = useRef(showToast)
  showToastRef.current = showToast

  const [queryClient] = useState(
    () =>
      new QueryClient({
        mutationCache: new MutationCache({
          onError: (error, _variables, _context, mutation) => {
            if ((mutation.meta as Record<string, unknown>)?.suppressGlobalError) return
            showToastRef.current("error", extractApiError(error))
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 30000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
