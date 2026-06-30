// Suport multi-valută (RON / EUR). Sumele se stochează în RON (sursa de adevăr pentru plăți);
// EUR e o reprezentare de afișare, utilă pentru vânzări (de regulă cotate în euro) și pentru
// investitori/expați. Cursul e configurabil prin env (BNR-like), cu un fallback rezonabil.
export const CURRENCIES = ['RON', 'EUR'] as const
export type Currency = (typeof CURRENCIES)[number]

export function isCurrency(value: string | undefined | null): value is Currency {
  return value === 'RON' || value === 'EUR'
}

// Curs EUR→RON de rezervă (sincron): override manual EUR_RON_RATE sau implicit. Sursa principală
// (live) e BNR — vezi `getEurRonRate()` din exchangeRate.ts, al cărui rezultat se pasează ca `rate`
// funcțiilor de mai jos. `eurRonRate()` e folosit doar când nu se pasează un curs explicit.
export function eurRonRate(): number {
  const raw = Number(process.env.EUR_RON_RATE)
  return Number.isFinite(raw) && raw > 0 ? raw : 4.97
}

export function ronToEur(amountRon: number, rate: number = eurRonRate()): number {
  return amountRon / rate
}

export function eurToRon(amountEur: number, rate: number = eurRonRate()): number {
  return Math.round(amountEur * rate)
}

const RON_FMT = new Intl.NumberFormat('ro-RO')
const EUR_FMT = new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 0 })

export function formatRon(amount: number): string {
  return `${RON_FMT.format(Math.round(amount))} RON`
}

export function formatEur(amountEur: number): string {
  return `${EUR_FMT.format(Math.round(amountEur))} €`
}

// Formatează o sumă (în RON) în valuta cerută, convertind la nevoie. `rate` = cursul BNR live
// (pasat din getEurRonRate); fără el, folosește cursul de rezervă.
export function formatMoney(amountRon: number, currency: Currency, rate: number = eurRonRate()): string {
  return currency === 'EUR' ? formatEur(ronToEur(amountRon, rate)) : formatRon(amountRon)
}

// „X RON (~Y €)" — preț principal în RON cu echivalentul în euro între paranteze (pentru vânzări).
export function formatRonWithEur(amountRon: number, rate: number = eurRonRate()): string {
  return `${formatRon(amountRon)} (~${formatEur(ronToEur(amountRon, rate))})`
}
