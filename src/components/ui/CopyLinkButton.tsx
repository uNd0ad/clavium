'use client'

import { useState } from 'react'
import { Link2 } from 'lucide-react'
import { toast } from 'sonner'
import Button from './Button'

type CopyLinkButtonProps = {
  path: string
  label?: string
  className?: string
}

export default function CopyLinkButton({ path, label = 'Copiază linkul', className }: CopyLinkButtonProps) {
  const [loading, setLoading] = useState(false)

  const copy = async () => {
    setLoading(true)
    try {
      const url = `${window.location.origin}${path}`
      await navigator.clipboard.writeText(url)
      toast.success('Link copiat în clipboard.')
    } catch {
      toast.error('Nu s-a putut copia linkul.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button type="button" variant="outline" loading={loading} onClick={copy} className={className}>
      <Link2 size={16} />
      {label}
    </Button>
  )
}
