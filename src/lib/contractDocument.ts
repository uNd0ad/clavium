import { prisma } from './prisma'
import { formatRon } from './dashboardData'
import type { SessionUser } from './session'

type Party = {
  role: 'Proprietar' | 'Chiriaș'
  kind: 'PERSON' | 'COMPANY'
  name: string
  lines: string[]
}

export type ContractDocument = {
  id: string
  number: string
  statusLabel: string
  property: { title: string; location: string }
  owner: Party
  tenant: Party
  rent: string
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
  canSign: boolean
  canPay: boolean
  dueAmount: string | null
  // Valori brute pentru formularul de termeni.
  terms: { rent: number; deposit: number; months: number; dueDay: number; startDate: string; clauses: string }
}

// Încarcă, autorizează (părți + admin) și construiește documentul de contract.
export async function getContractDetail(contractId: string, user: SessionUser): Promise<ContractDetail | null> {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      property: true,
      owner: true,
      tenant: true,
      payments: { where: { type: 'CHIRIE', status: 'IN_CURS' }, orderBy: { dueDate: 'asc' }, take: 1 },
    },
  })
  if (!contract) return null

  const isOwner = contract.ownerId === user.id
  const isTenant = contract.tenantId === user.id
  if (!isOwner && !isTenant && user.role !== 'ADMIN') return null

  const signable = contract.status === 'IN_ASTEPTARE' || contract.status === 'SEMNAT'
  const canSign =
    signable &&
    ((contract.ownerId === user.id && !contract.signedByOwner) ||
      (contract.tenantId === user.id && !contract.signedByClient))
  const due = contract.payments[0]

  const doc: ContractDocument = {
    id: contract.id,
    number: `CTR-${contract.id.slice(0, 8).toUpperCase()}`,
    statusLabel: STATUS_LABEL[contract.status] ?? contract.status,
    property: { title: contract.property.title, location: contract.property.location },
    owner: buildParty('Proprietar', contract.owner),
    tenant: buildParty('Chiriaș', contract.tenant),
    rent: formatRon(contract.rent),
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
    canEdit: (isOwner || user.role === 'ADMIN') && contract.status === 'IN_ASTEPTARE',
    canSign,
    canPay: contract.status === 'ACTIV' && contract.tenantId === user.id && Boolean(due),
    dueAmount: due ? formatRon(due.amount) : null,
    terms: {
      rent: contract.rent,
      deposit: contract.deposit,
      months: contract.months,
      dueDay: contract.dueDay,
      startDate: (contract.startDate ?? new Date()).toISOString().slice(0, 10),
      clauses: contract.clauses ?? '',
    },
  }
}
