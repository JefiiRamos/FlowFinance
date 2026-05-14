import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

type RouteParams = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const userId = await getSessionUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })
    }
    const existing = await prisma.recurringExpense.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Nao encontrado' }, { status: 404 })
    }
    if (existing.userId && existing.userId !== userId) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 403 })
    }

    const body = await request.json()
    const data: Record<string, unknown> = {}
    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || !body.name.trim()) {
        return NextResponse.json({ error: 'Nome invalido' }, { status: 400 })
      }
      data.name = body.name.trim()
    }
    if (body.amount !== undefined) {
      const amount = Number(body.amount)
      if (!Number.isFinite(amount) || amount <= 0) {
        return NextResponse.json({ error: 'Valor invalido' }, { status: 400 })
      }
      data.amount = amount
    }
    const day = body.dueDay ?? body.dayOfMonth
    if (day !== undefined) {
      const d = Number(day)
      if (!Number.isInteger(d) || d < 1 || d > 31) {
        return NextResponse.json({ error: 'Dia invalido' }, { status: 400 })
      }
      data.dueDay = d
    }
    if (body.categoryId !== undefined) {
      data.categoryId = body.categoryId === null ? null : String(body.categoryId)
    }
    if (body.description !== undefined) {
      data.description = body.description === null ? null : String(body.description)
    }

    const updated = await prisma.recurringExpense.update({ where: { id }, data })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('[PATCH /api/recurring-expenses/:id]', error)
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const userId = await getSessionUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })
    }
    const existing = await prisma.recurringExpense.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Nao encontrado' }, { status: 404 })
    }
    if (existing.userId && existing.userId !== userId) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 403 })
    }
    await prisma.recurringExpense.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    const prismaError = error as { code?: string }
    if (prismaError.code === 'P2025') {
      return NextResponse.json({ error: 'Nao encontrado' }, { status: 404 })
    }
    console.error('[DELETE /api/recurring-expenses/:id]', error)
    return NextResponse.json({ error: 'Erro ao remover' }, { status: 500 })
  }
}
