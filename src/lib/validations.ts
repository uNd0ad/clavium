import { z } from 'zod'
import { ROLES } from './types/roles'
import { isValidCui, isValidRegNumber } from './fiscalCode'

// Roluri permise la înregistrare publică — ADMIN se acordă doar manual.
const registrationRoleEnum = z.enum(['OWNER', 'CLIENT'])

export const phoneSchema = z
  .string()
  .transform((value) => value.replace(/[\s.-]/g, ''))
  .pipe(z.string().regex(/^(\+?40|0)7\d{8}$/, 'Numărul de telefon nu este valid (ex: 07XX XXX XXX)'))

// bcrypt ignoră octeții peste 72 — plafonăm la 72 ca politica de parolă să fie reală
// (altfel caracterele în plus sunt trunchiate silențios la hash și nu contează).
export const passwordSchema = z
  .string()
  .min(8, 'Parola trebuie să aibă cel puțin 8 caractere')
  .max(72, 'Parola poate avea cel mult 72 de caractere')

export const loginSchema = z.object({
  email: z.string().email('Adresa de email nu este validă'),
  password: z.string().min(8, 'Parola trebuie să aibă cel puțin 8 caractere'),
})

export const registerSchema = z
  .object({
    accountType: z.enum(['PERSON', 'COMPANY']).optional().default('PERSON'),
    firstName: z.string().min(2, 'Prenumele trebuie să aibă cel puțin 2 caractere'),
    lastName: z.string().min(2, 'Numele de familie trebuie să aibă cel puțin 2 caractere'),
    email: z.string().email('Adresa de email nu este validă'),
    password: passwordSchema,
    role: registrationRoleEnum.optional().default(ROLES.CLIENT),
    phone: phoneSchema,
    // Câmpuri de firmă — obligatorii doar pentru persoană juridică (validate mai jos).
    companyName: z.string().trim().optional(),
    companyCui: z.string().trim().optional(),
    companyReg: z.string().trim().optional(),
    companyAddress: z.string().trim().optional(),
    companyVatPayer: z.boolean().optional().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.accountType !== 'COMPANY') return
    if (!data.companyName || data.companyName.length < 2) {
      ctx.addIssue({ code: 'custom', path: ['companyName'], message: 'Denumirea firmei este obligatorie' })
    }
    if (!data.companyCui || !isValidCui(data.companyCui)) {
      ctx.addIssue({ code: 'custom', path: ['companyCui'], message: 'CUI/CIF invalid' })
    }
    if (!data.companyReg || !isValidRegNumber(data.companyReg)) {
      ctx.addIssue({ code: 'custom', path: ['companyReg'], message: 'Nr. de înregistrare invalid (ex: J40/1234/2020)' })
    }
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

export const propertySchema = z
  .object({
    title: z.string().min(5, 'Titlul trebuie să aibă cel puțin 5 caractere'),
    description: z.string().max(2000, 'Descrierea este prea lungă').optional(),
    location: z.string().min(2, 'Localitatea trebuie să aibă cel puțin 2 caractere'),
    transactionType: z.enum(['INCHIRIERE', 'VANZARE']).optional().default('INCHIRIERE'),
    // Chiria e obligatorie pentru închiriere, prețul pentru vânzare (validate mai jos).
    rent: z.coerce.number().int().min(0).max(1_000_000, 'Chiria este prea mare').optional(),
    price: z.coerce.number().int().min(0).max(100_000_000, 'Prețul este prea mare').optional(),
    rooms: z.coerce.number().int().min(1).max(50).optional(),
    surface: z.coerce.number().int().min(1).max(10_000).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.transactionType === 'VANZARE') {
      if (!data.price || data.price < 1) {
        ctx.addIssue({ code: 'custom', path: ['price'], message: 'Prețul de vânzare trebuie să fie pozitiv' })
      }
    } else if (!data.rent || data.rent < 1) {
      ctx.addIssue({ code: 'custom', path: ['rent'], message: 'Chiria trebuie să fie pozitivă' })
    }
  })

export const propertyUpdateSchema = z.object({
  title: z.string().min(5, 'Titlul trebuie să aibă cel puțin 5 caractere').optional(),
  description: z.string().max(2000, 'Descrierea este prea lungă').optional(),
  location: z.string().min(2, 'Localitatea trebuie să aibă cel puțin 2 caractere').optional(),
  transactionType: z.enum(['INCHIRIERE', 'VANZARE']).optional(),
  rent: z.coerce.number().int().min(0).max(1_000_000, 'Chiria este prea mare').optional(),
  price: z.coerce.number().int().min(0).max(100_000_000, 'Prețul este prea mare').optional(),
  rooms: z.coerce.number().int().min(1).max(50).optional(),
  surface: z.coerce.number().int().min(1).max(10_000).optional(),
  status: z.enum(['DISPONIBILA', 'INCHIRIATA', 'REZERVATA', 'VANDUTA', 'INACTIVA']).optional(),
})

export const offerSchema = z.object({
  propertyId: z.string().uuid('Proprietate invalidă'),
  amount: z.coerce.number().int().min(1, 'Suma trebuie să fie pozitivă').max(1_000_000, 'Suma este prea mare'),
})

export const offerActionSchema = z.object({
  action: z.enum(['accept', 'reject']),
})

export const contractTermsSchema = z.object({
  rent: z.coerce.number().int().min(1, 'Chiria trebuie să fie pozitivă').max(1_000_000),
  deposit: z.coerce.number().int().min(0, 'Garanția nu poate fi negativă').max(10_000_000),
  months: z.coerce.number().int().min(1, 'Durata minimă este 1 lună').max(120, 'Durata maximă este 120 de luni'),
  dueDay: z.coerce.number().int().min(1).max(28, 'Ziua scadentă trebuie să fie între 1 și 28'),
  startDate: z.coerce.date(),
  clauses: z.string().max(4000, 'Clauzele sunt prea lungi').optional(),
})

export const saleTermsSchema = z
  .object({
    price: z.coerce.number().int().min(1, 'Prețul trebuie să fie pozitiv').max(100_000_000, 'Prețul este prea mare'),
    deposit: z.coerce.number().int().min(0, 'Avansul nu poate fi negativ').max(100_000_000),
    clauses: z.string().max(4000, 'Clauzele sunt prea lungi').optional(),
  })
  .superRefine((data, ctx) => {
    if (data.deposit > data.price) {
      ctx.addIssue({ code: 'custom', path: ['deposit'], message: 'Avansul nu poate depăși prețul de vânzare' })
    }
  })

// Tichet nou deschis de chiriaș: subiect + categorie + prioritate + primul mesaj.
export const ticketCreateSchema = z.object({
  contractId: z.string().uuid('Contract invalid'),
  subject: z.string().trim().min(4, 'Subiectul trebuie să aibă cel puțin 4 caractere').max(120, 'Subiectul este prea lung'),
  category: z.enum(['MENTENANTA', 'PLATA', 'CONTRACT', 'ALTELE']).optional().default('ALTELE'),
  priority: z.enum(['SCAZUTA', 'NORMALA', 'URGENTA']).optional().default('NORMALA'),
  message: z.string().trim().min(10, 'Descrie problema în cel puțin 10 caractere').max(4000, 'Mesajul este prea lung'),
})

export const ticketReplySchema = z.object({
  body: z.string().trim().min(1, 'Mesajul nu poate fi gol').max(4000, 'Mesajul este prea lung'),
})

export const ticketStatusSchema = z.object({
  status: z.enum(['DESCHIS', 'IN_LUCRU', 'REZOLVAT', 'INCHIS']),
})

export const profileUpdateSchema = z.object({
  firstName: z.string().min(2, 'Prenumele trebuie să aibă cel puțin 2 caractere').optional(),
  lastName: z.string().min(2, 'Numele de familie trebuie să aibă cel puțin 2 caractere').optional(),
  phone: phoneSchema.optional(),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8, 'Parola trebuie să aibă cel puțin 8 caractere'),
    newPassword: passwordSchema,
  })
  .superRefine((data, ctx) => {
    if (data.newPassword === data.currentPassword) {
      ctx.addIssue({ code: 'custom', path: ['newPassword'], message: 'Parola nouă trebuie să difere de cea actuală' })
    }
  })

export const adminUserUpdateSchema = z.object({
  role: z.enum(['ADMIN', 'OWNER', 'CLIENT']).optional(),
  isActive: z.boolean().optional(),
})
