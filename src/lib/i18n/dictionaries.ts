// Dicționarele de traduceri. `ro` e sursa de adevăr a formei (tipul `Dictionary` derivă din ea);
// `en` trebuie să aibă exact aceleași chei (verificat în teste). Componentele citesc dicționarul
// prin `useDict()` (client) sau `getServerDictionary()` (server) și accesează direct `dict.nav.login`
// etc. — tipat, fără rezolvare de căi pe șiruri.
import type { Locale } from './config'

const ro = {
  meta: {
    title: 'Clavium.ro — Imobiliare fără intermediari',
    description:
      'Prima platformă din România unde găsești, negociezi și semnezi contractul imobiliar direct — vânzare, închiriere sau leasing, 100% digital.',
  },
  language: { label: 'Limbă', ro: 'Română', en: 'Engleză' },
  nav: {
    properties: 'Proprietăți',
    howItWorks: 'Cum funcționează',
    contracts: 'Contracte',
    pricing: 'Prețuri',
    dashboard: 'Cont',
    welcome: 'Bun venit',
    logout: 'Deconectare',
    login: 'Autentificare',
    register: 'Cont nou',
    createAccount: 'Creează cont',
    menu: 'Meniu',
  },
  hero: {
    eyebrow: 'Prima platformă imobiliară cu design modern',
    title: 'Real estate, construită ca un produs.',
    subtitle:
      'Găsești și semnezi contractul imobiliar într-o interfață curată, rapidă și sigură. Fără comision, fără agitație, complet digital.',
    ctaStart: 'Începe gratuit',
    ctaHow: 'Vezi cum funcționează',
    badge: '100% digital · semnătură QES',
    txTypeLabel: 'Tip tranzacție',
    txBuy: 'Cumpărare',
    txRent: 'Închiriere',
    txLease: 'Leasing',
    locationLabel: 'Locație',
    locationPlaceholder: 'Oraș sau cartier...',
    search: 'Caută',
    cities: 'Timișoara · Cluj-Napoca · București · Iași · Brașov · Oradea',
  },
  cta: {
    badge: 'Disponibil acum · Înregistrare gratuită',
    titleLine: 'Imobiliare moderne,',
    titleAccent: 'fără compromisuri.',
    subtitle:
      'Creează-ți contul gratuit și accesează listări, negociere și contracte într-o platformă construită pentru transparență și viteză.',
    createAccount: 'Creează cont gratuit',
    explore: 'Explorează proprietăți',
    finePrint: 'Fără card de credit · Fără abonament · Plătești doar la tranzacție reușită',
  },
  footer: {
    tagline: 'Prima platformă din România pentru tranzacții imobiliare curate, rapide și complet digitale.',
    colPlatform: 'Platformă',
    colLegal: 'Legal',
    colContact: 'Contact',
    properties: 'Proprietăți',
    howItWorks: 'Cum funcționează',
    createAccount: 'Creează cont',
    terms: 'Termeni și condiții',
    privacy: 'Politică de confidențialitate',
    hours: 'L-V 9-18',
    rights: 'Toate drepturile rezervate',
    compliance: 'Semnătură electronică conformă eIDAS · Legea 214/2024',
  },
}

export type Dictionary = typeof ro

const en: Dictionary = {
  meta: {
    title: 'Clavium.ro — Real estate without middlemen',
    description:
      'Romania’s first platform where you find, negotiate and sign your property contract directly — sale, rent or leasing, 100% digital.',
  },
  language: { label: 'Language', ro: 'Romanian', en: 'English' },
  nav: {
    properties: 'Properties',
    howItWorks: 'How it works',
    contracts: 'Contracts',
    pricing: 'Pricing',
    dashboard: 'Account',
    welcome: 'Welcome',
    logout: 'Log out',
    login: 'Sign in',
    register: 'Sign up',
    createAccount: 'Create account',
    menu: 'Menu',
  },
  hero: {
    eyebrow: 'The first real-estate platform with modern design',
    title: 'Real estate, built like a product.',
    subtitle:
      'Find and sign your property contract in a clean, fast and secure interface. No commission, no hassle, fully digital.',
    ctaStart: 'Start for free',
    ctaHow: 'See how it works',
    badge: '100% digital · QES signature',
    txTypeLabel: 'Transaction type',
    txBuy: 'Buy',
    txRent: 'Rent',
    txLease: 'Leasing',
    locationLabel: 'Location',
    locationPlaceholder: 'City or neighbourhood...',
    search: 'Search',
    cities: 'Timișoara · Cluj-Napoca · Bucharest · Iași · Brașov · Oradea',
  },
  cta: {
    badge: 'Available now · Free sign-up',
    titleLine: 'Modern real estate,',
    titleAccent: 'no compromises.',
    subtitle:
      'Create your free account and access listings, negotiation and contracts in a platform built for transparency and speed.',
    createAccount: 'Create a free account',
    explore: 'Explore properties',
    finePrint: 'No credit card · No subscription · You only pay on a successful transaction',
  },
  footer: {
    tagline: 'Romania’s first platform for clean, fast and fully digital real-estate transactions.',
    colPlatform: 'Platform',
    colLegal: 'Legal',
    colContact: 'Contact',
    properties: 'Properties',
    howItWorks: 'How it works',
    createAccount: 'Create account',
    terms: 'Terms & conditions',
    privacy: 'Privacy policy',
    hours: 'Mon-Fri 9-18',
    rights: 'All rights reserved',
    compliance: 'eIDAS-compliant electronic signature · Law 214/2024',
  },
}

export const dictionaries: Record<Locale, Dictionary> = { ro, en }

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}
