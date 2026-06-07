'use client'

import { create } from 'zustand'
import type { User } from '@/lib/types/auth'

interface AuthState {
  user: User | null
  token: string | null
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  reset: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  reset: () => set({ user: null, token: null }),
}))
