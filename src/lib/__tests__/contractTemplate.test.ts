import { describe, it, expect } from 'vitest'
import { parseTemplate, renderContractSections } from '@/lib/contractTemplate'
import type { ContractDocument } from '@/lib/contractDocument'

// Șabloanele reale (config/contracts/*.md) sunt editabile de operator — aceste teste apără
// contractul dintre fișier și randare: parsare secțiuni, substituție, comentarii, sub-puncte.

function sampleDoc(overrides: Partial<ContractDocument> = {}): ContractDocument {
  return {
    id: 'abc12345',
    number: 'CTR-ABC12345',
    type: 'INCHIRIERE',
    statusLabel: 'Activ',
    property: { title: 'Garsonieră lângă Cișmigiu', location: 'București, Sector 1' },
    owner: { role: 'Proprietar', kind: 'PERSON', name: 'Ștefan Mureșan', lines: [] },
    tenant: { role: 'Chiriaș', kind: 'PERSON', name: 'Ana Țîru', lines: [] },
    rent: '2.500 RON',
    price: '450.000 RON',
    deposit: '2.500 RON',
    months: 12,
    dueDay: 5,
    startDate: '1 iulie 2026',
    endDate: '1 iulie 2027',
    clauses: null,
    signedByOwner: false,
    signedByClient: false,
    qes: false,
    signatures: [],
    ...overrides,
  }
}

describe('parseTemplate', () => {
  it('împarte în secțiuni numerotabile și paragrafe', () => {
    const raw = '## Prima\n\nUn paragraf.\nContinuat pe alt rând.\n\nAl doilea paragraf.\n\n## A doua\n\nText.'
    const sections = parseTemplate(raw, {})
    expect(sections).toHaveLength(2)
    expect(sections[0].heading).toBe('Prima')
    expect(sections[0].paragraphs).toEqual(['Un paragraf. Continuat pe alt rând.', 'Al doilea paragraf.'])
    expect(sections[1]).toEqual({ heading: 'A doua', paragraphs: ['Text.'] })
  })

  it('substituie placeholder-ele și le păstrează vizibile pe cele necunoscute', () => {
    const raw = '## S\n\nChiria este {{rent}}, iar {{necunoscut}} rămâne.'
    const sections = parseTemplate(raw, { rent: '2.500 RON' })
    expect(sections[0].paragraphs[0]).toBe('Chiria este 2.500 RON, iar {{necunoscut}} rămâne.')
  })

  it('elimină comentariile și textul dinaintea primei secțiuni', () => {
    const raw = '<!-- notă\npe mai multe rânduri -->\nTitlu ignorat\n\n## S\n\nText.'
    const sections = parseTemplate(raw, {})
    expect(sections).toHaveLength(1)
    expect(sections[0].paragraphs).toEqual(['Text.'])
  })

  it('transformă liniile „- " în sub-puncte de sine stătătoare', () => {
    const raw = '## Obligații\n\n- prima obligație;\n- a doua obligație.'
    const sections = parseTemplate(raw, {})
    expect(sections[0].paragraphs).toEqual(['– prima obligație;', '– a doua obligație.'])
  })
})

describe('renderContractSections (șabloanele reale)', () => {
  it('închiriere: parsează fișierul, substituie complet și acoperă clauzele esențiale', () => {
    const sections = renderContractSections(sampleDoc())
    expect(sections.length).toBeGreaterThanOrEqual(8)
    const all = sections.map((s) => `${s.heading}\n${s.paragraphs.join('\n')}`).join('\n')
    expect(all).toContain('2.500 RON') // chiria substituită
    expect(all).toContain('Garsonieră lângă Cișmigiu')
    expect(all).not.toContain('{{') // niciun placeholder nerezolvat
    // Nu fixăm ordinea/numărul secțiunilor (șablonul e editabil) — doar clauzele esențiale.
    expect(sections.some((s) => s.heading === 'Obiectul contractului')).toBe(true)
    expect(sections.every((s) => s.paragraphs.length > 0)).toBe(true) // nicio secțiune goală
    expect(all).toMatch(/garanți/i)
    expect(all).toMatch(/încetarea contractului/i)
  })

  it('vânzare: parsează fișierul cu regulile arvunei (art. 1544)', () => {
    const sections = renderContractSections(sampleDoc({ type: 'VANZARE' }))
    expect(sections.length).toBeGreaterThanOrEqual(8)
    const all = sections.map((s) => `${s.heading}\n${s.paragraphs.join('\n')}`).join('\n')
    expect(all).toContain('450.000 RON') // prețul substituit
    expect(all).toMatch(/arvun/i)
    expect(all).toContain('1544')
    expect(all).not.toContain('{{')
  })
})
