import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(80, "Name is too long"),
  email: z.string().trim().toLowerCase().email("Please enter a valid email"),
  phone: z.string().trim().max(20, "Phone number is too long").optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
});

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(80, "Name is too long"),
  phone: z.string().trim().max(20, "Phone number is too long").optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password"),
  newPassword: z.string().min(8, "Password must be at least 8 characters").max(100, "Password is too long"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(20, "This reset link is invalid"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100, "Password is too long"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email"),
  password: z.string().min(1, "Please enter your password"),
});