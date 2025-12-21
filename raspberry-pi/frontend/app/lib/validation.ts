import { z } from "zod"

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
  password: z.string().trim().min(1, "Password is required")
})

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

export const passwordChangeSchema = z
  .object({
    oldPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password")
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  })

export type LoginFormData = z.infer<typeof loginSchema>
export type PlantFormData = z.infer<typeof plantSchema>
export type SettingsFormData = z.infer<typeof settingsSchema>
export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>
