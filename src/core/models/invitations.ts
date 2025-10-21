import type { Rol } from "./auth"

// Invitation Status
export enum InvitationStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  EXPIRED = "EXPIRED",
}

// Invitation Entity
export interface Invitation {
  id: string
  email: string
  role: Rol
  status: InvitationStatus
  expiresAt: string
  createdAt?: string
}

// Create Invitation Request
export interface CreateInvitationRequest {
  email: string
  role: Rol
}
