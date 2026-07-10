// Șabloanele de contract („modelele") trăiesc în fișiere editabile: config/contracts/*.md —
// unul per tip de tranzacție. Operatorul modifică textul juridic FĂRĂ să atingă codul, iar
// ambele randări (PDF-ul din contractPdf.ts și pagina /dashboard/contracte/[id]) se actualizează
// din aceeași sursă.
//
// Sintaxa fișierului:
//   <!-- comentariu -->   — eliminat din document (note pentru redactor)
//   ## Titlu de secțiune  — începe o secțiune nouă; numerotarea (1., 2., …) e AUTOMATĂ, în ordine
//   linie goală           — separă paragrafele
//   - text                — sub-punct (rând propriu, prefixat cu „– ")
//   {{cheie}}             — substituit cu datele contractului (vezi `substitutions`)
//
// Placeholder necunoscut: rămâne vizibil în document ({{cheie}}) + warning în log — greșeala se
// vede la previzualizare în loc să dispară silențios.
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { logger } from './logger'
import type { ContractDocument } from './contractDocument'

export type ContractSection = { heading: string; paragraphs: string[] }

const TEMPLATE_DIR = path.join(process.cwd(), 'config', 'contracts')

const FILE_BY_TYPE: Record<ContractDocument['type'], string> = {
  INCHIRIERE: 'inchiriere.md',
  VANZARE: 'vanzare.md',
}

// Cache per proces (pe serverless: o citire per instanță). În dev citim la fiecare cerere,
// ca editarea șablonului să se vadă imediat, fără restart.
const rawCache = new Map<string, string>()

function loadRaw(type: ContractDocument['type']): string {
  const file = FILE_BY_TYPE[type]
  if (process.env.NODE_ENV !== 'production') {
    return readFileSync(path.join(TEMPLATE_DIR, file), 'utf-8')
  }
  let raw = rawCache.get(file)
  if (raw === undefined) {
    raw = readFileSync(path.join(TEMPLATE_DIR, file), 'utf-8')
    rawCache.set(file, raw)
  }
  return raw
}

// Valorile disponibile în șablon. Sumele vin gata formatate din ContractDocument (ex. „2.500 RON").
function substitutions(doc: ContractDocument): Record<string, string> {
  return {
    number: doc.number,
    'property.title': doc.property.title,
    'property.location': doc.property.location,
    'owner.name': doc.owner.name,
    'owner.role': doc.owner.role,
    'tenant.name': doc.tenant.name,
    'tenant.role': doc.tenant.role,
    rent: doc.rent,
    price: doc.price,
    deposit: doc.deposit,
    months: String(doc.months),
    dueDay: String(doc.dueDay),
    startDate: doc.startDate,
    endDate: doc.endDate,
  }
}

// Nucleul parsării, separat de IO ca să fie testabil cu șabloane inline.
export function parseTemplate(raw: string, values: Record<string, string>): ContractSection[] {
  const substituted = raw
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, key: string) => {
      const value = values[key]
      if (value === undefined) {
        logger.warn('șablon contract: placeholder necunoscut', { key })
        return match
      }
      return value
    })

  const sections: ContractSection[] = []
  let current: ContractSection | null = null
  let buffer: string[] = []
  const flush = () => {
    if (buffer.length && current) current.paragraphs.push(buffer.join(' '))
    buffer = []
  }

  for (const line of substituted.split('\n')) {
    const trimmed = line.trim()
    if (trimmed.startsWith('## ')) {
      flush()
      current = { heading: trimmed.slice(3).trim(), paragraphs: [] }
      sections.push(current)
    } else if (trimmed === '') {
      flush()
    } else if (trimmed.startsWith('- ')) {
      // Sub-punct: paragraf propriu, cu liniuță tipografică.
      flush()
      if (current) current.paragraphs.push(`– ${trimmed.slice(2).trim()}`)
    } else if (current) {
      buffer.push(trimmed)
    }
    // Textul dinaintea primei secțiuni „##" e ignorat (loc pentru titlu/note în fișier).
  }
  flush()
  return sections
}

// Secțiunile contractului pentru un document dat — sursa comună a PDF-ului și a paginii HTML.
export function renderContractSections(doc: ContractDocument): ContractSection[] {
  return parseTemplate(loadRaw(doc.type), substitutions(doc))
}
