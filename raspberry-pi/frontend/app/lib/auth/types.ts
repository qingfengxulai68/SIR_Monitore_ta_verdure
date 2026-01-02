import { z } from "zod"

// Local user type definition
export type User = {
  id: number
  username: string
}

// Request schema and type for login
export const loginRequestSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
  password: z.string().trim().min(1, "Password is required")
})

export type loginRequest = z.infer<typeof loginRequestSchema>

// Request schema and type for changing password
export const changePasswordRequestSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password")
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  })

export type changePasswordRequest = z.infer<typeof changePasswordRequestSchema>
