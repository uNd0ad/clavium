'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireActionUser } from '@/lib/actionUser'
import { errorMessage } from '@/lib/apiError'
import { propertySchema, propertyUpdateSchema } from '@/lib/validations'
import {
  savePropertyPhoto,
  deletePropertyPhoto,
  parsePhotos,
  photoExtension,
  MAX_PHOTO_BYTES,
  MAX_PHOTOS_PER_PROPERTY,
} from '@/lib/storage'
import { aHash, recordPhotoSignatures, runFraudChecks } from '@/lib/fraud'

// Notă ISR: pagina publică a listării (`/proprietati/[id]`) folosește un cache cu revalidare la
// cel mult o oră (vezi getPublicListing), deci modificările se propagă în acea fereastră.
function revalidateProperties() {
  // Acoperă dashboardul (proprietăți/căutare/overview) și paginile publice.
  revalidatePath('/dashboard', 'layout')
  revalidatePath('/proprietati', 'layout')
}

export async function createPropertyAction(input: unknown) {
  try {
    const user = await requireActionUser(['OWNER', 'ADMIN'])
    const data = propertySchema.parse(input)
    const isSale = data.transactionType === 'VANZARE'
    const property = await prisma.property.create({
      data: {
        title: data.title,
        description: data.description,
        location: data.location,
        transactionType: data.transactionType,
        rent: isSale ? 0 : (data.rent ?? 0),
        price: isSale ? (data.price ?? 0) : 0,
        rooms: data.rooms,
        surface: data.surface,
        ownerId: user.id,
      },
    })
    revalidateProperties()
    return { ok: true as const, propertyId: property.id }
  } catch (err) {
    return { ok: false as const, error: errorMessage(err) }
  }
}

export async function updatePropertyStatusAction(propertyId: string, status: string) {
  try {
    const user = await requireActionUser(['OWNER', 'ADMIN'])
    const property = await prisma.property.findUnique({ where: { id: propertyId } })
    if (!property) return { ok: false as const, error: 'Proprietatea nu există.' }
    if (user.role !== 'ADMIN' && property.ownerId !== user.id) {
      return { ok: false as const, error: 'Nu ai permisiunea necesară.' }
    }
    const data = propertyUpdateSchema.parse({ status })
    await prisma.property.update({ where: { id: propertyId }, data })
    revalidateProperties()
    return { ok: true as const }
  } catch (err) {
    return { ok: false as const, error: errorMessage(err) }
  }
}

// Editarea detaliilor unei proprietăți (titlu, locație, chirie, camere, suprafață, descriere).
export async function updatePropertyAction(propertyId: string, input: unknown) {
  try {
    const user = await requireActionUser(['OWNER', 'ADMIN'])
    const property = await prisma.property.findUnique({ where: { id: propertyId } })
    if (!property) return { ok: false as const, error: 'Proprietatea nu există.' }
    if (user.role !== 'ADMIN' && property.ownerId !== user.id) {
      return { ok: false as const, error: 'Nu ai permisiunea necesară.' }
    }
    const data = propertyUpdateSchema.parse(input)
    await prisma.property.update({ where: { id: propertyId }, data })
    revalidateProperties()
    return { ok: true as const }
  } catch (err) {
    return { ok: false as const, error: errorMessage(err) }
  }
}

export async function toggleSaveAction(propertyId: string) {
  try {
    const user = await requireActionUser()
    // Cele două interogări sunt independente — le rulăm în paralel.
    const [property, existing] = await Promise.all([
      prisma.property.findUnique({ where: { id: propertyId } }),
      prisma.savedProperty.findUnique({ where: { userId_propertyId: { userId: user.id, propertyId } } }),
    ])
    if (!property) return { ok: false as const, error: 'Proprietatea nu există.' }
    if (existing) {
      await prisma.savedProperty.delete({ where: { id: existing.id } })
      revalidateProperties()
      return { ok: true as const, saved: false }
    }
    await prisma.savedProperty.create({ data: { userId: user.id, propertyId } })
    revalidateProperties()
    return { ok: true as const, saved: true }
  } catch (err) {
    return { ok: false as const, error: errorMessage(err) }
  }
}

export async function uploadPhotosAction(propertyId: string, formData: FormData) {
  try {
    const user = await requireActionUser(['OWNER', 'ADMIN'])
    const property = await prisma.property.findUnique({ where: { id: propertyId } })
    if (!property) return { ok: false as const, error: 'Proprietatea nu există.' }
    if (user.role !== 'ADMIN' && property.ownerId !== user.id) {
      return { ok: false as const, error: 'Nu ai permisiunea necesară.' }
    }

    const files = formData.getAll('photos').filter((entry): entry is File => entry instanceof File)
    if (files.length === 0) return { ok: false as const, error: 'Nicio fotografie trimisă.' }

    const existing = parsePhotos(property.photos)
    if (existing.length + files.length > MAX_PHOTOS_PER_PROPERTY) {
      return { ok: false as const, error: `Maxim ${MAX_PHOTOS_PER_PROPERTY} fotografii per proprietate.` }
    }
    // Verificare rapidă (tip declarat + dimensiune) înainte de a citi fișierele; conținutul real
    // e validat și re-encodat de savePropertyPhoto, sursa de adevăr.
    for (const file of files) {
      if (!photoExtension(file.type)) return { ok: false as const, error: 'Format neacceptat. Folosește JPEG, PNG sau WebP.' }
      if (file.size > MAX_PHOTO_BYTES) return { ok: false as const, error: 'Fiecare fotografie poate avea maxim 5 MB.' }
    }

    // Citim fiecare fișier o singură dată, apoi salvăm + calculăm amprenta perceptuală în paralel
    // (Promise.all păstrează ordinea); secvențial era de N ori mai lent.
    const processed = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer())
        const [url, hash] = await Promise.all([savePropertyPhoto(propertyId, buffer), aHash(buffer)])
        return { url, hash }
      })
    )
    const urls = processed.map((p) => p.url)
    await prisma.property.update({
      where: { id: propertyId },
      data: { photos: JSON.stringify([...existing, ...urls]) },
    })

    // Detecția fraudei (best-effort): amprente foto + semnale (fotografii furate / listare duplicat).
    await recordPhotoSignatures(propertyId, property.ownerId, processed.map((p) => p.hash))
    await runFraudChecks(
      { id: propertyId, title: property.title, location: property.location, ownerId: property.ownerId },
      processed.map((p) => p.hash)
    )

    revalidateProperties()
    return { ok: true as const }
  } catch (err) {
    return { ok: false as const, error: errorMessage(err) }
  }
}

export async function deletePhotoAction(propertyId: string, url: string) {
  try {
    const user = await requireActionUser(['OWNER', 'ADMIN'])
    const property = await prisma.property.findUnique({ where: { id: propertyId } })
    if (!property) return { ok: false as const, error: 'Proprietatea nu există.' }
    if (user.role !== 'ADMIN' && property.ownerId !== user.id) {
      return { ok: false as const, error: 'Nu ai permisiunea necesară.' }
    }

    const existing = parsePhotos(property.photos)
    if (!existing.includes(url)) return { ok: false as const, error: 'Fotografia nu există.' }

    // Actualizăm întâi referința în DB, apoi ștergem fișierul: dacă ștergerea pe disc eșuează
    // rămâne doar un fișier orfan (inofensiv), nu o referință către un fișier inexistent (imagine ruptă).
    await prisma.property.update({
      where: { id: propertyId },
      data: { photos: JSON.stringify(existing.filter((item) => item !== url)) },
    })
    await deletePropertyPhoto(propertyId, url)
    revalidateProperties()
    return { ok: true as const }
  } catch (err) {
    return { ok: false as const, error: errorMessage(err) }
  }
}
