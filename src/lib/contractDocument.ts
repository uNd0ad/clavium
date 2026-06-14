import { prisma } from './prisma'
import { formatRon } from './dashboardData'
import type { SessionUser } from './session'

type Party = {
  role: 'Proprietar' | 'Chiriaș' | 'Vânzător' | 'Cumpărător'
  kind: 'PERSON' | 'COMPANY'
  name: string
  lines: string[]
}

export type ContractDocument = {
  id: string
  number: string
  type: 'INCHIRIERE' | 'VANZARE'
  statusLabel: string
  property: { title: string; location: string }
  owner: Party
  tenant: Party
  rent: string
  price: string
  deposit: string
  months: number
  dueDay: number
  startDate: string
  endDate: string
  clauses: string | null
  signedByOwner: boolean
  signedByClient: boolean
  qes: boolean
}

type PartyUser = {
  firstName: string
  lastName: string
  email: string
  accountType: string
  companyName: string | null
  companyCui: string | null
  companyReg: string | null
  companyAddress: string | null
}

const STATUS_LABEL: Record<string, string> = {
  IN_ASTEPTARE: 'În așteptarea semnăturilor',
  SEMNAT: 'Semnat parțial',
  ACTIV: 'Activ',
  INCHEIAT: 'Încheiat',
}

function formatDate(date: Date | null) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}

function buildParty(role: Party['role'], user: PartyUser): Party {
  if (user.accountType === 'COMPANY') {
    return {
      role,
      kind: 'COMPANY',
      name: user.companyName || '—',
      lines: [
        user.companyCui ? `CUI/CIF: ${user.companyCui}` : '',
        user.companyReg ? `Nr. înregistrare: ${user.companyReg}` : '',
        user.companyAddress ? `Sediu: ${user.companyAddress}` : '',
        `Reprezentant legal: ${user.firstName} ${user.lastName}`,
        `Email: ${user.email}`,
      ].filter(Boolean),
    }
  }
  return {
    role,
    kind: 'PERSON',
    name: `${user.firstName} ${user.lastName}`,
    lines: [`Email: ${user.email}`],
  }
}

export type ContractDetail = {
  doc: ContractDocument
  isOwner: boolean
  canEdit: boolean
  canEditSale: boolean
  canSign: boolean
  canPay: boolean
  dueAmount: string | null
  dueType: 'CHIRIE' | 'AVANS' | 'REST' | null
  // Valori brute pentru formularul de termeni (închiriere).
  terms: { rent: number; deposit: number; months: number; dueDay: number; startDate: string; clauses: string }
  // Valori brute pentru formularul de termeni (vânzare).
  saleTerms: { price: number; deposit: number; clauses: string }
}

// Încarcă, autorizează (părți + admin) și construiește documentul de contract.
export async function getContractDetail(contractId: string, user: SessionUser): Promise<ContractDetail | null> {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      property: true,
      owner: true,
      tenant: true,
      payments: {
        where: { type: { in: ['CHIRIE', 'AVANS', 'REST'] }, status: 'IN_CURS' },
        orderBy: [{ dueDate: 'asc' }, { createdAt: 'asc' }],
        take: 1,
      },
    },
  })
  if (!contract) return null

  const isOwner = contract.ownerId === user.id
  const isTenant = contract.tenantId === user.id
  if (!isOwner && !isTenant && user.role !== 'ADMIN') return null

  const isSale = contract.type === 'VANZARE'
  const signable = contract.status === 'IN_ASTEPTARE' || contract.status === 'SEMNAT'
  const canSign =
    signable &&
    ((contract.ownerId === user.id && !contract.signedByOwner) ||
      (contract.tenantId === user.id && !contract.signedByClient))
  const due = contract.payments[0]

  const doc: ContractDocument = {
    id: contract.id,
    number: `${isSale ? 'ACV' : 'CTR'}-${contract.id.slice(0, 8).toUpperCase()}`,
    type: isSale ? 'VANZARE' : 'INCHIRIERE',
    statusLabel: STATUS_LABEL[contract.status] ?? contract.status,
    property: { title: contract.property.title, location: contract.property.location },
    owner: buildParty(isSale ? 'Vânzător' : 'Proprietar', contract.owner),
    tenant: buildParty(isSale ? 'Cumpărător' : 'Chiriaș', contract.tenant),
    rent: formatRon(contract.rent),
    price: formatRon(contract.price),
    deposit: formatRon(contract.deposit),
    months: contract.months,
    dueDay: contract.dueDay,
    startDate: formatDate(contract.startDate),
    endDate: formatDate(contract.endDate),
    clauses: contract.clauses,
    signedByOwner: contract.signedByOwner,
    signedByClient: contract.signedByClient,
    qes: contract.qes,
  }

  return {
    doc,
    isOwner,
    canEdit: (isOwner || user.role === 'ADMIN') && !isSale && contract.status === 'IN_ASTEPTARE',
    canEditSale: (isOwner || user.role === 'ADMIN') && isSale && contract.status === 'IN_ASTEPTARE',
    canSign,
    canPay: contract.status === 'ACTIV' && contract.tenantId === user.id && Boolean(due),
    dueAmount: due ? formatRon(due.amount) : null,
    dueType: (due?.type as 'CHIRIE' | 'AVANS' | 'REST' | undefined) ?? null,
    terms: {
      rent: contract.rent,
      deposit: contract.deposit,
      months: contract.months,
      dueDay: contract.dueDay,
      startDate: (contract.startDate ?? new Date()).toISOString().slice(0, 10),
      clauses: contract.clauses ?? '',
    },
    saleTerms: {
      price: contract.price,
      deposit: contract.deposit,
      clauses: contract.clauses ?? '',
    },
  }
}
