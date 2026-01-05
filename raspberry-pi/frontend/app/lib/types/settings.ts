import { z } from "zod"

// Response type for alerts settings
export interface AlertsSettingsResponse {
  enabled: boolean
  discordWebhookUrl?: string
}

// Request type for enabling alerts
export interface AlertsEnableRequest {
  discordWebhookUrl: string
}

// Zod schema for form validation
export const alertsEnableRequestSchema = z.object({
  discordWebhookUrl: z
    .url("Must be a valid URL")
    .refine((val) => /^https:\/\/discord\.com\/api\/webhooks\//.test(val), "Must be a valid Discord webhook URL")
})
