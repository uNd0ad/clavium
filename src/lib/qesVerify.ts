// Verificarea unei semnături electronice calificate (QES) cu certificat încărcat de semnatar.
// Modelul: cheia privată rămâne la semnatar; el semnează amprenta documentului (UTF-8 al
// `documentHash`), iar serverul primește certificatul + semnătura și verifică:
//   1. validitatea temporală a certificatului,
//   2. semnătura corespunde amprentei documentului,
//   3. certificatul se închide într-un root al unui QTSP calificat (config/qes-trust),
//   4. certificatul nu e revocat (OCSP).
// Ancore de încredere lipsă → eșec închis (nicio semnătură acceptată). Vezi config/qes-trust/README.md.
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { webcrypto } from 'node:crypto'
import * as asn1js from 'asn1js'
import * as pkijs from 'pkijs'
import { logger } from './logger'

// Engine pkijs peste WebCrypto-ul din Node.
const engine = new pkijs.CryptoEngine({ name: 'node', crypto: webcrypto as unknown as Crypto })
pkijs.setEngine('node', engine)

const TRUST_DIR = process.env.QES_TRUST_DIR || path.join(process.cwd(), 'config', 'qes-trust')

const OID_EC_PUBLIC_KEY = '1.2.840.10045.2.1'
const OID_AIA = '1.3.6.1.5.5.7.1.1'
const OID_OCSP = '1.3.6.1.5.5.7.48.1'

function pemToDer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN [^-]+-----/g, '')
    .replace(/-----END [^-]+-----/g, '')
    .replace(/\s+/g, '')
  const buf = Buffer.from(b64, 'base64')
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
}

function parseCert(pem: string): pkijs.Certificate {
  const asn1 = asn1js.fromBER(pemToDer(pem))
  if (asn1.offset === -1) throw new Error('Certificat invalid (ASN.1).')
  return new pkijs.Certificate({ schema: asn1.result })
}

let trustCache: pkijs.Certificate[] | null = null
export function loadTrustAnchors(): pkijs.Certificate[] {
  if (trustCache) return trustCache
  const anchors: pkijs.Certificate[] = []
  if (existsSync(TRUST_DIR)) {
    for (const file of readdirSync(TRUST_DIR)) {
      if (!/\.(pem|crt|cer)$/i.test(file)) continue
      try {
        const content = readFileSync(path.join(TRUST_DIR, file), 'utf8')
        const blocks = content.match(/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/g) ?? []
        for (const block of blocks) anchors.push(parseCert(block))
      } catch (err) {
        logger.warn('qes: ancoră de încredere invalidă, ignorată', { file, error: (err as Error).message })
      }
    }
  }
  trustCache = anchors
  return anchors
}

// QES e configurat doar când există cel puțin o ancoră de încredere.
export function qesConfigured(): boolean {
  return loadTrustAnchors().length > 0
}

export type QesVerifyInput = {
  documentHash: string // sha256 (hex) al documentului — semnatarul semnează UTF-8-ul acestui șir
  certificatePem: string // certificatul X.509 al semnatarului
  signatureValue: string // semnătura (base64) peste UTF-8(documentHash)
  chainPem?: string[] // certificate intermediare opționale, pentru a închide lanțul
}

export type QesVerifyResult =
  | {
      ok: true
      subject: string
      issuer: string
      serial: string
      notAfter: Date
      algorithm: string
    }
  | { ok: false; error: string }

function certName(rdn: pkijs.RelativeDistinguishedNames): string {
  // CN (2.5.4.3) dacă există, altfel reprezentarea completă.
  const cn = rdn.typesAndValues.find((tv) => tv.type === '2.5.4.3')
  return cn ? String(cn.value.valueBlock.value) : rdn.typesAndValues.map((tv) => String(tv.value.valueBlock.value)).join(', ')
}

async function verifyDocumentSignature(cert: pkijs.Certificate, documentHash: string, signatureValue: string): Promise<{ ok: boolean; algorithm: string }> {
  const data = new TextEncoder().encode(documentHash)
  const signature = Buffer.from(signatureValue, 'base64')
  const isEc = cert.subjectPublicKeyInfo.algorithm.algorithmId === OID_EC_PUBLIC_KEY
  if (isEc) {
    // Notă: Web Crypto așteaptă semnături ECDSA în format raw (r||s). Semnatarii cu cheie
    // software care semnează în browser produc acest format; semnăturile DER detașate ar
    // necesita conversie (în afara scopului curent — majoritatea certificatelor RO sunt RSA).
    const pubKey = await cert.getPublicKey()
    const ok = await webcrypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, pubKey, signature, data)
    return { ok, algorithm: 'ECDSA/SHA-256' }
  }
  const pubKey = await cert.getPublicKey({
    algorithm: { algorithm: { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, usages: ['verify'] },
  } as unknown as Parameters<pkijs.Certificate['getPublicKey']>[0])
  const ok = await webcrypto.subtle.verify({ name: 'RSASSA-PKCS1-v1_5' }, pubKey, signature, data)
  return { ok, algorithm: 'RSASSA-PKCS1-v1_5/SHA-256' }
}

function ocspUrl(cert: pkijs.Certificate): string | null {
  const aia = cert.extensions?.find((e) => e.extnID === OID_AIA)
  const descriptions = (aia?.parsedValue as pkijs.InfoAccess | undefined)?.accessDescriptions ?? []
  for (const d of descriptions) {
    if (d.accessMethod === OID_OCSP && d.accessLocation?.type === 6) {
      return String(d.accessLocation.value.valueBlock.value)
    }
  }
  return null
}

// 'good' | 'revoked' | 'unknown' (nedeterminat: fără URL OCSP, fără emitent sau eroare de rețea).
async function checkRevocation(cert: pkijs.Certificate, issuers: pkijs.Certificate[]): Promise<'good' | 'revoked' | 'unknown'> {
  try {
    const url = ocspUrl(cert)
    if (!url) return 'unknown'
    // Emitentul = certificatul al cărui subiect == emitentul certificatului de verificat.
    const issuer = issuers.find((c) => c.subject.isEqual(cert.issuer))
    if (!issuer) return 'unknown'

    const req = new pkijs.OCSPRequest()
    await req.createForCertificate(cert, { hashAlgorithm: 'SHA-1', issuerCertificate: issuer })
    const body = req.toSchema(true).toBER(false)

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/ocsp-request' },
      body: Buffer.from(body),
    })
    if (!res.ok) return 'unknown'
    const respDer = await res.arrayBuffer()
    const asn1 = asn1js.fromBER(respDer)
    if (asn1.offset === -1) return 'unknown'
    const ocspResp = new pkijs.OCSPResponse({ schema: asn1.result })
    if (!ocspResp.responseBytes) return 'unknown'
    const basic = new pkijs.BasicOCSPResponse({
      schema: asn1js.fromBER(ocspResp.responseBytes.response.valueBlock.valueHexView).result,
    })
    const status = await basic.getCertificateStatus(cert, issuer)
    // status.status: 0 = good, 1 = revoked, 2 = unknown
    if (status.status === 0) return 'good'
    if (status.status === 1) return 'revoked'
    return 'unknown'
  } catch (err) {
    logger.warn('qes: verificarea OCSP a eșuat', { error: (err as Error).message })
    return 'unknown'
  }
}

export async function verifyQesSignature(input: QesVerifyInput): Promise<QesVerifyResult> {
  const anchors = loadTrustAnchors()
  if (anchors.length === 0) {
    return { ok: false, error: 'Magazinul de certificate calificate (QES) nu este configurat pe server.' }
  }

  let cert: pkijs.Certificate
  let intermediates: pkijs.Certificate[]
  try {
    cert = parseCert(input.certificatePem)
    intermediates = (input.chainPem ?? []).map(parseCert)
  } catch {
    return { ok: false, error: 'Certificat invalid.' }
  }

  // 1) Validitate temporală.
  const now = new Date()
  if (now < cert.notBefore.value || now > cert.notAfter.value) {
    return { ok: false, error: 'Certificatul este expirat sau încă neactiv.' }
  }

  // 2) Semnătura corespunde amprentei documentului.
  let algorithm: string
  try {
    const sig = await verifyDocumentSignature(cert, input.documentHash, input.signatureValue)
    if (!sig.ok) return { ok: false, error: 'Semnătura nu corespunde documentului semnat.' }
    algorithm = sig.algorithm
  } catch (err) {
    logger.warn('qes: verificarea semnăturii a eșuat', { error: (err as Error).message })
    return { ok: false, error: 'Verificarea semnăturii a eșuat.' }
  }

  // 3) Lanțul se închide într-un QTSP calificat de încredere.
  try {
    const chainEngine = new pkijs.CertificateChainValidationEngine({
      trustedCerts: anchors,
      certs: [...intermediates, cert],
    })
    const chain = await chainEngine.verify()
    if (!chain.result) {
      return { ok: false, error: 'Certificatul nu provine de la un furnizor calificat de încredere.' }
    }
  } catch (err) {
    logger.warn('qes: validarea lanțului a eșuat', { error: (err as Error).message })
    return { ok: false, error: 'Validarea lanțului de certificate a eșuat.' }
  }

  // 4) Revocare (OCSP). Implicit eșec închis pe „nedeterminat"; QES_OCSP_OPTIONAL=1 relaxează,
  // QES_OCSP_DISABLED=1 sare peste verificare.
  if (process.env.QES_OCSP_DISABLED !== '1') {
    const revocation = await checkRevocation(cert, [...intermediates, ...anchors])
    if (revocation === 'revoked') {
      return { ok: false, error: 'Certificatul a fost revocat.' }
    }
    if (revocation === 'unknown' && process.env.QES_OCSP_OPTIONAL !== '1') {
      return { ok: false, error: 'Nu s-a putut verifica revocarea certificatului (OCSP).' }
    }
  }

  return {
    ok: true,
    subject: certName(cert.subject),
    issuer: certName(cert.issuer),
    serial: Buffer.from(cert.serialNumber.valueBlock.valueHexView).toString('hex'),
    notAfter: cert.notAfter.value,
    algorithm,
  }
}
