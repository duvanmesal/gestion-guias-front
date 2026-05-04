import type { AxiosError } from "axios"
import type { ApiResponse } from "@/core/models/api"

export function extractApiError(error: unknown): string {
  const err = error as AxiosError<ApiResponse<unknown>>

  const apiMessage = err?.response?.data?.error?.message
  if (apiMessage) return apiMessage

  if (err?.code === "ERR_NETWORK" || err?.message === "Network Error") {
    return "Sin conexión con el servidor. Verifica tu conexión a internet."
  }

  if (err?.code === "ECONNABORTED") {
    return "La solicitud tardó demasiado. Inténtalo de nuevo."
  }

  const status = err?.response?.status
  if (status === 400) return "Los datos enviados no son válidos."
  if (status === 403) return "No tienes permisos para realizar esta acción."
  if (status === 404) return "El recurso solicitado no existe."
  if (status === 409) return "Conflicto con los datos existentes."
  if (status === 422) return "Los datos enviados no son válidos."
  if (status === 429) return "Demasiadas solicitudes. Espera un momento."
  if (status && status >= 500) return "Error interno del servidor. Inténtalo más tarde."

  return "Ocurrió un error inesperado. Inténtalo de nuevo."
}
