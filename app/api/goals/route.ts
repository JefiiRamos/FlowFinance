import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/auth-server'
import { createGoalSchema } from '@/lib/validations/goal'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const userId = await getSessionUserId()
    if (!userId) {
      return NextResponse.json([])
    }
    const goals = await prisma.goal.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(goals)
  } catch (error) {
    console.error('[GET /api/goals]', error)
    return NextResponse.json({ error: 'Erro ao listar metas' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getSessionUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })
    }
    const body = await request.json()
    const parsed = createGoalSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados invalidos', details: parsed.error.flatten() }, { status: 400 })
    }
    const { name, targetAmount, currentAmount } = parsed.data
    const goal = await prisma.goal.create({
      data: {
        name: name.trim(),
        targetAmount,
        currentAmount: currentAmount ?? 0,
        userId,
      },
    })
    return NextResponse.json(goal, { status: 201 })
  } catch (error) {
    console.error('[POST /api/goals]', error)
    return NextResponse.json({ error: 'Erro ao criar meta' }, { status: 500 })
  }
}
