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

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email"),
  password: z.string().min(1, "Please enter your password"),
});