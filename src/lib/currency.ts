// Suport multi-valută (RON / EUR). Sumele se stochează în RON (sursa de adevăr pentru plăți);
// EUR e o reprezentare de afișare, utilă pentru vânzări (de regulă cotate în euro) și pentru
// investitori/expați. Cursul e configurabil prin env (BNR-like), cu un fallback rezonabil.
export const CURRENCIES = ['RON', 'EUR'] as const
export type Currency = (typeof CURRENCIES)[number]

export function isCurrency(value: string | undefined | null): value is Currency {
  return value === 'RON' || value === 'EUR'
}

// Curs EUR→RON. Ex.: 1 EUR = 4.97 RON. Configurabil prin EUR_RON_RATE.
export function eurRonRate(): number {
  const raw = Number(process.env.EUR_RON_RATE)
  return Number.isFinite(raw) && raw > 0 ? raw : 4.97
}

export function ronToEur(amountRon: number): number {
  return amountRon / eurRonRate()
}

export function eurToRon(amountEur: number): number {
  return Math.round(amountEur * eurRonRate())
}

const RON_FMT = new Intl.NumberFormat('ro-RO')
const EUR_FMT = new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 0 })

export function formatRon(amount: number): string {
  return `${RON_FMT.format(Math.round(amount))} RON`
}

export function formatEur(amountEur: number): string {
  return `${EUR_FMT.format(Math.round(amountEur))} €`
}

// Formatează o sumă (în RON) în valuta cerută, convertind la nevoie.
export function formatMoney(amountRon: number, currency: Currency): string {
  return currency === 'EUR' ? formatEur(ronToEur(amountRon)) : formatRon(amountRon)
}

// „X RON (~Y €)" — preț principal în RON cu echivalentul în euro între paranteze (pentru vânzări).
export function formatRonWithEur(amountRon: number): string {
  return `${formatRon(amountRon)} (~${formatEur(ronToEur(amountRon))})`
}
