import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/apiAuth'
import { errorMessage } from '@/lib/apiError'
import {
  savePropertyPhoto,
  deletePropertyPhoto,
  parsePhotos,
  photoExtension,
  MAX_PHOTO_BYTES,
  MAX_PHOTOS_PER_PROPERTY,
} from '@/lib/storage'

async function getOwnedProperty(id: string, userId: string, role: string) {
  const property = await prisma.property.findUnique({ where: { id } })
  if (!property) return { property: null, error: NextResponse.json({ error: 'Proprietatea nu există.' }, { status: 404 }) }
  if (role !== 'ADMIN' && property.ownerId !== userId) {
    return { property: null, error: NextResponse.json({ error: 'Nu ai permisiunea necesară.' }, { status: 403 }) }
  }
  return { property, error: null }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireUser(['OWNER', 'ADMIN'])
  if (error) return error

  try {
    const { id } = await params
    const { property, error: propError } = await getOwnedProperty(id, user.id, user.role)
    if (propError) return propError

    const form = await request.formData()
    const files = form.getAll('photos').filter((entry): entry is File => entry instanceof File)
    if (files.length === 0) {
      return NextResponse.json({ error: 'Nicio fotografie trimisă.' }, { status: 400 })
    }

    const existing = parsePhotos(property!.photos)
    if (existing.length + files.length > MAX_PHOTOS_PER_PROPERTY) {
      return NextResponse.json({ error: `Maxim ${MAX_PHOTOS_PER_PROPERTY} fotografii per proprietate.` }, { status: 400 })
    }

    for (const file of files) {
      if (!photoExtension(file.type)) {
        return NextResponse.json({ error: 'Format neacceptat. Folosește JPEG, PNG sau WebP.' }, { status: 400 })
      }
      if (file.size > MAX_PHOTO_BYTES) {
        return NextResponse.json({ error: 'Fiecare fotografie poate avea maxim 5 MB.' }, { status: 400 })
      }
    }

    const urls: string[] = []
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer())
      urls.push(await savePropertyPhoto(id, buffer, file.type))
    }

    const updated = await prisma.property.update({
      where: { id },
      data: { photos: JSON.stringify([...existing, ...urls]) },
    })

    return NextResponse.json({ photos: parsePhotos(updated.photos) }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: errorMessage(err) }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireUser(['OWNER', 'ADMIN'])
  if (error) return error

  try {
    const { id } = await params
    const { property, error: propError } = await getOwnedProperty(id, user.id, user.role)
    if (propError) return propError

    const { url } = await request.json()
    const existing = parsePhotos(property!.photos)
    if (typeof url !== 'string' || !existing.includes(url)) {
      return NextResponse.json({ error: 'Fotografia nu există.' }, { status: 404 })
    }

    await deletePropertyPhoto(id, url)
    const updated = await prisma.property.update({
      where: { id },
      data: { photos: JSON.stringify(existing.filter((item) => item !== url)) },
    })

    return NextResponse.json({ photos: parsePhotos(updated.photos) })
  } catch (err) {
    return NextResponse.json({ error: errorMessage(err) }, { status: 400 })
  }
}
