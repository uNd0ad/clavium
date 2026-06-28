// Comisionul platformei. Funcții pure, testabile — fără efecte secundare, fără acces la DB.
import { COMMISSION_PERCENT } from './constants'

// Comisionul pentru o plată de chirie: procent fix din chirie (vezi COMMISSION_PERCENT).
export function rentCommission(rentAmount: number): number {
  return Math.round((rentAmount * COMMISSION_PERCENT) / 100)
}

// Comisionul la vânzare e degresiv: cu cât prețul e mai mare, cu atât procentul marginal scade.
// Aplicare pe tranșe (ca la impozitul pe venit) → funcție continuă și monoton crescătoare,
// fără „praguri" în care un preț mai mare ar produce un comision mai mic. Prețuri în RON.
const SALE_BRACKETS: { upTo: number; rate: number }[] = [
  { upTo: 250_000, rate: 0.03 }, // primii 250k → 3.0%
  { upTo: 500_000, rate: 0.025 }, // 250k–500k → 2.5%
  { upTo: 1_000_000, rate: 0.02 }, // 500k–1M → 2.0%
  { upTo: 2_500_000, rate: 0.015 }, // 1M–2.5M → 1.5%
  { upTo: Infinity, rate: 0.01 }, // peste 2.5M → 1.0%
]

// Comision minim — acoperă costurile fixe pe tranzacții mici.
export const SALE_COMMISSION_MIN = 1_500

export function saleCommission(priceRon: number): number {
  if (priceRon <= 0) return 0
  let remaining = priceRon
  let previousCap = 0
  let total = 0
  for (const { upTo, rate } of SALE_BRACKETS) {
    const slice = Math.min(remaining, upTo - previousCap)
    if (slice <= 0) break
    total += slice * rate
    remaining -= slice
    previousCap = upTo
    if (remaining <= 0) break
  }
  return Math.max(SALE_COMMISSION_MIN, Math.round(total))
}

// Procentul efectiv (comision / preț), util pentru afișare („~2,3% din preț").
export function saleCommissionRate(priceRon: number): number {
  if (priceRon <= 0) return 0
  return saleCommission(priceRon) / priceRon
}
