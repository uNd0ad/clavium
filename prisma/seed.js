/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client')
const { hash } = require('bcryptjs')

const prisma = new PrismaClient()

const DEMO_PASSWORD = 'parola123'

async function upsertUser(firstName, lastName, email, role, phone) {
  const passwordHash = await hash(DEMO_PASSWORD, 10)
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: { firstName, lastName, email, passwordHash, role, phone, phoneVerified: Boolean(phone), emailVerified: true },
  })
}

async function main() {
  const existing = await prisma.property.count()
  if (existing > 0) {
    console.log('Seed sărit: există deja proprietăți în baza de date.')
    return
  }

  const admin = await upsertUser('Ana', 'Administratorul', 'admin@vatrio.ro', 'ADMIN', '0700000001')
  const owner = await upsertUser('Andrei', 'Ionescu', 'owner@vatrio.ro', 'OWNER', '0723456789')
  const client = await upsertUser('Mihai', 'Popescu', 'client@vatrio.ro', 'CLIENT', '0745123456')

  const dorobanti = await prisma.property.create({
    data: {
      title: 'Apartament 2 camere Dorobanți', location: 'București', rent: 1800, rooms: 2, surface: 56,
      description: 'Apartament luminos lângă parcul Floreasca, complet mobilat și utilat, renovat în 2025.',
      status: 'INCHIRIATA', ownerId: owner.id,
    },
  })
  const tineretului = await prisma.property.create({
    data: {
      title: 'Garsonieră Tineretului', location: 'București', rent: 1250, rooms: 1, surface: 34,
      description: 'Garsonieră modernă la 5 minute de metrou Tineretului, ideală pentru o persoană.',
      status: 'DISPONIBILA', ownerId: owner.id,
    },
  })
  const loft = await prisma.property.create({
    data: {
      title: 'Loft Unirii', location: 'București', rent: 2150, rooms: 2, surface: 78,
      description: 'Loft spațios cu tavan înalt în centrul orașului, vedere panoramică.',
      status: 'DISPONIBILA', ownerId: owner.id,
    },
  })

  await prisma.savedProperty.create({ data: { userId: client.id, propertyId: loft.id } })

  await prisma.offer.createMany({
    data: [
      { propertyId: tineretului.id, fromUserId: client.id, toUserId: owner.id, amount: 1200, status: 'TRIMISA' },
      { propertyId: loft.id, fromUserId: client.id, toUserId: owner.id, amount: 2000, status: 'RESPINSA' },
      { propertyId: dorobanti.id, fromUserId: client.id, toUserId: owner.id, amount: 1800, status: 'ACCEPTATA' },
    ],
  })

  const contract = await prisma.contract.create({
    data: {
      propertyId: dorobanti.id,
      ownerId: owner.id,
      tenantId: client.id,
      rent: 1800,
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      signedByOwner: true,
      signedByClient: true,
      qes: true,
      status: 'ACTIV',
    },
  })
  await prisma.contract.create({
    data: {
      propertyId: tineretului.id,
      ownerId: owner.id,
      tenantId: client.id,
      rent: 1200,
      signedByOwner: true,
      signedByClient: false,
      qes: false,
      status: 'IN_ASTEPTARE',
    },
  })

  await prisma.payment.createMany({
    data: [
      { reference: 'TRX-0001', userId: client.id, contractId: contract.id, amount: 1800, type: 'CHIRIE', status: 'FINALIZATA', paidAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28) },
      { reference: 'TRX-0002', userId: owner.id, contractId: contract.id, amount: 90, type: 'COMISION', status: 'FINALIZATA', paidAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28) },
      { reference: 'TRX-0003', userId: client.id, contractId: contract.id, amount: 1800, type: 'CHIRIE', status: 'IN_CURS', dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3) },
    ],
  })

  await prisma.notification.createMany({
    data: [
      { userId: owner.id, title: 'Contract semnat', description: 'Contractul pentru Apartament 2 camere Dorobanți a fost semnat de chiriaș.', variant: 'success' },
      { userId: owner.id, title: 'Ofertă primită', description: 'Ai primit o ofertă nouă pentru Garsonieră Tineretului.', variant: 'info' },
      { userId: owner.id, title: 'Semnătură în așteptare', description: 'Contractul pentru Garsonieră Tineretului așteaptă semnătura clientului.', variant: 'warning' },
      { userId: client.id, title: 'Ofertă acceptată', description: 'Oferta ta pentru Apartament 2 camere Dorobanți a fost acceptată.', variant: 'success' },
      { userId: client.id, title: 'Plată în curs', description: 'Plata chiriei pentru luna curentă este în curs de procesare.', variant: 'info' },
      { userId: admin.id, title: 'Utilizatori noi', description: 'Doi utilizatori noi s-au înregistrat pe platformă.', variant: 'info' },
    ],
  })

  console.log('Seed finalizat. Conturi demo (parola: parola123):')
  console.log('  admin@vatrio.ro / owner@vatrio.ro / client@vatrio.ro')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
