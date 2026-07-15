// Chitanță/factură PDF pentru o plată, generată la cerere cu pdf-lib (reutilizează fonturile Noto
// și motorul de layout din contractPdf.ts, pentru diacritice corecte pe serverless).
import { PDFDocument } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import { Cursor, REGULAR_BYTES, BOLD_BYTES, MUTED } from './contractPdf'

export type ReceiptData = {
  reference: string
  typeLabel: string
  amount: string // formatat (ex. „1.500 RON")
  paidAt: string
  payerName: string
  payerEmail: string
  propertyTitle: string
  contractNumber: string
  isInvoice: boolean // COMISION → factură (cu TVA inclus); altfel chitanță
}

// Rând etichetă/valoare aliniat.
function row(cur: Cursor, label: string, value: string) {
  cur.text(label, { size: 8.5, bold: true, color: MUTED })
  cur.gap(1)
  cur.text(value, { size: 11 })
  cur.gap(8)
}

export async function buildReceiptPdf(data: ReceiptData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  pdf.registerFontkit(fontkit)
  const regular = await pdf.embedFont(REGULAR_BYTES, { subset: true })
  const bold = await pdf.embedFont(BOLD_BYTES, { subset: true })
  const cur = new Cursor(pdf, regular, bold)

  const docTitle = data.isInvoice ? 'FACTURĂ' : 'CHITANȚĂ'
  pdf.setTitle(`${docTitle} ${data.reference}`)
  pdf.setProducer('Vatrio.ro')

  cur.text('Vatrio.ro', { size: 9, bold: true, color: MUTED })
  cur.gap(2)
  cur.text(docTitle, { size: 22, bold: true })
  cur.gap(2)
  cur.text(`Seria/Nr.: ${data.reference}`, { size: 10, color: MUTED })
  cur.rule()

  row(cur, 'Plătitor', `${data.payerName} (${data.payerEmail})`)
  row(cur, 'Descriere', `${data.typeLabel} — ${data.propertyTitle}`)
  row(cur, 'Contract', data.contractNumber)
  row(cur, 'Data plății', data.paidAt)
  cur.rule()

  cur.text('Total achitat', { size: 8.5, bold: true, color: MUTED })
  cur.gap(1)
  cur.text(data.amount, { size: 18, bold: true })
  cur.gap(6)
  if (data.isInvoice) {
    cur.text('Suma include TVA, unde este cazul, conform legislației în vigoare.', { size: 8.5, color: MUTED, lineGap: 2 })
  }

  cur.rule()
  cur.text(
    'Document generat electronic de Vatrio.ro. Pentru contracte și plăți, accesează contul tău.',
    { size: 8, color: MUTED, lineGap: 2 }
  )

  return pdf.save()
}
