import type { ReactNode } from 'react'

type DashboardHeaderProps = {
  eyebrow: string
  title: string
  accent?: string
  description?: string
  action?: ReactNode
}

// Antet de pagină în limbajul vizual al homepage-ului: eyebrow `section-label`
// (cu liniuța brand), titlu mare cu tracking strâns și un accent colorat opțional.
export default function DashboardHeader({ eyebrow, title, accent, description, action }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div>
        <span className="section-label">{eyebrow}</span>
        <h1 className="mt-4 font-sans text-[clamp(28px,3.2vw,40px)] font-semibold leading-tight tracking-[-0.03em] text-[var(--text)]">
          {title}
          {accent ? <span className="text-[var(--brand)]"> {accent}</span> : null}
        </h1>
        {description ? <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
