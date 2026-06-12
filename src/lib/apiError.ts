import { ZodError } from 'zod'

export function errorMessage(error: unknown): string {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? 'Datele trimise nu sunt valide.'
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'A apărut o eroare.'
}
