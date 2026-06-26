// Ajutor de test pentru semnătura QES: semnează amprenta documentului cu cheia leaf din fixtures
// (certificat emis de CA-ul de test din src/test/fixtures/qes/trust). Reproduce ce face semnatarul
// în client: cheia privată semnează UTF-8-ul amprentei; serverul primește certificatul + semnătura.
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { webcrypto } from 'node:crypto'
import { prisma } from '@/lib/prisma'
import { contractDocumentHash } from '@/lib/qes'
import { signContractAction } from '@/app/actions/contracts'

const FIXTURES = path.join(process.cwd(), 'src/test/fixtures/qes')
const leafPem = readFileSync(path.join(FIXTURES, 'leaf.crt'), 'utf8')
const keyPem = readFileSync(path.join(FIXTURES, 'leaf.key.pem'), 'utf8')

function pemToDer(pem: string): ArrayBuffer {
  const b64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '')
  const buf = Buffer.from(b64, 'base64')
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
}

let keyPromise: Promise<CryptoKey> | null = null
function leafKey(): Promise<CryptoKey> {
  if (!keyPromise) {
    keyPromise = webcrypto.subtle.importKey(
      'pkcs8',
      pemToDer(keyPem),
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['sign']
    )
  }
  return keyPromise
}

// Produce intrarea de semnătură (certificat + semnătură base64) pentru o amprentă dată.
export async function signHash(documentHash: string) {
  const key = await leafKey()
  const data = new TextEncoder().encode(documentHash)
  const sig = await webcrypto.subtle.sign({ name: 'RSASSA-PKCS1-v1_5' }, key, data)
  return { certificatePem: leafPem, signatureValue: Buffer.from(sig).toString('base64') }
}

// Semnează un contract ca utilizatorul curent (setat prin setUser), cu certificatul de test.
export async function signContractAs(contractId: string) {
  const contract = await prisma.contract.findUniqueOrThrow({ where: { id: contractId } })
  const signature = await signHash(contractDocumentHash(contract))
  return signContractAction(contractId, signature)
}
