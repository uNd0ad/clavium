'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

// Sondaj o singură dată pentru tot dashboardul (sidebar + mobil consumă același context),
// ca să nu dublăm cererile. 60s e suficient și ușor pentru server.
const POLL_MS = 60_000

const UnreadContext = createContext<number>(0)
const SetUnreadContext = createContext<(value: number) => void>(() => {})

export function useUnreadCount() {
  return useContext(UnreadContext)
}

// Permite actualizarea optimistă a badge-ului (ex. la „marchează tot ca citit").
export function useSetUnreadCount() {
  return useContext(SetUnreadContext)
}

export function NotificationProvider({ initialCount, children }: { initialCount: number; children: ReactNode }) {
  const [count, setCount] = useState(initialCount)

  // Când serverul re-randează layout-ul (ex. după router.refresh la marcarea ca citit),
  // adoptăm noua valoare — fără efect, pattern „adjust state during render".
  const [prevInitial, setPrevInitial] = useState(initialCount)
  if (initialCount !== prevInitial) {
    setPrevInitial(initialCount)
    setCount(initialCount)
  }

  useEffect(() => {
    let active = true
    const fetchCount = async () => {
      if (document.visibilityState !== 'visible') return
      try {
        const res = await fetch('/api/notifications/unread', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        if (active && typeof data.count === 'number') setCount(data.count)
      } catch {
        // ignoră erorile tranzitorii de rețea
      }
    }
    const interval = setInterval(fetchCount, POLL_MS)
    window.addEventListener('focus', fetchCount)
    return () => {
      active = false
      clearInterval(interval)
      window.removeEventListener('focus', fetchCount)
    }
  }, [])

  return (
    <UnreadContext.Provider value={count}>
      <SetUnreadContext.Provider value={setCount}>{children}</SetUnreadContext.Provider>
    </UnreadContext.Provider>
  )
}
