import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function getSessionUserId(): Promise<string | null> {
  const headersList = await headers()
  const auth = headersList.get('authorization')
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return null

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  })
  if (!session || session.expiresAt < new Date()) return null

  return session.userId
}
