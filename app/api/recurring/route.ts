import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/recurring - Lista rendas recorrentes do usuário
 */
export async function GET() {
  const userId = await getSessionUserId()
  const items = await prisma.recurringIncome.findMany({
    where: userId ? { OR: [{ userId }, { userId: null }] } : {},
    orderBy: [{ dayOfMonth: 'asc' }, { startMonth: 'asc' }],
  })
  return NextResponse.json(items)
}

/**
 * POST /api/recurring - Cria uma nova renda recorrente
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { description, amount, dayOfMonth, startMonth, endMonth } = body

    const day = Number(dayOfMonth)
    const start = Number(startMonth)
    const end = Number(endMonth)

    if (!description || typeof description !== 'string') {
      return NextResponse.json({ error: 'Descrição obrigatória' }, { status: 400 })
    }
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Valor inválido' }, { status: 400 })
    }
    if (!Number.isInteger(day) || day < 1 || day > 31) {
      return NextResponse.json({ error: 'Dia do mês inválido' }, { status: 400 })
    }
    if (!Number.isInteger(start) || start < 1 || start > 12) {
      return NextResponse.json({ error: 'Mês inicial inválido' }, { status: 400 })
    }
    if (!Number.isInteger(end) || end < 1 || end > 12) {
      return NextResponse.json({ error: 'Mês final inválido' }, { status: 400 })
    }

    const userId = await getSessionUserId()

    const item = await prisma.recurringIncome.create({
      data: {
        description: description.trim(),
        amount,
        dayOfMonth: day,
        startMonth: start,
        endMonth: end,
        userId: userId ?? undefined,
      },
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('[POST /api/recurring]', error)
    return NextResponse.json({ error: 'Erro ao criar renda recorrente' }, { status: 500 })
  }
}
