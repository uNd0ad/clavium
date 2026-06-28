// Versionarea Termenilor și Condițiilor + consimțământul utilizatorilor.
// Crește `TERMS_VERSION` (format dată) când T&C se schimbă semnificativ → utilizatorilor li se
// cere re-consimțământ la următoarea vizită în dashboard (vezi TermsReconsentBanner).
import { prisma } from './prisma'

export const TERMS_VERSION = '2026-06-28'

export async function hasAcceptedCurrentTerms(userId: string): Promise<boolean> {
  const consent = await prisma.termsConsent.findUnique({
    where: { userId_version: { userId, version: TERMS_VERSION } },
  })
  return Boolean(consent)
}

// Înregistrează (idempotent) acceptarea versiunii curente — sau a uneia anume.
export async function recordTermsConsent(userId: string, version: string = TERMS_VERSION): Promise<void> {
  await prisma.termsConsent.upsert({
    where: { userId_version: { userId, version } },
    create: { userId, version },
    update: {},
  })
}
