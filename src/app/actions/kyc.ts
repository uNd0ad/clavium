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
  id_front: 'actul de identitate (față)',
  id_back: 'actul de identitate (verso)',
  selfie: 'selfie-ul',
}

// Nucleul verificabil: trimite amprentele la furnizorul de identitate, salvează dosarul KYC
// și aliniază starea de citire rapidă de pe utilizator. Separat de citirea fișierelor ca să
// poată fi testat fără a încărca imagini reale.
export async function recordKycVerification(user: SessionUser, documentHashes: string[]) {
  const decision = await submitKycVerification({
    userId: user.id,
    fullName: `${user.firstName} ${user.lastName}`,
    email: user.email,
    documentHashes,
  })
  if (!decision.ok) return { ok: false as const, error: 'Verificarea identității a eșuat.' }

  const verifiedAt = decision.status === 'VERIFIED' ? new Date() : null

  await prisma.kycVerification.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      status: decision.status,
      provider: decision.provider,
      reference: decision.reference,
      documentHashes: JSON.stringify(documentHashes),
      documentCount: documentHashes.length,
      verifiedAt,
    },
    update: {
      status: decision.status,
      provider: decision.provider,
      reference: decision.reference,
      documentHashes: JSON.stringify(documentHashes),
      documentCount: documentHashes.length,
      rejectionReason: null,
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
  return { ok: true as const, status: decision.status }
}

// Primește documentele din formular (act față/verso + selfie), le validează și le salvează
// în zona privată, apoi trimite verificarea spre furnizorul de identitate.
export async function submitKycAction(formData: FormData) {
  try {
    const user = await requireActionUser()

    if (user.kycStatus === 'VERIFIED') {
      return { ok: false as const, error: 'Identitatea ta este deja verificată.' }
    }

    // Toate documentele sunt obligatorii; validare rapidă (tip + dimensiune) înainte de re-encodare.
    const files: { kind: KycDocumentKind; file: File }[] = []
    for (const kind of KYC_DOCUMENT_KINDS) {
      const entry = formData.get(kind)
      if (!(entry instanceof File) || entry.size === 0) {
        return { ok: false as const, error: `Încarcă ${KIND_LABELS[kind]}.` }
      }
      if (!photoExtension(entry.type)) {
        return { ok: false as const, error: `Format neacceptat pentru ${KIND_LABELS[kind]}. Folosește JPEG, PNG sau WebP.` }
      }
      if (entry.size > MAX_KYC_BYTES) {
        return { ok: false as const, error: `${KIND_LABELS[kind]} poate avea maxim 8 MB.` }
      }
      files.push({ kind, file: entry })
    }

    const documentHashes: string[] = []
    for (const { kind, file } of files) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const { hash } = await saveKycDocument(user.id, kind, buffer)
      documentHashes.push(hash)
    }

    return await recordKycVerification(user, documentHashes)
  } catch (err) {
    return { ok: false as const, error: errorMessage(err) }
  }
}
