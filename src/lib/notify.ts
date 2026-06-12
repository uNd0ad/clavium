import { prisma } from './prisma'

type Variant = 'info' | 'warning' | 'danger' | 'success'

export async function notify(userId: string, title: string, description: string, variant: Variant = 'info') {
  await prisma.notification.create({
    data: { userId, title, description, variant },
  })
}
