import { z } from "zod"

// Alerts settings type definition
export type AlertsSettings = {
  enabled: boolean
  discordWebhookUrl?: string
}

// Schema and type for enabling alerts
export const alertsEnableRequestSchema = z.object({
  discordWebhookUrl: z
    .url("Must be a valid URL")
    .refine((val) => /^https:\/\/discord\.com\/api\/webhooks\//.test(val), "Must be a valid Discord webhook URL")
})

export type AlertsEnableRequest = z.infer<typeof alertsEnableRequestSchema>
