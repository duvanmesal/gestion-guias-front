import { v4 as uuidv4 } from "uuid"

export function generateRequestId(): string {
  return uuidv4()
}

export function getRequestIdFromResponse(headers: Headers): string | null {
  return headers.get("X-Request-Id")
}
