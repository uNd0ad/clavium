// Semnătură electronică calificată (QES) — furnizorul eIDAS real
// (certSIGN, Namirial, DocuSign EU Qualified) se conectează aici.
// Fără QES_API_KEY, semnarea rulează în mod dev (simulată, marcată ca QES).
export type QesResult = { ok: boolean; qes: boolean; signatureRef: string }

export async function signWithQes(params: {
  contractId: string
  signerEmail: string
  signerName: string
}): Promise<QesResult> {
  const apiKey = process.env.QES_API_KEY

  if (!apiKey) {
    console.log(`[DEV] Semnătură QES simulată pentru contractul ${params.contractId} de ${params.signerName}`)
    return { ok: true, qes: true, signatureRef: `qes_dev_${Date.now().toString(36)}` }
  }

  // TODO: integrare furnizor QES eIDAS.
  throw new Error('Furnizorul QES nu este încă integrat.')
}
