import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const userId = await getSessionUserId()
    if (!userId) {
      return NextResponse.json([])
    }
    const items = await prisma.recurringExpense.findMany({
      where: { userId },
      orderBy: { dueDay: 'asc' },
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
    const day = dayOfMonth ?? body.dueDay
    if (!name || typeof amount !== 'number' || amount <= 0 || typeof day !== 'number' || day < 1 || day > 31) {
      return NextResponse.json({ error: 'Dados invalidos' }, { status: 400 })
    }
    const userId = await getSessionUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })
    }

    const item = await prisma.recurringExpense.create({
      data: {
        name: String(name),
        amount,
        dueDay: Math.min(31, Math.max(1, day)),
        userId,
      },
    })
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('[POST /api/recurring-expenses]', error)
    return NextResponse.json({ error: 'Erro ao criar' }, { status: 500 })
  }
}
