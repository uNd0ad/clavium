'use client'

import { useEffect, useState } from 'react'

// Cronometru de cooldown pentru butoane (ex. retrimitere OTP): start() pornește
// numărătoarea inversă, iar `remaining` scade până la 0.
export function useCooldown(seconds = 30) {
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    if (remaining <= 0) return
    const timer = setTimeout(() => setRemaining((value) => value - 1), 1000)
    return () => clearTimeout(timer)
  }, [remaining])

  return {
    remaining,
    active: remaining > 0,
    start: () => setRemaining(seconds),
  }
}
