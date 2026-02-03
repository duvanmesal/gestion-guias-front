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

  // Get invitation by email
  async getByEmail(email: string): Promise<Invitation | null> {
    try {
      const response = await http.get<ApiResponse<Invitation>>(
        `/invitations/by-email/${encodeURIComponent(email)}`
      )
      const payload = response.data
      if ((payload as any)?.data) return (payload as any).data as Invitation
      return payload as any as Invitation
    } catch (error: any) {
      // 404 means no invitation found
      if (error.response?.status === 404) return null
      throw error
    }
  },

  // Create invitation
  async createInvitation(data: CreateInvitationRequest): Promise<Invitation> {
    const response = await http.post<ApiResponse<Invitation>>("/invitations", data)
    const payload = response.data
    if ((payload as any)?.data) return (payload as any).data as Invitation
    return payload as any as Invitation
  },

  // Resend invitation by ID
  async resendInvitation(id: string): Promise<void> {
    await http.post(`/invitations/${id}/resend`)
  },

  // Resend invitation by email
  async resendByEmail(email: string): Promise<void> {
    await http.post("/invitations/resend-by-email", { email })
  },
}
