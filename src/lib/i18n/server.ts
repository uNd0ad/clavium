import { cookies } from 'next/headers'
import { LOCALE_COOKIE, DEFAULT_LOCALE, isLocale, type Locale } from './config'
import { getDictionary, type Dictionary } from './dictionaries'

// Limba curentă din cookie (server). Implicit `DEFAULT_LOCALE`.
export async function getLocale(): Promise<Locale> {
  const store = await cookies()
  const value = store.get(LOCALE_COOKIE)?.value
  return isLocale(value) ? value : DEFAULT_LOCALE
}

// Limba + dicționarul pentru componente server și pentru `LocaleProvider`.
export async function getServerDictionary(): Promise<{ locale: Locale; dict: Dictionary }> {
  const locale = await getLocale()
  return { locale, dict: getDictionary(locale) }
}
