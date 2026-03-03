import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createTransactionSchema } from '@/lib/validations/transaction'
import { getSessionUserId } from '@/lib/auth-server'

/**
 * GET /api/transactions
 * Retorna transações do usuário logado
 */
export async function GET() {
  try {
    const userId = await getSessionUserId()
    const transactions = await prisma.transaction.findMany({
      where: userId ? { OR: [{ userId }, { userId: null }] } : {},
      orderBy: { date: 'asc' },
    })
    return NextResponse.json(transactions)
  } catch (error) {
    console.error('[GET /api/transactions]', error)
    return NextResponse.json(
      { error: 'Erro ao buscar transações' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/transactions
 * Cria uma nova transação com validação
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const parsed = createTransactionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { type, amount, date, description } = parsed.data
    const dateObj = new Date(date)
    const userId = await getSessionUserId()

    const transaction = await prisma.transaction.create({
      data: {
        type,
        amount,
        date: dateObj,
        description: description ?? null,
        userId: userId ?? undefined,
      },
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('[POST /api/transactions]', error)
    return NextResponse.json(
      { error: 'Erro ao criar transação' },
      { status: 500 }
    )
  }
}
