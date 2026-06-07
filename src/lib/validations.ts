import { z } from 'zod'
import { ROLES } from './types/roles'

const roleEnum = z.enum(['ADMIN', 'OWNER', 'CLIENT'])

export const loginSchema = z.object({
  email: z.string().email('Adresa de email nu este validă'),
  password: z.string().min(8, 'Parola trebuie să aibă cel puțin 8 caractere'),
})

export const registerSchema = z.object({
  firstName: z.string().min(2, 'Prenumele trebuie să aibă cel puțin 2 caractere'),
  lastName: z.string().min(2, 'Numele de familie trebuie să aibă cel puțin 2 caractere'),
  email: z.string().email('Adresa de email nu este validă'),
  password: z.string().min(8, 'Parola trebuie să aibă cel puțin 8 caractere'),
  role: roleEnum.optional().default(ROLES.CLIENT),
})

export const otpSendSchema = z.object({
  email: z.string().email('Adresa de email nu este validă'),
})

export const otpVerifySchema = z.object({
  email: z.string().email('Adresa de email nu este validă'),
  code: z.string().length(6, 'Codul OTP trebuie să conțină 6 cifre'),
})
