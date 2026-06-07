import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="ro">
      <body>{children}</body>
    </html>
  )
}
