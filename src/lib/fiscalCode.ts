// Validatoare pentru identificatorii fiscali români (persoane juridice).

// CUI / CIF — cod de identificare fiscală, cu cifră de control.
// Acceptă opțional prefixul „RO" și spații. Algoritm standard cu cheia 753217532.
export function isValidCui(input: string): boolean {
  const digits = input.trim().replace(/^RO/i, '').replace(/\s/g, '')
  if (!/^\d{2,10}$/.test(digits)) return false

  const control = Number(digits[digits.length - 1])
  const body = digits.slice(0, -1).padStart(9, '0')
  const key = '753217532'

  let sum = 0
  for (let i = 0; i < 9; i++) sum += Number(body[i]) * Number(key[i])

  let computed = (sum * 10) % 11
  if (computed === 10) computed = 0
  return computed === control
}

// Număr de înregistrare la Registrul Comerțului, ex: J40/1234/2020.
// Prefix J (societăți), F (PFA/II) sau C (cooperative) + cod județ + număr + an.
export function isValidRegNumber(input: string): boolean {
  return /^[JFC]\d{1,2}\/\d{1,7}\/\d{4}$/i.test(input.trim())
}
