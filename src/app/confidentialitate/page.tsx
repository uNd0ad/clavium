import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { getNavUser } from '@/lib/session'

export const metadata: Metadata = {
  title: 'Politica de confidențialitate — Vatrio.ro',
}

const sections = [
  {
    title: '1. Ce date colectăm',
    body: 'Colectăm datele furnizate la înregistrare (nume, prenume, email, număr de telefon, parolă criptată), datele tranzacțiilor efectuate prin platformă (proprietăți, oferte, contracte, plăți) și date tehnice strict necesare funcționării (cookie de sesiune).',
  },
  {
    title: '2. De ce le colectăm',
    body: 'Datele sunt folosite exclusiv pentru funcționarea platformei: autentificare, verificarea identității prin OTP, generarea contractelor, evidența plăților și notificări legate de contul tău. Nu folosim datele în scop de marketing fără consimțământ separat și nu le vindem terților.',
  },
  {
    title: '3. Temeiul legal',
    body: 'Prelucrarea se bazează pe executarea contractului de servicii (art. 6 alin. 1 lit. b GDPR), pe obligații legale (evidențe fiscale) și pe interesul legitim de a securiza platforma.',
  },
  {
    title: '4. Cât timp păstrăm datele',
    body: 'Datele contului sunt păstrate cât timp contul este activ. Datele contractelor și plăților se păstrează conform obligațiilor legale de arhivare. Codurile OTP expiră în 10 minute și sunt stocate criptografic (hash).',
  },
  {
    title: '5. Drepturile tale',
    body: 'Ai dreptul de acces, rectificare, ștergere, restricționare, portabilitate și opoziție. Îți poți descărca toate datele din pagina de profil („Descarcă datele mele") și îți poți dezactiva contul oricând. Pentru cereri suplimentare: contact@vatrio.ro. Te poți adresa și ANSPDCP (dataprotection.ro).',
  },
  {
    title: '6. Cookies',
    body: 'Folosim un singur cookie strict necesar (vatrio_token) pentru menținerea sesiunii de autentificare. Nu folosim cookie-uri de tracking sau publicitate.',
  },
  {
    title: '7. Securitate',
    body: 'Parolele sunt criptate cu bcrypt, codurile OTP sunt stocate ca hash, sesiunile pot fi revocate, iar accesul la date este restricționat pe roluri. Transferurile de date se fac exclusiv prin conexiuni criptate (TLS).',
  },
]

export default async function PrivacyPage() {
  const navUser = await getNavUser()
  return (
    <>
      <Navbar initialUser={navUser} />
      <main className="mx-auto min-h-screen max-w-4xl px-6 pb-24 pt-36 lg:px-12">
        <p className="section-label">Legal</p>
        <h1 className="mt-4 text-4xl font-semibold">Politica de confidențialitate</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">Ultima actualizare: 13 iunie 2026</p>
        <div className="mt-12 space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <p className="mt-3 text-base leading-7 text-[var(--muted)]">{section.body}</p>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  )
}
