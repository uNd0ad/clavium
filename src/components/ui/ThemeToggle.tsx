'use client'

import { useSyncExternalStore } from 'react'
import { Sun, Moon } from 'lucide-react'

// Tema inițială e aplicată de scriptul no-flash din layout, înainte de hidratare.
// Aici doar citim/comutăm clasa `dark` de pe <html> și persistăm alegerea.
const listeners = new Set<() => void>()

function subscribe(callback: () => void) {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

function isDark() {
  return document.documentElement.classList.contains('dark')
}

export default function ThemeToggle({ className = '' }: { className?: string }) {
  // getServerSnapshot = false (luminos) ca să evităm nepotrivirea de hidratare; clientul corectează.
  const dark = useSyncExternalStore(subscribe, isDark, () => false)

  const toggle = () => {
    const next = !isDark()
    document.documentElement.classList.toggle('dark', next)
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light')
    } catch {
      // localStorage indisponibil — comutarea funcționează, dar nu se persistă
    }
    listeners.forEach((listener) => listener())
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Comută pe modul luminos' : 'Comută pe modul întunecat'}
      title={dark ? 'Mod luminos' : 'Mod întunecat'}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted)] transition hover:text-[var(--brand)] ${className}`}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
