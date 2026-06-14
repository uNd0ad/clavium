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

function revalidateProperties() {
  // Acoperă dashboardul (proprietăți/căutare/overview) și paginile publice.
  revalidatePath('/dashboard', 'layout')
  revalidatePath('/proprietati', 'layout')
}

export async function createPropertyAction(input: unknown) {
  try {
    const user = await requireActionUser(['OWNER', 'ADMIN'])
    const data = propertySchema.parse(input)
    const property = await prisma.property.create({
      data: {
        title: data.title,
        description: data.description,
        location: data.location,
        rent: data.rent,
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
    const property = await prisma.property.findUnique({ where: { id: propertyId } })
    if (!property) return { ok: false as const, error: 'Proprietatea nu există.' }

    const existing = await prisma.savedProperty.findUnique({
      where: { userId_propertyId: { userId: user.id, propertyId } },
    })
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
    for (const file of files) {
      if (!photoExtension(file.type)) return { ok: false as const, error: 'Format neacceptat. Folosește JPEG, PNG sau WebP.' }
      if (file.size > MAX_PHOTO_BYTES) return { ok: false as const, error: 'Fiecare fotografie poate avea maxim 5 MB.' }
    }

    const urls: string[] = []
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer())
      urls.push(await savePropertyPhoto(propertyId, buffer, file.type))
    }
    await prisma.property.update({
      where: { id: propertyId },
      data: { photos: JSON.stringify([...existing, ...urls]) },
    })
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

    await deletePropertyPhoto(propertyId, url)
    await prisma.property.update({
      where: { id: propertyId },
      data: { photos: JSON.stringify(existing.filter((item) => item !== url)) },
    })
    revalidateProperties()
    return { ok: true as const }
  } catch (err) {
    return { ok: false as const, error: errorMessage(err) }
  }
}
