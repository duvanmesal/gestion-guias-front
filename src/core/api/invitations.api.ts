import { http } from "./http"
import type { ApiResponse } from "@/core/models/api"
import type { Invitation, CreateInvitationRequest } from "@/core/models/invitations"

export const invitationsApi = {
  // Get all invitations
  async getInvitations(): Promise<Invitation[]> {
    const response = await http.get<ApiResponse<Invitation[]>>("/invitations")
    const payload = response.data
    // Soporta ambos casos: wrapper { data: [...] } o array directo
    if (Array.isArray((payload as any)?.data)) return (payload as any).data as Invitation[]
    if (Array.isArray(payload as any)) return payload as any as Invitation[]
    return [] // fallback seguro
  },

  // Create invitation
  async createInvitation(data: CreateInvitationRequest): Promise<Invitation> {
    const response = await http.post<ApiResponse<Invitation>>("/invitations", data)
    const payload = response.data
    if ((payload as any)?.data) return (payload as any).data as Invitation
    return payload as any as Invitation
  },

  // Resend invitation
  async resendInvitation(id: string): Promise<void> {
    await http.post(`/invitations/${id}/resend`)
  },
}
