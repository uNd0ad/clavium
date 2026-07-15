import { describe, it, expect } from 'vitest'
import { buildContractPdf } from '@/lib/contractPdf'
import type { ContractDocument } from '@/lib/contractDocument'

// Document cu diacritice românești (ș, ț, ă, î, â) — fonturile PDF standard (WinAnsi) nu le pot
// codifica, de aceea încorporăm Noto Sans. Acest test apără regresia: dacă fontul lipsește sau
// codificarea pică, generarea aruncă și testul cade.
function sampleDoc(overrides: Partial<ContractDocument> = {}): ContractDocument {
  return {
    id: 'abc12345',
    number: 'CTR-ABC12345',
    type: 'INCHIRIERE',
    statusLabel: 'Activ',
    property: { title: 'Garsonieră lângă Cișmigiu', location: 'București, Sector 1' },
    owner: { role: 'Proprietar', kind: 'PERSON', name: 'Ștefan Mureșan', lines: ['Email: stefan@exemplu.ro'] },
    tenant: { role: 'Chiriaș', kind: 'PERSON', name: 'Ana Țîru', lines: ['Email: ana@exemplu.ro'] },
    rent: '2.500 RON',
    price: '0 RON',
    deposit: '2.500 RON',
    months: 12,
    dueDay: 5,
    startDate: '1 iulie 2026',
    endDate: '1 iulie 2027',
    clauses: 'Animalele de companie sunt permise.\nÎntreținerea cade în sarcina chiriașului.',
    signedByOwner: true,
    signedByClient: true,
    qes: true,
    signatures: [
      { role: 'OWNER', signerName: 'Ștefan Mureșan', signatureRef: 'sig_abc', provider: 'qes-dev', signedAt: '1 iulie 2026, 10:00' },
      { role: 'CLIENT', signerName: 'Ana Țîru', signatureRef: 'sig_def', provider: 'qes-dev', signedAt: '1 iulie 2026, 11:30' },
    ],
    ...overrides,
  }
}

describe('buildContractPdf', () => {
  it(
    'generează un PDF valid pentru un contract semnat (cu diacritice)',
    async () => {
      const bytes = await buildContractPdf(sampleDoc(), { documentHash: 'a'.repeat(64) })
      expect(bytes.length).toBeGreaterThan(1000)
      expect(Buffer.from(bytes.slice(0, 5)).toString()).toBe('%PDF-')
    },
    15_000
  )

  it('generează un PDF de previzualizare pentru un contract nesemnat fără clauze', async () => {
    const bytes = await buildContractPdf(
      sampleDoc({ signedByOwner: false, signedByClient: false, qes: false, clauses: null, signatures: [] })
    )
    expect(Buffer.from(bytes.slice(0, 5)).toString()).toBe('%PDF-')
  })

  it('generează antecontractul de vânzare', async () => {
    const bytes = await buildContractPdf(sampleDoc({ type: 'VANZARE', price: '120.000 EUR', deposit: '12.000 EUR' }))
    expect(Buffer.from(bytes.slice(0, 5)).toString()).toBe('%PDF-')
  })
})
