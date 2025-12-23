import { z } from "zod"

const thresholdSchema = z.object({
  min: z.coerce.number().min(0),
  max: z.coerce.number().min(0)
})

export const plantSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  moduleId: z.string().trim().min(1, "Module is required"),
  thresholds: z.object({
    moisture: thresholdSchema.refine((data) => data.max <= 100, {
      message: "Max must be <= 100"
    }),
    humidity: thresholdSchema.refine((data) => data.max <= 100, {
      message: "Max must be <= 100"
    }),
    temperature: thresholdSchema.refine((data) => data.min >= -20 && data.max <= 50, {
      message: "Range: -20 to 50"
    }),
    light: thresholdSchema.refine((data) => data.max <= 100000, {
      message: "Max must be <= 100000"
    })
  })
})

export const settingsSchema = z.object({
  discordWebhook: z.string().url("Invalid URL")
})

export type PlantFormData = z.infer<typeof plantSchema>
export type SettingsFormData = z.infer<typeof settingsSchema>
