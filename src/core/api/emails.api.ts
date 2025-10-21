import { http } from "./http"
import type { ApiResponse } from "@/core/models/api"

interface EmailVerifyResponse {
  ok: boolean
}

interface EmailTestRequest {
  to: string
  subject: string
  message: string
}

interface EmailTestResponse {
  to: string
  subject: string
}

export const emailsApi = {
  // Verify email configuration
  async verify(): Promise<ApiResponse<EmailVerifyResponse>> {
    const response = await http.get<ApiResponse<EmailVerifyResponse>>("/emails/verify")
    return response.data
  },

  // Send test email
  async test(data: EmailTestRequest): Promise<ApiResponse<EmailTestResponse>> {
    const response = await http.post<ApiResponse<EmailTestResponse>>("/emails/test", data)
    return response.data
  },
}
