import { z } from 'zod'
import { ROLES } from './types/roles'

// Roluri permise la înregistrare publică — ADMIN se acordă doar manual.
const registrationRoleEnum = z.enum(['OWNER', 'CLIENT'])

export const phoneSchema = z
  .string()
  .transform((value) => value.replace(/[\s.-]/g, ''))
  .pipe(z.string().regex(/^(\+?40|0)7\d{8}$/, 'Numărul de telefon nu este valid (ex: 07XX XXX XXX)'))

export const loginSchema = z.object({
  email: z.string().email('Adresa de email nu este validă'),
  password: z.string().min(8, 'Parola trebuie să aibă cel puțin 8 caractere'),
})

export const registerSchema = z.object({
  firstName: z.string().min(2, 'Prenumele trebuie să aibă cel puțin 2 caractere'),
  lastName: z.string().min(2, 'Numele de familie trebuie să aibă cel puțin 2 caractere'),
  email: z.string().email('Adresa de email nu este validă'),
  password: z.string().min(8, 'Parola trebuie să aibă cel puțin 8 caractere'),
  role: registrationRoleEnum.optional().default(ROLES.CLIENT),
  phone: phoneSchema,
})

export const otpSendSchema = z.object({
  email: z.string().email('Adresa de email nu este validă'),
})

export const otpVerifySchema = z.object({
  email: z.string().email('Adresa de email nu este validă'),
  code: z.string().length(6, 'Codul OTP trebuie să conțină 6 cifre'),
})

export const phoneOtpSendSchema = z.object({
  phone: phoneSchema,
})

export const phoneOtpVerifySchema = z.object({
  phone: phoneSchema,
  code: z.string().length(6, 'Codul OTP trebuie să conțină 6 cifre'),
})
