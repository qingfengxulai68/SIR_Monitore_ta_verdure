import { z } from "zod"

// Alerts settings type definition
export type AlertsSettings = {
  discord_enabled: boolean
  discord_webhook_url?: string
  email_enabled: boolean
  receiver_email?: string
}

// Schema and type for updating Discord alerts
export const discordAlertsUpdateRequestSchema = z.object({
  discord_enabled: z.boolean(),
  discord_webhook_url: z.url().optional().nullable()
})

export type DiscordAlertsUpdateRequest = z.infer<typeof discordAlertsUpdateRequestSchema>

// Schema and type for updating Email alerts
export const emailAlertsUpdateRequestSchema = z.object({
  email_enabled: z.boolean(),
  receiver_email: z.email().optional().nullable()
})

export type EmailAlertsUpdateRequest = z.infer<typeof emailAlertsUpdateRequestSchema>
