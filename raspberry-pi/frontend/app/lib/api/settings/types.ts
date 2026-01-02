import { z } from "zod"

// Local alerts response type
export type Alerts = {
  enabled: boolean
  discordWebhookUrl: string | null
}

// Local alerts enable request schema and type
export const alertsEnableRequestSchema = z.object({
  discordWebhookUrl: z.string().url()
})

export type AlertsEnableRequest = z.infer<typeof alertsEnableRequestSchema>
