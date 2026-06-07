import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Adresa de email nu este validă'),
  password: z.string().min(8, 'Parola trebuie să aibă cel puțin 8 caractere'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Numele trebuie să aibă cel puțin 2 caractere'),
  email: z.string().email('Adresa de email nu este validă'),
  password: z.string().min(8, 'Parola trebuie să aibă cel puțin 8 caractere'),
})

export const otpSendSchema = z.object({
  email: z.string().email('Adresa de email nu este validă'),
})

export const otpVerifySchema = z.object({
  email: z.string().email('Adresa de email nu este validă'),
  code: z.string().length(6, 'Codul OTP trebuie să conțină 6 cifre'),
})
