// e-Factura (ANAF) pentru facturarea comisioanelor platformei. Scaffold env-gated: construim XML-ul
// UBL 2.1 (formatul cerut de RO e-Factura) acum — funcție pură, testabilă — iar trimiterea către SPV
// ANAF se activează când sunt setate credențialele OAuth (EFACTURA_*). Fără ele: doar generare XML.
const enabled = Boolean(process.env.EFACTURA_CLIENT_ID && process.env.EFACTURA_CLIENT_SECRET)

export const EFACTURA_ENABLED = enabled

export type InvoiceParty = {
  name: string
  cui: string // CUI/CIF (cumpărător) sau al furnizorului (Clavium)
  address: string
  country?: string // implicit RO
}

export type CommissionInvoice = {
  number: string
  issueDate: string // YYYY-MM-DD
  currency: string // RON
  amount: number // baza, fără TVA
  vatRate: number // ex. 19
  supplier: InvoiceParty
  customer: InvoiceParty
  description: string
}

function esc(value: string): string {
  return value.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]!)
}

function partyXml(tag: string, p: InvoiceParty): string {
  return `<cac:${tag}><cac:Party><cac:PartyLegalEntity><cbc:RegistrationName>${esc(p.name)}</cbc:RegistrationName><cbc:CompanyID>${esc(p.cui)}</cbc:CompanyID></cac:PartyLegalEntity><cac:PostalAddress><cbc:StreetName>${esc(p.address)}</cbc:StreetName><cac:Country><cbc:IdentificationCode>${esc(p.country ?? 'RO')}</cbc:IdentificationCode></cac:Country></cac:PostalAddress></cac:Party></cac:${tag}>`
}

// Construiește factura în format UBL 2.1 (RO_CIUS). Sumele se rotunjesc la 2 zecimale.
export function buildCommissionInvoiceXml(inv: CommissionInvoice): string {
  const base = Math.round(inv.amount * 100) / 100
  const vat = Math.round(base * inv.vatRate) / 100
  const total = Math.round((base + vat) * 100) / 100
  const m = (n: number) => n.toFixed(2)

  return (
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">` +
    `<cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:efactura.mfinante.ro:CIUS-RO:1.0.1</cbc:CustomizationID>` +
    `<cbc:ID>${esc(inv.number)}</cbc:ID>` +
    `<cbc:IssueDate>${esc(inv.issueDate)}</cbc:IssueDate>` +
    `<cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>` +
    `<cbc:DocumentCurrencyCode>${esc(inv.currency)}</cbc:DocumentCurrencyCode>` +
    partyXml('AccountingSupplierParty', inv.supplier) +
    partyXml('AccountingCustomerParty', inv.customer) +
    `<cac:TaxTotal><cbc:TaxAmount currencyID="${esc(inv.currency)}">${m(vat)}</cbc:TaxAmount></cac:TaxTotal>` +
    `<cac:LegalMonetaryTotal><cbc:LineExtensionAmount currencyID="${esc(inv.currency)}">${m(base)}</cbc:LineExtensionAmount><cbc:TaxExclusiveAmount currencyID="${esc(inv.currency)}">${m(base)}</cbc:TaxExclusiveAmount><cbc:TaxInclusiveAmount currencyID="${esc(inv.currency)}">${m(total)}</cbc:TaxInclusiveAmount><cbc:PayableAmount currencyID="${esc(inv.currency)}">${m(total)}</cbc:PayableAmount></cac:LegalMonetaryTotal>` +
    `<cac:InvoiceLine><cbc:ID>1</cbc:ID><cbc:InvoicedQuantity unitCode="C62">1</cbc:InvoicedQuantity><cbc:LineExtensionAmount currencyID="${esc(inv.currency)}">${m(base)}</cbc:LineExtensionAmount><cac:Item><cbc:Name>${esc(inv.description)}</cbc:Name></cac:Item></cac:InvoiceLine>` +
    `</Invoice>`
  )
}

// Trimite factura la SPV ANAF. Activ doar cu credențiale (EFACTURA_*). Scaffold: când le adaugi,
// aici se obține token-ul OAuth și se face upload-ul; întoarce id-ul de încărcare.
export async function submitEFactura(xml: string): Promise<{ ok: boolean; uploadId?: string; error?: string }> {
  if (!EFACTURA_ENABLED) {
    return { ok: false, error: 'e-Factura neconfigurată (lipsesc EFACTURA_CLIENT_ID/SECRET).' }
  }
  // TODO(extern): OAuth ANAF + POST /upload cu `xml`. Seam pentru integrarea cu credențiale reale.
  throw new Error(`Integrarea ANAF e-Factura nu este încă conectată (XML pregătit: ${xml.length} octeți).`)
}
