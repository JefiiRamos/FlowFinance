import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateTransactionSchema } from '@/lib/validations/transaction'
import { getSessionUserId } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

type RouteParams = { params: Promise<{ id: string }> }

/**
 * PUT /api/transactions/:id
 * Atualiza uma transação existente
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const userId = await getSessionUserId()

    const existing = await prisma.transaction.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Transação não encontrada' }, { status: 404 })
    }
    if (userId && existing.userId && existing.userId !== userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = updateTransactionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { type, amount, date, description, category, paymentMethod } = parsed.data
    const updateData: Record<string, unknown> = {}
    if (type != null) updateData.type = type
    if (amount != null) {
      if (amount <= 0) {
        return NextResponse.json(
          { error: 'O valor deve ser maior que zero' },
          { status: 400 }
        )
      }
      updateData.amount = amount
    }
    if (date != null) updateData.date = new Date(date)
    if (description !== undefined) updateData.description = description ?? null
    if (category !== undefined) updateData.category = category ?? 'Outros'
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod ?? 'Outros'

    const transaction = await prisma.transaction.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('[PUT /api/transactions/:id]', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar transação' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/transactions/:id
 * Deleta uma transação por ID
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const userId = await getSessionUserId()

    const existing = await prisma.transaction.findUnique({ where: { id } })
    if (existing && userId && existing.userId && existing.userId !== userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    await prisma.transaction.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    const prismaError = error as { code?: string }
    if (prismaError.code === 'P2025') {
      return NextResponse.json({ error: 'Transação não encontrada' }, { status: 404 })
    }
    console.error('[DELETE /api/transactions/:id]', error)
    return NextResponse.json(
      { error: 'Erro ao deletar transação' },
      { status: 500 }
    )
  }
}
