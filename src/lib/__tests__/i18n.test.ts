import { describe, it, expect } from 'vitest'
import { dictionaries, getDictionary } from '@/lib/i18n/dictionaries'
import { isLocale, LOCALES, DEFAULT_LOCALE } from '@/lib/i18n/config'

// Strânge recursiv toate căile de chei (ex. "nav.login") dintr-un obiect dicționar.
function keyPaths(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) => {
    const path = prefix ? `${prefix}.${k}` : k
    return typeof v === 'object' && v !== null ? keyPaths(v as Record<string, unknown>, path) : [path]
  })
}

describe('i18n', () => {
  it('engleza are exact aceleași chei ca româna', () => {
    const ro = keyPaths(dictionaries.ro).sort()
    const en = keyPaths(dictionaries.en).sort()
    expect(en).toEqual(ro)
  })

  it('toate valorile sunt șiruri ne-goale, în ambele limbi', () => {
    for (const locale of LOCALES) {
      const flat = JSON.stringify(dictionaries[locale])
      expect(flat).not.toContain('""') // nicio valoare goală
    }
  })

  it('getDictionary întoarce traducerile corecte', () => {
    expect(getDictionary('en').nav.login).toBe('Sign in')
    expect(getDictionary('ro').nav.login).toBe('Autentificare')
  })

  it('isLocale validează codurile de limbă', () => {
    expect(isLocale('ro')).toBe(true)
    expect(isLocale('en')).toBe(true)
    expect(isLocale('fr')).toBe(false)
    expect(isLocale(undefined)).toBe(false)
    expect(LOCALES).toContain(DEFAULT_LOCALE)
  })
})
