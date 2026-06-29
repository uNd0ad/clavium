import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/apiAuth'
import { errorMessage } from '@/lib/apiError'
import { getReceiptData } from '@/lib/receipts'
import { buildReceiptPdf } from '@/lib/receiptPdf'

// Descarcă chitanța/factura PDF a unei plăți finalizate. `getReceiptData` autorizează (plătitor /
// proprietar / admin); un 404 acoperă atât inexistența, cât și lipsa accesului. Runtime Node (pdf-lib).
export const runtime = 'nodejs'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireUser()
  if (error) return error

  try {
    const { id } = await params
    const data = await getReceiptData(id, user)
    if (!data) return NextResponse.json({ error: 'Documentul nu este disponibil.' }, { status: 404 })

    const bytes = await buildReceiptPdf(data)
    const prefix = data.isInvoice ? 'Factura' : 'Chitanta'
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${prefix}-${data.reference}.pdf"`,
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (err) {
    return NextResponse.json({ error: errorMessage(err) }, { status: 400 })
  }
}
