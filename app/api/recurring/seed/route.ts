import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/auth-server'

/**
 * POST /api/recurring/seed
 * Cria regras padrão do usuário: dia 5, Maio 3k, Set-Dez 5k
 */
export async function POST() {
  try {
    const userId = await getSessionUserId()
    const count = await prisma.recurringIncome.count({
      where: userId ? { OR: [{ userId }, { userId: null }] } : {},
    })
    if (count > 0) {
      return NextResponse.json({ message: 'Regras já existem', count })
    }

    await prisma.recurringIncome.createMany({
      data: [
        { dayOfMonth: 5, amount: 3000, startMonth: 5, endMonth: 8, description: 'Salário', userId: userId ?? undefined },
        { dayOfMonth: 5, amount: 5000, startMonth: 9, endMonth: 12, description: 'Salário', userId: userId ?? undefined },
      ],
    })

    return NextResponse.json({ message: 'Regras criadas', count: 2 })
  } catch (error) {
    console.error('[POST /api/recurring/seed]', error)
    return NextResponse.json({ error: 'Erro ao criar regras' }, { status: 500 })
  }
}
