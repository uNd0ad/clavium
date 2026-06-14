'use client'

import { Printer } from 'lucide-react'

// Deschide dialogul de printare al browserului → „Salvează ca PDF".
export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="btn-outline px-5 py-2.5 text-[12px]"
    >
      <Printer size={15} /> Descarcă / Printează
    </button>
  )
}
