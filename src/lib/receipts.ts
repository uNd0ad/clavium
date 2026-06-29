// Pregătirea datelor pentru chitanța/factura PDF a unei plăți + autorizare. Doar plățile finalizate
// au document. Plătitorul, proprietarul contractului și adminul pot descărca documentul.
import { prisma } from './prisma'
import { formatRon } from './dashboardData'
import type { SessionUser } from './session'
import type { ReceiptData } from './receiptPdf'

const TYPE_LABELS: Record<string, string> = {
  CHIRIE: 'Chirie',
  AVANS: 'Avans (arvună)',
  REST: 'Diferență preț (rest de plată)',
  COMISION: 'Comision platformă',
  REFUND: 'Rambursare',
  GARANTIE: 'Garanție',
}

function contractNumber(contract: { id: string; type: string }): string {
  return `${contract.type === 'VANZARE' ? 'ACV' : 'CTR'}-${contract.id.slice(0, 8).toUpperCase()}`
}

export async function getReceiptData(paymentId: string, user: SessionUser): Promise<ReceiptData | null> {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { user: true, contract: { include: { property: true } } },
  })
  if (!payment || !payment.contract) return null
  if (payment.status !== 'FINALIZATA') return null

  // Autorizare: plătitorul, proprietarul contractului sau un admin.
  const isPayer = payment.userId === user.id
  const isOwner = payment.contract.ownerId === user.id
  if (!isPayer && !isOwner && user.role !== 'ADMIN') return null

  return {
    reference: payment.reference,
    typeLabel: TYPE_LABELS[payment.type] ?? payment.type,
    amount: formatRon(payment.amount),
    paidAt: new Intl.DateTimeFormat('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' }).format(payment.paidAt ?? payment.createdAt),
    payerName: `${payment.user.firstName} ${payment.user.lastName}`,
    payerEmail: payment.user.email,
    propertyTitle: payment.contract.property?.title ?? 'imobil',
    contractNumber: contractNumber(payment.contract),
    isInvoice: payment.type === 'COMISION',
  }
}
