import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import CookieBanner from '@/components/layout/CookieBanner'
import './globals.css'

// Font servit local prin next/font — fără request către Google Fonts CDN (și pentru GDPR).
const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700', '800'],
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" className={inter.variable}>
      <body>
        {children}
        <CookieBanner />
      </body>
    </html>
  )
}
