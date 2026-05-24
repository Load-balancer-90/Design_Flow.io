import { z } from 'zod';

export const signupSchema = z.object({
  username: z.string().trim().min(3).max(50),
  password: z.string().min(6).max(128),
  displayName: z.string().trim().min(1).max(100).optional(),
});

export const loginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});
