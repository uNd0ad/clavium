// Logica „banilor care curg înapoi": restituirea garanției (închiriere), regulile arvunei
// (vânzare) și anularea antecontractului. Separat de server actions ca să fie testabil.
//
// Notă privind banii reali: platforma nu păstrează încă fondurile în escrow (vezi payouts —
// Stripe Connect, în roadmap). Până atunci, aceste mișcări sunt înregistrate ca rânduri în
// registrul `Payment` (sursa de adevăr pentru sume datorate), iar restituirea efectivă prin
// Stripe se va lega de aceleași puncte odată ce escrow-ul există (vezi `refundPayment`).
import { prisma } from './prisma'
import { notify } from './notify'
import { paymentReference } from './hash'
import { formatRon } from './dashboardData'
import { addMonths } from './contractDates'
import { recordAuditSafe } from './audit'
import type { SessionUser } from './session'

export type CloseResult = { ok: true; message: string } | { ok: false; error: string }

function authorizedOnContract(user: SessionUser, ownerId: string, tenantId: string): boolean {
  return user.role === 'ADMIN' || ownerId === user.id || tenantId === user.id
}

// Restituie garanția (depozitul) la finalul unui contract de închiriere, cu eventuale rețineri
// pentru daune. Doar proprietarul/adminul. Idempotent prin `depositStatus` (HELD → o singură dată).
export async function returnRentalDeposit(
  contractId: string,
  user: SessionUser,
  opts: { deduction?: number; reason?: string }
): Promise<CloseResult> {
  const contract = await prisma.contract.findUnique({ where: { id: contractId }, include: { property: true } })
  if (!contract) return { ok: false, error: 'Contractul nu există.' }
  if (contract.type !== 'INCHIRIERE') return { ok: false, error: 'Garanția se aplică doar contractelor de închiriere.' }
  if (user.role !== 'ADMIN' && contract.ownerId !== user.id) return { ok: false, error: 'Nu ai permisiunea necesară.' }
  if (contract.status !== 'INCHEIAT' && contract.status !== 'ANULAT') {
    return { ok: false, error: 'Garanția se restituie după încheierea contractului.' }
  }
  if (contract.depositStatus !== 'HELD') return { ok: false, error: 'Garanția a fost deja procesată.' }
  if (contract.deposit <= 0) return { ok: false, error: 'Contractul nu are garanție de restituit.' }

  const deduction = Math.round(opts.deduction ?? 0)
  if (!Number.isFinite(deduction) || deduction < 0 || deduction > contract.deposit) {
    return { ok: false, error: 'Suma reținută pentru daune este invalidă.' }
  }
  const returned = contract.deposit - deduction
  const depositStatus = deduction === 0 ? 'RETURNED' : returned === 0 ? 'FORFEITED' : 'PARTIAL'

  await prisma.$transaction(async (tx) => {
    if (returned > 0) {
      await tx.payment.create({
        data: {
          reference: paymentReference(),
          userId: contract.tenantId,
          contractId,
          amount: returned,
          type: 'REFUND',
          status: 'FINALIZATA',
          paidAt: new Date(),
        },
      })
    }
    if (deduction > 0) {
      await tx.payment.create({
        data: {
          reference: paymentReference(),
          userId: contract.ownerId,
          contractId,
          amount: deduction,
          type: 'DAUNE',
          status: 'FINALIZATA',
          paidAt: new Date(),
        },
      })
    }
    await tx.contract.update({
      where: { id: contractId },
      data: { depositStatus, cancelReason: opts.reason ?? contract.cancelReason },
    })
  })

  const title = contract.property.title
  await notify(
    contract.tenantId,
    'Garanție restituită',
    returned > 0
      ? `Ți-au fost restituiți ${formatRon(returned)} din garanția pentru „${title}”` +
          (deduction > 0 ? `; s-au reținut ${formatRon(deduction)} pentru daune.` : '.')
      : `Garanția pentru „${title}” a fost reținută integral pentru daune.`,
    returned > 0 ? 'success' : 'warning'
  )
  await recordAuditSafe({
    actorId: user.id,
    action: 'DEPOSIT_RETURNED',
    entityType: 'CONTRACT',
    entityId: contractId,
    metadata: { deposit: contract.deposit, returned, deduction, depositStatus, reason: opts.reason ?? null },
  })
  return { ok: true, message: `Garanție procesată: restituit ${formatRon(returned)}, reținut ${formatRon(deduction)}.` }
}

// Anulează un antecontract de vânzare aplicând regulile arvunei (Cod civil art. 1544):
//   - cumpărătorul se retrage → pierde arvuna (rămâne la vânzător);
//   - vânzătorul se retrage → restituie dublul arvunei cumpărătorului;
//   - anulare administrativă (admin) / fără arvună plătită → restituire simplă, fără penalizare.
export async function cancelSaleContract(
  contractId: string,
  user: SessionUser,
  opts: { reason?: string }
): Promise<CloseResult> {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: { property: true, payments: true },
  })
  if (!contract) return { ok: false, error: 'Contractul nu există.' }
  if (contract.type !== 'VANZARE') return { ok: false, error: 'Doar antecontractele de vânzare se anulează aici.' }
  if (!authorizedOnContract(user, contract.ownerId, contract.tenantId)) {
    return { ok: false, error: 'Nu ai permisiunea necesară.' }
  }
  if (contract.status === 'INCHEIAT') return { ok: false, error: 'Vânzarea e finalizată; nu mai poate fi anulată.' }
  if (contract.status === 'ANULAT') return { ok: false, error: 'Antecontractul este deja anulat.' }

  const arvuna = contract.deposit
  const arvunaPaid = arvuna > 0 && contract.payments.some((p) => p.type === 'AVANS' && p.status === 'FINALIZATA')
  const party = user.role === 'ADMIN' ? 'ADMIN' : contract.ownerId === user.id ? 'SELLER' : 'BUYER'

  // Determină mișcarea de bani și starea arvunei.
  let refundToBuyer = 0
  let depositStatus = 'NONE'
  let buyerMsg: string
  let sellerMsg: string

  if (!arvunaPaid) {
    buyerMsg = sellerMsg = `Antecontractul pentru „${contract.property.title}” a fost anulat.`
  } else if (party === 'BUYER') {
    depositStatus = 'FORFEITED'
    buyerMsg = `Te-ai retras din antecontractul pentru „${contract.property.title}”. Conform clauzei de arvună, ai pierdut avansul de ${formatRon(arvuna)}.`
    sellerMsg = `Cumpărătorul s-a retras din antecontractul pentru „${contract.property.title}”. Arvuna de ${formatRon(arvuna)} îți rămâne.`
  } else if (party === 'SELLER') {
    refundToBuyer = arvuna * 2
    depositStatus = 'RETURNED'
    buyerMsg = `Vânzătorul s-a retras din antecontractul pentru „${contract.property.title}”. Conform clauzei de arvună, primești dublul avansului: ${formatRon(refundToBuyer)}.`
    sellerMsg = `Te-ai retras din antecontractul pentru „${contract.property.title}”. Conform clauzei de arvună, datorezi cumpărătorului dublul avansului: ${formatRon(refundToBuyer)}.`
  } else {
    // Anulare administrativă: restituire simplă a arvunei.
    refundToBuyer = arvuna
    depositStatus = 'RETURNED'
    buyerMsg = sellerMsg = `Antecontractul pentru „${contract.property.title}” a fost anulat administrativ. Arvuna de ${formatRon(arvuna)} se restituie cumpărătorului.`
  }

  await prisma.$transaction(async (tx) => {
    // Anulează tranșele neachitate (avans/diferență încă în curs).
    await tx.payment.updateMany({
      where: { contractId, status: 'IN_CURS', type: { in: ['AVANS', 'REST'] } },
      data: { status: 'ESUATA' },
    })
    if (refundToBuyer > 0) {
      await tx.payment.create({
        data: {
          reference: paymentReference(),
          userId: contract.tenantId,
          contractId,
          amount: refundToBuyer,
          type: 'REFUND',
          status: 'FINALIZATA',
          paidAt: new Date(),
        },
      })
    }
    await tx.contract.update({
      where: { id: contractId },
      data: { status: 'ANULAT', cancelledAt: new Date(), cancelReason: opts.reason ?? null, depositStatus },
    })
    // Eliberează listarea (rezervarea) dacă nu a fost deja vândută.
    await tx.property.updateMany({
      where: { id: contract.propertyId, status: { not: 'VANDUTA' } },
      data: { status: 'DISPONIBILA' },
    })
  })

  await notify(contract.tenantId, 'Antecontract anulat', buyerMsg, refundToBuyer > 0 ? 'success' : 'warning')
  await notify(contract.ownerId, 'Antecontract anulat', sellerMsg, party === 'BUYER' && arvunaPaid ? 'info' : 'warning')
  await recordAuditSafe({
    actorId: user.id,
    action: 'SALE_CANCELLED',
    entityType: 'CONTRACT',
    entityId: contractId,
    metadata: { party, arvuna, arvunaPaid, refundToBuyer, depositStatus, reason: opts.reason ?? null },
  })
  return { ok: true, message: 'Antecontract anulat.' }
}

// Rezilierea anticipată a unei închirieri active (oricare parte sau admin). Anulează chiria
// scadentă, încheie contractul și eliberează listarea; garanția rămâne reținută (HELD), urmând
// să fie restituită separat prin `returnRentalDeposit`.
export async function terminateRentalContract(
  contractId: string,
  user: SessionUser,
  opts: { reason?: string }
): Promise<CloseResult> {
  const contract = await prisma.contract.findUnique({ where: { id: contractId }, include: { property: true } })
  if (!contract) return { ok: false, error: 'Contractul nu există.' }
  if (contract.type !== 'INCHIRIERE') return { ok: false, error: 'Doar contractele de închiriere se reziliază aici.' }
  if (!authorizedOnContract(user, contract.ownerId, contract.tenantId)) {
    return { ok: false, error: 'Nu ai permisiunea necesară.' }
  }
  if (contract.status !== 'ACTIV') return { ok: false, error: 'Doar un contract activ poate fi reziliat.' }

  await prisma.$transaction(async (tx) => {
    await tx.payment.updateMany({
      where: { contractId, status: 'IN_CURS', type: 'CHIRIE' },
      data: { status: 'ESUATA' },
    })
    await tx.contract.update({
      where: { id: contractId },
      data: { status: 'INCHEIAT', cancelledAt: new Date(), cancelReason: opts.reason ?? null },
    })
    await tx.property.updateMany({
      where: { id: contract.propertyId, status: { not: 'VANDUTA' } },
      data: { status: 'DISPONIBILA' },
    })
  })

  const title = contract.property.title
  const who = contract.ownerId === user.id ? 'proprietarul' : contract.tenantId === user.id ? 'chiriașul' : 'administratorul'
  await notify(contract.tenantId, 'Contract reziliat', `Contractul de închiriere pentru „${title}” a fost reziliat de ${who}.`, 'warning')
  await notify(contract.ownerId, 'Contract reziliat', `Contractul de închiriere pentru „${title}” a fost reziliat de ${who}.`, 'warning')
  await recordAuditSafe({
    actorId: user.id,
    action: 'CONTRACT_TERMINATED',
    entityType: 'CONTRACT',
    entityId: contractId,
    metadata: { by: who, reason: opts.reason ?? null },
  })
  return { ok: true, message: 'Contract reziliat. Poți restitui garanția din pagina contractului.' }
}

// Reînnoirea / modificarea unei închirieri încheiate: creează un contract NOU (cu termeni eventual
// actualizați) care trebuie re-semnat de ambele părți. Astfel, „amendamentul" = reînnoire cu termeni
// noi — orice schimbare trece printr-o nouă semnătură (nu se modifică un contract deja semnat).
export async function renewRentalContract(
  contractId: string,
  user: SessionUser,
  opts: { months?: number; rent?: number; deposit?: number; dueDay?: number; clauses?: string }
): Promise<CloseResult & { contractId?: string }> {
  const source = await prisma.contract.findUnique({ where: { id: contractId }, include: { property: true } })
  if (!source) return { ok: false, error: 'Contractul nu există.' }
  if (source.type !== 'INCHIRIERE') return { ok: false, error: 'Doar închirierile pot fi reînnoite.' }
  if (user.role !== 'ADMIN' && source.ownerId !== user.id) {
    return { ok: false, error: 'Doar proprietarul poate propune reînnoirea.' }
  }
  if (source.status !== 'INCHEIAT') return { ok: false, error: 'Reînnoirea e disponibilă după încheierea contractului.' }

  const months = opts.months && opts.months > 0 ? Math.round(opts.months) : source.months
  const rent = opts.rent && opts.rent > 0 ? Math.round(opts.rent) : source.rent
  const deposit = opts.deposit != null && opts.deposit >= 0 ? Math.round(opts.deposit) : source.deposit
  const dueDay = opts.dueDay && opts.dueDay >= 1 && opts.dueDay <= 28 ? Math.round(opts.dueDay) : source.dueDay
  const clauses = opts.clauses?.trim() || source.clauses
  const startDate = new Date()
  const endDate = addMonths(startDate, months)

  // Listarea trebuie să fie disponibilă pentru a o rezerva pentru noul contract.
  const reserved = await prisma.property.updateMany({
    where: { id: source.propertyId, status: 'DISPONIBILA' },
    data: { status: 'REZERVATA' },
  })
  if (reserved.count === 0) {
    return { ok: false, error: 'Listarea nu este disponibilă pentru reînnoire.' }
  }

  const renewal = await prisma.contract.create({
    data: {
      propertyId: source.propertyId,
      ownerId: source.ownerId,
      tenantId: source.tenantId,
      type: 'INCHIRIERE',
      rent,
      deposit,
      months,
      dueDay,
      startDate,
      endDate,
      clauses,
      status: 'IN_ASTEPTARE',
    },
  })

  const title = source.property.title
  await notify(source.tenantId, 'Reînnoire contract', `Proprietarul a propus reînnoirea închirierii pentru „${title}”. Semnează noul contract pentru a continua.`, 'info')
  await notify(source.ownerId, 'Reînnoire contract', `Ai propus reînnoirea închirierii pentru „${title}”. Ambele părți trebuie să semneze noul contract.`, 'info')
  await recordAuditSafe({
    actorId: user.id,
    action: 'CONTRACT_RENEWED',
    entityType: 'CONTRACT',
    entityId: source.id,
    metadata: { renewalContractId: renewal.id, months, rent, deposit },
  })
  return { ok: true, message: 'Contract de reînnoire creat — necesită semnături.', contractId: renewal.id }
}
