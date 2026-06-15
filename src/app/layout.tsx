import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { headers } from 'next/headers'
import { Toaster } from 'sonner'
import CookieBanner from '@/components/layout/CookieBanner'
import './globals.css'

// Font servit local prin next/font — fără request către Google Fonts CDN (și pentru GDPR).
// Doar greutățile folosite efectiv în aplicație (400/500/600). latin-ext e necesar
// pentru diacriticele românești (ș, ț). Mai puține fișiere de font = build/dev mai ușor.
const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Clavium.ro — Imobiliare fără intermediari',
  description: 'Prima platformă din România unde găsești, negociezi și semnezi contractul imobiliar direct — vânzare, închiriere sau leasing, 100% digital.',
  keywords: ['imobiliare', 'chirie', 'vânzare apartamente', 'contract electronic', 'semnătură digitală'],
  openGraph: {
    title: 'Clavium.ro',
    description: 'Imobiliare fără intermediari. Contracte semnate direct pe platformă.',
    url: 'https://clavium.ro',
    siteName: 'Clavium.ro',
    locale: 'ro_RO',
    type: 'website',
  },
}

// Aplică tema salvată (sau preferința sistemului) înainte de paint, ca să nu apară un flash.
const themeScript = `(function(){try{var e=localStorage.getItem('theme');var d=e?e==='dark':matchMedia('(prefers-color-scheme: dark)').matches;var c=document.documentElement.classList;d?c.add('dark'):c.remove('dark');}catch(_){}})();`

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Nonce-ul vine din middleware (CSP) — îl punem pe scriptul inline ca să treacă de politică.
  const nonce = (await headers()).get('x-nonce') ?? undefined
  return (
    <html lang="ro" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Browserul golește atributul `nonce` după încărcare (măsură anti-exfiltrare CSP),
            deci la hidratare clientul vede nonce="" iar serverul nonce-ul real — diferență
            așteptată, o marcăm explicit ca să nu producă avertisment de hidratare. */}
        <script nonce={nonce} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        {children}
        <CookieBanner />
        <Toaster
          position="bottom-right"
          richColors
          closeButton
          toastOptions={{ style: { borderRadius: '18px', fontFamily: 'var(--font-inter)' } }}
        />
      </body>
    </html>
  )
}
