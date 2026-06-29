// Configurarea internaționalizării. Limba se reține într-un cookie (fără segment de rută `[locale]`),
// astfel încât URL-urile rămân stabile. Implicit română; engleza pentru investitori/expați.
export const LOCALES = ['ro', 'en'] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'ro'
export const LOCALE_COOKIE = 'clavium_locale'

export function isLocale(value: string | undefined | null): value is Locale {
  return value === 'ro' || value === 'en'
}

// Etichete pentru comutatorul de limbă.
export const LOCALE_LABELS: Record<Locale, string> = { ro: 'RO', en: 'EN' }
