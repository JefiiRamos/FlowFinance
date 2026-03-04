import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const userId = await getSessionUserId()
    const items = await prisma.recurringExpense.findMany({
      where: userId ? { OR: [{ userId }, { userId: null }] } : {},
      orderBy: { dayOfMonth: 'asc' },
    })
    return NextResponse.json(items)
  } catch (error) {
    console.error('[GET /api/recurring-expenses]', error)
    return NextResponse.json({ error: 'Erro ao buscar despesas recorrentes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, amount, dayOfMonth } = body
    if (!name || typeof amount !== 'number' || amount <= 0 || typeof dayOfMonth !== 'number' || dayOfMonth < 1 || dayOfMonth > 31) {
      return NextResponse.json({ error: 'Dados invalidos' }, { status: 400 })
    }
    const userId = await getSessionUserId()
    const item = await prisma.recurringExpense.create({
      data: {
        name: String(name),
        amount,
        dayOfMonth: Math.min(31, Math.max(1, dayOfMonth)),
        userId: userId ?? undefined,
      },
    })
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('[POST /api/recurring-expenses]', error)
    return NextResponse.json({ error: 'Erro ao criar' }, { status: 500 })
  }
}
