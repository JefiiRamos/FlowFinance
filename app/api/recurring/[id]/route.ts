import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

type RouteParams = { params: Promise<{ id: string }> }

/**
 * PATCH /api/recurring/:id - Atualiza uma renda recorrente
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const userId = await getSessionUserId()

    const existing = await prisma.recurringIncome.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Regra não encontrada' }, { status: 404 })
    }
    if (userId && existing.userId && existing.userId !== userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const body = await request.json()
    const data: Record<string, unknown> = {}

    if (body.description !== undefined) {
      if (!body.description || typeof body.description !== 'string') {
        return NextResponse.json({ error: 'Descrição inválida' }, { status: 400 })
      }
      data.description = body.description.trim()
    }
    if (body.amount !== undefined) {
      if (typeof body.amount !== 'number' || body.amount <= 0) {
        return NextResponse.json({ error: 'Valor inválido' }, { status: 400 })
      }
      data.amount = body.amount
    }
    if (body.dayOfMonth !== undefined) {
      const day = Number(body.dayOfMonth)
      if (!Number.isInteger(day) || day < 1 || day > 31) {
        return NextResponse.json({ error: 'Dia inválido' }, { status: 400 })
      }
      data.dayOfMonth = day
    }
    if (body.startMonth !== undefined) {
      const start = Number(body.startMonth)
      if (!Number.isInteger(start) || start < 1 || start > 12) {
        return NextResponse.json({ error: 'Mês inicial inválido' }, { status: 400 })
      }
      data.startMonth = start
    }
    if (body.endMonth !== undefined) {
      const end = Number(body.endMonth)
      if (!Number.isInteger(end) || end < 1 || end > 12) {
        return NextResponse.json({ error: 'Mês final inválido' }, { status: 400 })
      }
      data.endMonth = end
    }

    const updated = await prisma.recurringIncome.update({
      where: { id },
      data,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[PATCH /api/recurring/:id]', error)
    return NextResponse.json({ error: 'Erro ao atualizar renda recorrente' }, { status: 500 })
  }
}

/**
 * DELETE /api/recurring/:id - Remove uma renda recorrente
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const userId = await getSessionUserId()

    const existing = await prisma.recurringIncome.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Regra não encontrada' }, { status: 404 })
    }
    if (userId && existing.userId && existing.userId !== userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    await prisma.recurringIncome.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[DELETE /api/recurring/:id]', error)
    return NextResponse.json({ error: 'Erro ao remover renda recorrente' }, { status: 500 })
  }
}

