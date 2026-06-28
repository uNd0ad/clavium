import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/apiAuth'
import { errorMessage } from '@/lib/apiError'
import { getContractDetail } from '@/lib/contractDocument'
import { buildContractPdf } from '@/lib/contractPdf'

// Descarcă/deschide contractul ca PDF. Generare la cerere (deterministă din datele contractului):
// previzualizare înainte de semnături, document cu audit QES după. `getContractDetail` autorizează
// deja (părți + admin) — un 404 acoperă atât inexistența, cât și lipsa accesului, fără a divulga
// existența contractului. Necesită runtime Node (fs + pdf-lib), nu edge.
export const runtime = 'nodejs'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireUser()
  if (error) return error

  try {
    const { id } = await params
    const detail = await getContractDetail(id, user)
    if (!detail) return NextResponse.json({ error: 'Contractul nu există.' }, { status: 404 })

    const bytes = await buildContractPdf(detail.doc, { documentHash: detail.documentHash })
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${detail.doc.number}.pdf"`,
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (err) {
    return NextResponse.json({ error: errorMessage(err) }, { status: 400 })
  }
}
