'use client'

import { useEffect } from 'react'

// Activează snap-ul de „slide deck" doar cât timp homepage-ul e montat (clasa pe <html>), ca
// celelalte pagini să nu fie afectate. CSS-ul aferent stă în globals.css (`html.snap-home`).
export default function SlideSnap() {
  useEffect(() => {
    const el = document.documentElement
    el.classList.add('snap-home')
    return () => el.classList.remove('snap-home')
  }, [])
  return null
}
