import { z } from "zod"

// User type definition
export interface User {
  id: number
  username: string
}

// Login request schema and type
export const loginRequestSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
  password: z.string().trim().min(1, "Password is required")
})

export type loginRequest = z.infer<typeof loginRequestSchema>

// Password change request schema and type
export const changePasswordRequestSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password")
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  })

export type changePasswordRequest = z.infer<typeof changePasswordRequestSchema>
