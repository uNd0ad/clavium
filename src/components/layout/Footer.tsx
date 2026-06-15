export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[var(--bg)] text-[var(--muted)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-16">
          <div className="lg:col-span-1">
            <div className="font-sans text-2xl font-semibold text-[var(--text)] mb-4">
              Clavium<span className="italic text-[var(--brand)]">.ro</span>
            </div>
            <p className="text-sm leading-relaxed text-[var(--muted)]/85">
              Prima platformă din România pentru tranzacții imobiliare curate, rapide și complet digitale.
            </p>
          </div>

          {[
            {
              title: 'Platformă',
              links: [
                { label: 'Proprietăți', href: '/proprietati' },
                { label: 'Cum funcționează', href: '/#cum-functioneaza' },
                { label: 'Creează cont', href: '/auth/register' },
              ],
            },
            {
              title: 'Legal',
              links: [
                { label: 'Termeni și condiții', href: '/termeni' },
                { label: 'Politică de confidențialitate', href: '/confidentialitate' },
                { label: 'ANPC', href: 'https://anpc.ro' },
                { label: 'SOL (litigii online)', href: 'https://ec.europa.eu/consumers/odr' },
              ],
            },
            {
              title: 'Contact',
              links: [
                { label: 'contact@clavium.ro', href: 'mailto:contact@clavium.ro' },
                { label: 'Timișoara, România', href: '#' },
                { label: 'L-V 9-18', href: '#' },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-2xs tracking-[0.22em] uppercase text-[var(--brand)] mb-6 font-semibold">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-sm text-[var(--muted)]/80 hover:text-[var(--text)] transition-colors no-underline">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-[var(--border)] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[var(--muted)]/70">
            © {year} Clavium.ro · Toate drepturile rezervate
          </p>
          <span className="text-xs tracking-[0.18em] uppercase text-[var(--muted)]/70">
            Semnătură electronică conformă eIDAS · Legea 214/2024
          </span>
        </div>
      </div>
    </footer>
  )
}
