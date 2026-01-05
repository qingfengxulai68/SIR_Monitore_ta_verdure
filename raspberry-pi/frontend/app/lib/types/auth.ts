import { z } from "zod"

// User type definition
export type User = {
  id: number
  username: string
}

// Response type for login
export type LoginResponse = {
  token: string
  user: User
}

// Schema and type for login request
export const loginRequestSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
  password: z.string().trim().min(1, "Password is required")
})

export type LoginRequest = z.infer<typeof loginRequestSchema>

// Schema and type for changing password
export const changePasswordRequestSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm your password")
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  })

export type ChangePasswordRequest = z.infer<typeof changePasswordRequestSchema>
