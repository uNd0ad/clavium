import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { headers } from 'next/headers'
import { Toaster } from 'sonner'
import CookieBanner from '@/components/layout/CookieBanner'
import DevNoticeBanner from '@/components/layout/DevNoticeBanner'
import { LocaleProvider } from '@/lib/i18n/client'
import { getServerDictionary } from '@/lib/i18n/server'
import { APP_URL } from '@/lib/constants'
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

// Metadatele urmează limba aleasă (cookie) — titlu/descriere + `og:locale`.
export async function generateMetadata(): Promise<Metadata> {
  const { locale, dict } = await getServerDictionary()
  return {
    // Bază pentru URL-uri absolute (OG/Twitter/canonical) — necesar ca og:image relativ să se rezolve.
    metadataBase: new URL(APP_URL),
    title: dict.meta.title,
    description: dict.meta.description,
    keywords: ['imobiliare', 'chirie', 'vânzare apartamente', 'contract electronic', 'semnătură digitală'],
    openGraph: {
      title: 'Clavium.ro',
      description: dict.meta.description,
      url: 'https://clavium.ro',
      siteName: 'Clavium.ro',
      locale: locale === 'en' ? 'en_US' : 'ro_RO',
      type: 'website',
    },
  }
}

// Aplică tema salvată (sau preferința sistemului) înainte de paint, ca să nu apară un flash.
const themeScript = `(function(){try{var e=localStorage.getItem('theme');var d=e?e==='dark':matchMedia('(prefers-color-scheme: dark)').matches;var c=document.documentElement.classList;d?c.add('dark'):c.remove('dark');}catch(_){}})();`

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Nonce-ul vine din middleware (CSP) — îl punem pe scriptul inline ca să treacă de politică.
  const [nonce, { locale, dict }] = await Promise.all([
    headers().then((h) => h.get('x-nonce') ?? undefined),
    getServerDictionary(),
  ])
  return (
    <html lang={locale} className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Browserul golește atributul `nonce` după încărcare (măsură anti-exfiltrare CSP),
            deci la hidratare clientul vede nonce="" iar serverul nonce-ul real — diferență
            așteptată, o marcăm explicit ca să nu producă avertisment de hidratare. */}
        <script nonce={nonce} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <LocaleProvider locale={locale} dict={dict}>
          {children}
          <CookieBanner />
          <DevNoticeBanner />
          <Toaster
            position="bottom-right"
            richColors
            closeButton
            toastOptions={{ style: { borderRadius: '18px', fontFamily: 'var(--font-inter)' } }}
          />
        </LocaleProvider>
      </body>
    </html>
  )
}
