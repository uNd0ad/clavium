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
  home: {
    renters: {
      eyebrow: 'Caut o locuință',
      title: 'Găsește-ți casa, direct de la proprietar.',
      subtitle: 'Fără comision de agenție, fără intermediari. Proprietari verificați, contract semnat 100% online.',
      browse: 'Vezi proprietățile',
      trust: 'Proprietari verificați · Contract QES · Plăți securizate',
      featuredTitle: 'Proprietăți recente',
    },
    owners: {
      eyebrow: 'Am o proprietate',
      title: 'Închiriază sau vinde — fără comisioane, în condițiile tale.',
      subtitle: 'Fă singur totul online, gratuit — sau lasă-ne pe noi să ne ocupăm de tot.',
      diyTitle: 'Self-service',
      diyDesc: 'Listezi gratuit, primești oferte și semnezi contractul cu semnătură electronică, fără comision.',
      diyBullets: ['Listare gratuită', 'Contracte + semnătură QES online', 'Plăți și chitanțe automate'],
      diyCta: 'Începe gratuit',
      managedTitle: 'Administrat de Clavium',
      managedDesc: 'Preluăm chiriașii, încasările și mentenanța. Tu primești venit pasiv, fără bătăi de cap.',
      managedBullets: ['Administrare de la 8%', 'Verificare chiriași', 'Evaluare, foto, juridic'],
      managedCta: 'Vreau să administrați voi',
    },
    developers: {
      eyebrow: 'Dezvoltatori & spații comerciale',
      title: 'Vinde sau închiriază în volum, complet digital.',
      subtitle: 'Pentru dezvoltatori și proprietari de spații: listare în masă, antecontracte QES la scară și suport dedicat.',
      bulkTitle: 'Ansambluri rezidențiale',
      bulkDesc: 'Vinde zeci de unități cu antecontracte și semnături electronice la scară.',
      officeTitle: 'Spații de birouri',
      officeDesc: 'Închiriază clădiri și etaje de birouri către companii, cu contracte 100% online.',
      commercialTitle: 'Spații comerciale',
      commercialDesc: 'Spații de retail și comerciale, de închiriat sau de vânzare, în toată țara.',
      cta: 'Programează o demonstrație',
    },
    how: {
      eyebrow: 'Cum funcționează',
      title: 'Totul online, de la căutare la cheie.',
      subtitle: 'Patru pași simpli, fără drumuri la notar și fără hârtii inutile.',
      steps: [
        { title: 'Caută & vizitează', desc: 'Găsești proprietatea potrivită și iei legătura direct cu proprietarul.' },
        { title: 'Negociază direct', desc: 'Trimiți oferta și urmărești totul transparent din contul tău.' },
        { title: 'Generezi contractul', desc: 'Contractul se construiește automat, gata pentru semnare.' },
        { title: 'Semnezi digital', desc: 'Semnătură electronică calificată (QES), cu valoare juridică deplină.' },
      ],
      ctaPrimary: 'Începe gratuit',
      ctaSecondary: 'Vezi proprietățile',
    },
  },
  devNotice: {
    message: 'Versiune de dezvoltare — platforma este în lucru, unele funcții pot fi incomplete.',
    dismiss: 'Închide anunțul',
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
  home: {
    renters: {
      eyebrow: 'Looking for a home',
      title: 'Find your home, straight from the owner.',
      subtitle: 'No agency commission, no middlemen. Verified owners, contract signed 100% online.',
      browse: 'Browse properties',
      trust: 'Verified owners · QES contract · Secure payments',
      featuredTitle: 'Recent properties',
    },
    owners: {
      eyebrow: 'I own a property',
      title: 'Rent it out or sell — no commissions, on your terms.',
      subtitle: 'Do it all yourself online, for free — or let us handle everything.',
      diyTitle: 'Self-service',
      diyDesc: 'List for free, receive offers and sign the contract with an electronic signature — no commission.',
      diyBullets: ['Free listing', 'Contracts + QES signing online', 'Automatic payments & receipts'],
      diyCta: 'Start free',
      managedTitle: 'Managed by Clavium',
      managedDesc: 'We handle tenants, collections and maintenance. You get passive income, hassle-free.',
      managedBullets: ['Management from 8%', 'Tenant screening', 'Valuation, photos, legal'],
      managedCta: 'Have us manage it',
    },
    developers: {
      eyebrow: 'Developers & commercial',
      title: 'Sell or lease in volume, fully digital.',
      subtitle: 'For developers and space owners: bulk listing, QES pre-contracts at scale, and a dedicated account.',
      bulkTitle: 'Residential developments',
      bulkDesc: 'Sell dozens of units with pre-contracts and electronic signatures at scale.',
      officeTitle: 'Office space',
      officeDesc: 'Lease office buildings and floors to companies, with 100% online contracts.',
      commercialTitle: 'Commercial spaces',
      commercialDesc: 'Retail and commercial spaces, for lease or sale, across the country.',
      cta: 'Book a demo',
    },
    how: {
      eyebrow: 'How it works',
      title: 'Everything online, from search to keys.',
      subtitle: 'Four simple steps — no trips to the notary, no useless paperwork.',
      steps: [
        { title: 'Search & visit', desc: 'Find the right property and contact the owner directly.' },
        { title: 'Negotiate directly', desc: 'Send your offer and track everything transparently from your account.' },
        { title: 'Generate the contract', desc: 'The contract is built automatically, ready to sign.' },
        { title: 'Sign digitally', desc: 'Qualified electronic signature (QES) with full legal value.' },
      ],
      ctaPrimary: 'Start free',
      ctaSecondary: 'Browse properties',
    },
  },
  devNotice: {
    message: 'Development preview — this platform is a work in progress, some features may be incomplete.',
    dismiss: 'Dismiss notice',
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
