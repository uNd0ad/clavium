// Generarea PDF a contractului din `ContractDocument` (aceeași sursă ca pagina HTML).
// Folosește pdf-lib (fără browser headless → sigur pe serverless). Fonturile standard PDF
// (Helvetica/WinAnsi) NU pot codifica diacriticele românești (ș, ț, ă), așa că încorporăm
// Noto Sans (OFL) din src/assets/fonts prin fontkit.
//
// Două stări: previzualizare (înainte de semnături) și document final (cu blocul de audit QES).
// Conținutul oglindește pagina /dashboard/contracte/[id]; e generat la cerere (determinist).
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { PDFDocument, rgb, type PDFFont, type PDFPage } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import type { ContractDocument } from './contractDocument'

const FONT_DIR = path.join(process.cwd(), 'src', 'assets', 'fonts')
// Citite o singură dată; embedFont le subsetează per-document.
const REGULAR_BYTES = readFileSync(path.join(FONT_DIR, 'NotoSans-Regular.ttf'))
const BOLD_BYTES = readFileSync(path.join(FONT_DIR, 'NotoSans-Bold.ttf'))

const A4 = { width: 595.28, height: 841.89 }
const MARGIN = 56
const INK = rgb(0.09, 0.09, 0.11)
const MUTED = rgb(0.42, 0.42, 0.46)
const RULE = rgb(0.82, 0.82, 0.85)

// Mic motor de layout: scrie de sus în jos, trece pe pagină nouă la depășire.
class Cursor {
  page: PDFPage
  y: number
  constructor(
    private pdf: PDFDocument,
    readonly regular: PDFFont,
    readonly bold: PDFFont
  ) {
    this.page = pdf.addPage([A4.width, A4.height])
    this.y = A4.height - MARGIN
  }

  private ensure(space: number) {
    if (this.y - space < MARGIN) {
      this.page = this.pdf.addPage([A4.width, A4.height])
      this.y = A4.height - MARGIN
    }
  }

  gap(h: number) {
    this.y -= h
  }

  // Scrie un paragraf cu word-wrap la lățimea utilă; întoarce înălțimea consumată.
  text(
    value: string,
    opts: { size?: number; bold?: boolean; color?: typeof INK; lineGap?: number; indent?: number } = {}
  ) {
    const size = opts.size ?? 10.5
    const font = opts.bold ? this.bold : this.regular
    const color = opts.color ?? INK
    const indent = opts.indent ?? 0
    const lineHeight = size + (opts.lineGap ?? 4)
    const maxWidth = A4.width - MARGIN * 2 - indent

    for (const rawLine of value.split('\n')) {
      const words = rawLine.split(/\s+/).filter(Boolean)
      let line = ''
      const flush = () => {
        this.ensure(lineHeight)
        this.page.drawText(line, { x: MARGIN + indent, y: this.y - size, size, font, color })
        this.y -= lineHeight
        line = ''
      }
      if (words.length === 0) {
        this.y -= lineHeight // linie goală (păstrează spațierea din \n\n)
        continue
      }
      for (const word of words) {
        const candidate = line ? `${line} ${word}` : word
        if (font.widthOfTextAtSize(candidate, size) > maxWidth && line) {
          flush()
          line = word
        } else {
          line = candidate
        }
      }
      if (line) flush()
    }
  }

  rule() {
    this.ensure(12)
    this.gap(6)
    this.page.drawLine({
      start: { x: MARGIN, y: this.y },
      end: { x: A4.width - MARGIN, y: this.y },
      thickness: 0.75,
      color: RULE,
    })
    this.gap(10)
  }
}

const PARTY_KIND_LABEL: Record<ContractDocument['owner']['kind'], string> = {
  PERSON: 'persoană fizică',
  COMPANY: 'persoană juridică',
}

export async function buildContractPdf(
  doc: ContractDocument,
  opts: { documentHash?: string } = {}
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  pdf.registerFontkit(fontkit)
  const regular = await pdf.embedFont(REGULAR_BYTES, { subset: true })
  const bold = await pdf.embedFont(BOLD_BYTES, { subset: true })
  const cur = new Cursor(pdf, regular, bold)

  const isSale = doc.type === 'VANZARE'

  pdf.setTitle(doc.number)
  pdf.setProducer('Clavium.ro')

  // Antet.
  cur.text(isSale ? 'ANTECONTRACT DE VÂNZARE-CUMPĂRARE' : 'CONTRACT DE ÎNCHIRIERE', {
    size: 9,
    bold: true,
    color: MUTED,
  })
  cur.gap(2)
  cur.text(doc.number, { size: 20, bold: true })
  cur.gap(2)
  cur.text(`${doc.statusLabel} · ${doc.property.title}, ${doc.property.location}`, { size: 10, color: MUTED })
  cur.rule()

  // Părți.
  for (const party of [doc.owner, doc.tenant]) {
    cur.text(`${party.role} · ${PARTY_KIND_LABEL[party.kind]}`, { size: 8.5, bold: true, color: MUTED })
    cur.gap(1)
    cur.text(party.name, { size: 11, bold: true })
    for (const line of party.lines) cur.text(line, { size: 9.5, color: MUTED, lineGap: 2 })
    cur.gap(8)
  }
  cur.rule()

  // Clauze de fond (specifice tipului).
  if (isSale) {
    cur.text('1. Obiectul antecontractului', { size: 12, bold: true })
    cur.gap(2)
    cur.text(
      `Vânzătorul se obligă să vândă, iar cumpărătorul să cumpere imobilul „${doc.property.title}”, situat în ` +
        `${doc.property.location}, prin încheierea contractului de vânzare-cumpărare în formă autentică la notar.`,
      { color: MUTED }
    )
    cur.gap(10)
    cur.text('2. Prețul și avansul', { size: 12, bold: true })
    cur.gap(2)
    cur.text(
      `Prețul de vânzare este de ${doc.price}. La semnarea antecontractului, cumpărătorul achită un avans ` +
        `(arvună) de ${doc.deposit}, urmând ca diferența să fie plătită la finalizarea tranzacției.`,
      { color: MUTED }
    )
  } else {
    cur.text('1. Obiectul contractului', { size: 12, bold: true })
    cur.gap(2)
    cur.text(
      `Proprietarul închiriază chiriașului imobilul „${doc.property.title}”, situat în ${doc.property.location}, ` +
        `pentru o durată de ${doc.months} luni, în perioada ${doc.startDate} – ${doc.endDate}.`,
      { color: MUTED }
    )
    cur.gap(10)
    cur.text('2. Chiria și garanția', { size: 12, bold: true })
    cur.gap(2)
    cur.text(
      `Chiria lunară este de ${doc.rent}, plătibilă până în data de ${doc.dueDay} a fiecărei luni. ` +
        `Garanția (depozitul) este de ${doc.deposit} și se restituie la încetarea contractului, în condițiile legii.`,
      { color: MUTED }
    )
  }
  cur.gap(10)

  // Clauze speciale (opțional).
  let nextSection = 3
  if (doc.clauses) {
    cur.text(`${nextSection}. Clauze speciale`, { size: 12, bold: true })
    cur.gap(2)
    cur.text(doc.clauses, { color: MUTED })
    cur.gap(10)
    nextSection += 1
  }

  // Semnături electronice + audit.
  cur.text(`${nextSection}. Semnături electronice`, { size: 12, bold: true })
  cur.gap(4)
  const signed = [
    { party: doc.owner, isSigned: doc.signedByOwner, role: 'OWNER' as const },
    { party: doc.tenant, isSigned: doc.signedByClient, role: 'CLIENT' as const },
  ]
  for (const { party, isSigned, role } of signed) {
    const sig = doc.signatures.find((s) => s.role === role)
    cur.text(`${party.role}: ${isSigned ? 'Semnat' : 'În așteptare'}`, { size: 10.5, bold: true })
    if (sig) {
      cur.text(`Semnatar: ${sig.signerName} · furnizor: ${sig.provider}`, { size: 9, color: MUTED, lineGap: 2 })
      cur.text(`Data: ${sig.signedAt} · referință: ${sig.signatureRef}`, { size: 9, color: MUTED, lineGap: 2 })
    }
    cur.gap(6)
  }
  if (opts.documentHash) {
    cur.gap(2)
    cur.text(`Amprentă document (SHA-256): ${opts.documentHash}`, { size: 8, color: MUTED, lineGap: 2 })
  }

  // Subsol.
  cur.rule()
  cur.text(
    'Document generat de Clavium.ro · semnătură electronică conformă eIDAS / Legea 214/2024. ' +
      'Antecontractul nu transferă proprietatea; transferul se realizează prin act autentic la notar.',
    { size: 8, color: MUTED, lineGap: 2 }
  )

  return pdf.save()
}
