import { http } from "./http"
import type { ApiResponse } from "@/core/models/api"
import type { Invitation, CreateInvitationRequest } from "@/core/models/invitations"

export const invitationsApi = {
  // Get all invitations
  async getInvitations(): Promise<ApiResponse<Invitation[]>> {
    const response = await http.get<ApiResponse<Invitation[]>>("/invitations")
    return response.data
  },

  // Create invitation
  async createInvitation(data: CreateInvitationRequest): Promise<ApiResponse<Invitation>> {
    const response = await http.post<ApiResponse<Invitation>>("/invitations", data)
    return response.data
  },

  // Resend invitation
  async resendInvitation(id: string): Promise<void> {
    await http.post(`/invitations/${id}/resend`)
  },
}
