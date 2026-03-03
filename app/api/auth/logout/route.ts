import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const auth = request.headers.get('authorization')
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null

  if (token) {
    await prisma.session.deleteMany({ where: { token } }).catch(() => {})
  }

  return NextResponse.json({ ok: true })
}
