'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import clsx from 'clsx'

const links = [
  { label: 'Proprietăți', href: '#proprietati' },
  { label: 'Cum funcționează', href: '#cum-functioneaza' },
  { label: 'Contracte', href: '#contracte' },
  { label: 'Prețuri', href: '#preturi' },
]

export default function Navbar() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ firstName: string; lastName: string; email: string } | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', { cache: 'no-store' })
        if (!response.ok) return setCurrentUser(null)
        const data = await response.json()
        setCurrentUser(data.user || null)
      } catch {
        setCurrentUser(null)
      }
    }
    fetchUser()
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setCurrentUser(null)
    router.push('/')
  }

  return (
    <>
      <nav
        className={clsx(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500 shadow-sm',
          scrolled
            ? 'bg-white/95 backdrop-blur-md border-b border-[var(--border)] py-4'
            : 'bg-white/95 lg:bg-transparent lg:backdrop-blur-none lg:py-7 py-4 backdrop-blur-sm'
        )}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
          <a href="/" className="font-sans text-xl font-semibold tracking-wide text-[var(--text)] no-underline">
            Clavium<span className="text-[var(--brand)]">.ro</span>
          </a>

          <div className="hidden lg:flex items-center gap-10">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-[12px] tracking-[0.08em] uppercase text-[var(--muted)] hover:text-[var(--text)] transition-colors duration-200 no-underline"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4">
            {currentUser ? (
              <>
                <span className="text-[12px] tracking-[0.08em] uppercase text-[var(--text)]">
                  {`Bun venit, ${currentUser.firstName}`}
                </span>
                <button onClick={handleLogout} className="btn-outline text-[12px] px-6 py-3">
                  Deconectare
                </button>
              </>
            ) : (
              <>
                <a href="/auth/login" className="text-[12px] tracking-[0.08em] uppercase text-[var(--muted)] hover:text-[var(--text)] transition-colors no-underline">
                  Autentificare
                </a>
                <a href="/auth/register" className="btn-primary text-[12px] px-6 py-3">
                  Cont nou →
                </a>
              </>
            )}
          </div>

          <button
            className="lg:hidden p-2 text-[var(--text)]"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Meniu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      <div
        className={clsx(
          'fixed inset-0 z-40 bg-white/85 backdrop-blur-xl flex flex-col justify-center px-8 transition-all duration-500 lg:hidden',
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      >
        <div className="space-y-8 mt-16">
          {links.map((l, i) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block font-sans text-[32px] font-medium text-[var(--text)] no-underline hover:text-[var(--brand)] transition-colors"
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              {l.label}
            </a>
          ))}
          <div className="pt-8 border-t border-[var(--border)] flex flex-col gap-4">
            {currentUser ? (
              <button onClick={handleLogout} className="btn-outline w-full justify-center">
                Deconectare
              </button>
            ) : (
              <>
                <a href="/auth/login" className="btn-outline w-full justify-center">
                  Autentificare
                </a>
                <a href="/auth/register" className="btn-primary w-full justify-center">
                  Creează cont →
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
