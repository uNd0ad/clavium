'use client'

import { createContext, useContext } from 'react'
import type { Locale } from './config'
import type { Dictionary } from './dictionaries'

type I18nValue = { locale: Locale; dict: Dictionary }

const I18nContext = createContext<I18nValue | null>(null)

// Furnizat din root layout cu limba + dicționarul citite pe server (din cookie).
export function LocaleProvider({ locale, dict, children }: I18nValue & { children: React.ReactNode }) {
  return <I18nContext.Provider value={{ locale, dict }}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n trebuie folosit în interiorul LocaleProvider')
  return ctx
}

// Scurtătură când ai nevoie doar de dicționar.
export function useDict(): Dictionary {
  return useI18n().dict
}
