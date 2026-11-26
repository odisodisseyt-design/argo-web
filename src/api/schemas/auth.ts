import { z } from 'zod'

/** Public user from /api/me, /api/auth/login and /api/auth/register. */
export const ViewerSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  username: z.string(),
  role: z.string().nullish(),
})
export type Viewer = z.infer<typeof ViewerSchema>

export const LoginInputSchema = z.object({
  username: z.string().trim().min(1, 'Введи имя'),
  password: z.string().min(1, 'Введи пароль'),
})
export type LoginInput = z.infer<typeof LoginInputSchema>

export const RegisterInputSchema = z
  .object({
    username: z.string().trim().min(3, 'Минимум 3 символа').max(32, 'Максимум 32 символа'),
    password: z.string().min(6, 'Минимум 6 символов').max(128, 'Слишком длинный пароль'),
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Пароли не совпадают',
  })
export type RegisterInput = z.infer<typeof RegisterInputSchema>

export const authResultSchema = z.object({
  token: z.string(),
  user: ViewerSchema,
})
