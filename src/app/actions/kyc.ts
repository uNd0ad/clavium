'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireActionUser } from '@/lib/actionUser'
import { errorMessage } from '@/lib/apiError'
import { notify } from '@/lib/notify'
import { submitKycVerification } from '@/lib/kyc'
import {
  saveKycDocument,
  photoExtension,
  KYC_DOCUMENT_KINDS,
  MAX_KYC_BYTES,
  type KycDocumentKind,
} from '@/lib/storage'
import type { SessionUser } from '@/lib/session'

// Etichete pentru documentele cerute (folosite în mesaje de eroare).
const KIND_LABELS: Record<KycDocumentKind, string> = {
  id: 'actul de identitate',
  selfie: 'selfie-ul',
}

// Rezultatul potrivirii faciale calculate în browser, trimis de client.
type FaceMatch = { facesDetected: boolean; matchDistance: number | null }

// Nucleul verificabil: trimite documentele + rezultatul potrivirii la furnizorul de identitate
// (sau motorul local), salvează dosarul KYC și aliniază starea de citire rapidă de pe utilizator.
// Separat de citirea fișierelor ca să poată fi testat fără a încărca imagini reale.
// Chei de stocare ale imaginilor brute + consimțământ biometric (categorie specială GDPR).
// Opționale ca să nu schimbe apelanții de test; furnizate de fluxul real (submitKycAction).
type KycEvidence = { documentKeys?: string[]; consentAt?: Date | null }

export async function recordKycVerification(
  user: SessionUser,
  documentHashes: string[],
  match: FaceMatch,
  evidence: KycEvidence = {}
) {
  const decision = await submitKycVerification({
    userId: user.id,
    fullName: `${user.firstName} ${user.lastName}`,
    email: user.email,
    documentHashes,
    facesDetected: match.facesDetected,
    matchDistance: match.matchDistance,
  })
  if (!decision.ok) return { ok: false as const, error: 'Verificarea identității a eșuat.' }

  const verifiedAt = decision.status === 'VERIFIED' ? new Date() : null
  const documentKeys = JSON.stringify(evidence.documentKeys ?? [])
  const biometricConsentAt = evidence.consentAt ?? null

  await prisma.kycVerification.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      status: decision.status,
      provider: decision.provider,
      reference: decision.reference,
      documentHashes: JSON.stringify(documentHashes),
      documentKeys,
      documentCount: documentHashes.length,
      matchScore: decision.matchScore,
      rejectionReason: decision.reason,
      biometricConsentAt,
      verifiedAt,
    },
    update: {
      status: decision.status,
      provider: decision.provider,
      reference: decision.reference,
      documentHashes: JSON.stringify(documentHashes),
      documentKeys,
      documentCount: documentHashes.length,
      matchScore: decision.matchScore,
      rejectionReason: decision.reason,
      biometricConsentAt,
      // Imagini noi încărcate → resetăm marcajul de purjare al rândului anterior.
      biometricPurgedAt: null,
      submittedAt: new Date(),
      verifiedAt,
    },
  })

  await prisma.user.update({ where: { id: user.id }, data: { kycStatus: decision.status } })

  if (decision.status === 'VERIFIED') {
    await notify(
      user.id,
      'Identitate verificată',
      'Contul tău a fost verificat (KYC). Ai acces complet la funcțiile platformei.',
      'success'
    )
  }

  revalidatePath('/dashboard', 'layout')
  return { ok: true as const, status: decision.status, reason: decision.reason }
}

// Primește din formular actul de identitate + selfie-ul (capturate live) și rezultatul
// potrivirii faciale, le validează și le salvează privat, apoi trimite verificarea.
export async function submitKycAction(formData: FormData) {
  try {
    const user = await requireActionUser()

    if (user.kycStatus === 'VERIFIED') {
      return { ok: false as const, error: 'Identitatea ta este deja verificată.' }
    }

    // Datele biometrice (fața) sunt categorie specială GDPR: fără consimțământ explicit nu prelucrăm.
    if (formData.get('consent') !== 'true') {
      return { ok: false as const, error: 'Trebuie să consimți la prelucrarea datelor biometrice pentru a continua.' }
    }

    // Ambele documente sunt obligatorii; validare rapidă (tip + dimensiune) înainte de re-encodare.
    const files: { kind: KycDocumentKind; file: File }[] = []
    for (const kind of KYC_DOCUMENT_KINDS) {
      const entry = formData.get(kind)
      if (!(entry instanceof File) || entry.size === 0) {
        return { ok: false as const, error: `Capturează ${KIND_LABELS[kind]}.` }
      }
      if (!photoExtension(entry.type)) {
        return { ok: false as const, error: `Format neacceptat pentru ${KIND_LABELS[kind]}.` }
      }
      if (entry.size > MAX_KYC_BYTES) {
        return { ok: false as const, error: `${KIND_LABELS[kind]} depășește 8 MB.` }
      }
      files.push({ kind, file: entry })
    }

    const documentHashes: string[] = []
    const documentKeys: string[] = []
    for (const { kind, file } of files) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const { hash, ref } = await saveKycDocument(user.id, kind, buffer)
      documentHashes.push(hash)
      documentKeys.push(ref)
    }

    const rawDistance = formData.get('matchDistance')
    const parsedDistance = typeof rawDistance === 'string' ? Number(rawDistance) : NaN
    const match: FaceMatch = {
      facesDetected: formData.get('facesDetected') === 'true',
      matchDistance: Number.isFinite(parsedDistance) ? parsedDistance : null,
    }

    return await recordKycVerification(user, documentHashes, match, { documentKeys, consentAt: new Date() })
  } catch (err) {
    return { ok: false as const, error: errorMessage(err) }
  }
}
