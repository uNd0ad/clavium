import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { getNavUser } from '@/lib/session'

export const metadata: Metadata = {
  title: 'Termeni și condiții — Clavium.ro',
}

const sections = [
  {
    title: '1. Despre platformă',
    body: 'Clavium.ro este o platformă online care facilitează tranzacții imobiliare directe între proprietari și chiriași, fără intermediari. Platforma oferă instrumente pentru listarea proprietăților, transmiterea ofertelor, semnarea electronică a contractelor și evidența plăților.',
  },
  {
    title: '2. Conturi de utilizator',
    body: 'Pentru a folosi platforma este necesar un cont cu adresă de email și număr de telefon verificate. Ești responsabil pentru păstrarea confidențialității datelor de autentificare și pentru toate acțiunile efectuate din contul tău.',
  },
  {
    title: '3. Obligațiile utilizatorilor',
    body: 'Proprietarii garantează că dețin dreptul legal de a închiria proprietățile listate și că informațiile publicate sunt corecte. Chiriașii se obligă să transmită oferte cu intenție reală de contractare. Este interzisă publicarea de conținut fals, ilegal sau înșelător.',
  },
  {
    title: '4. Contracte și semnătură electronică',
    body: 'Contractele generate prin platformă se semnează electronic, în conformitate cu Regulamentul eIDAS și legislația română aplicabilă. Părțile contractante sunt proprietarul și chiriașul; Clavium.ro nu este parte în contractele de închiriere.',
  },
  {
    title: '5. Plăți și comisioane',
    body: 'Platforma percepe un comision pentru tranzacțiile procesate, afișat transparent înainte de fiecare plată. Plățile chiriei se efectuează prin procesatori de plăți autorizați.',
  },
  {
    title: '6. Limitarea răspunderii',
    body: 'Clavium.ro nu răspunde pentru neexecutarea obligațiilor contractuale dintre proprietari și chiriași și nu garantează starea fizică sau juridică a proprietăților listate. Platforma este furnizată „ca atare", fără garanții de disponibilitate neîntreruptă.',
  },
  {
    title: '7. Încetarea utilizării',
    body: 'Îți poți dezactiva contul oricând din pagina de profil. Ne rezervăm dreptul de a suspenda conturile care încalcă acești termeni.',
  },
  {
    title: '8. Contact',
    body: 'Pentru întrebări legate de acești termeni: contact@clavium.ro. Pentru soluționarea alternativă a litigiilor poți apela la ANPC (anpc.ro) sau platforma europeană SOL.',
  },
]

export default async function TermsPage() {
  const navUser = await getNavUser()
  return (
    <>
      <Navbar initialUser={navUser} />
      <main className="mx-auto min-h-screen max-w-4xl px-6 pb-24 pt-36 lg:px-12">
        <p className="section-label">Legal</p>
        <h1 className="mt-4 text-4xl font-semibold">Termeni și condiții</h1>
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
