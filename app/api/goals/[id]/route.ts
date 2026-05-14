import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/auth-server'
import { updateGoalSchema } from '@/lib/validations/goal'

export const dynamic = 'force-dynamic'

type RouteParams = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const userId = await getSessionUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })
    }
    const existing = await prisma.goal.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Meta nao encontrada' }, { status: 404 })
    }
    if (existing.userId && existing.userId !== userId) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = updateGoalSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados invalidos', details: parsed.error.flatten() }, { status: 400 })
    }

    const data: Record<string, unknown> = {}
    if (parsed.data.name !== undefined) data.name = parsed.data.name.trim()
    if (parsed.data.targetAmount !== undefined) data.targetAmount = parsed.data.targetAmount
    if (parsed.data.currentAmount !== undefined) data.currentAmount = parsed.data.currentAmount

    const goal = await prisma.goal.update({ where: { id }, data })
    return NextResponse.json(goal)
  } catch (error) {
    console.error('[PATCH /api/goals/:id]', error)
    return NextResponse.json({ error: 'Erro ao atualizar meta' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const userId = await getSessionUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })
    }
    const existing = await prisma.goal.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Meta nao encontrada' }, { status: 404 })
    }
    if (existing.userId && existing.userId !== userId) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 403 })
    }
    await prisma.goal.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    const prismaError = error as { code?: string }
    if (prismaError.code === 'P2025') {
      return NextResponse.json({ error: 'Meta nao encontrada' }, { status: 404 })
    }
    console.error('[DELETE /api/goals/:id]', error)
    return NextResponse.json({ error: 'Erro ao remover meta' }, { status: 500 })
  }
}
