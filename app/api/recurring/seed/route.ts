import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const userId = await getSessionUserId()
    const count = await prisma.recurringIncome.count({
      where: userId ? { OR: [{ userId }, { userId: null }] } : {},
    })
    if (count > 0) {
      return NextResponse.json({ message: 'Regras já existem', count })
    }

    const now = new Date()
    const currentMonth = now.getMonth() + 1

    await prisma.recurringIncome.createMany({
      data: [
        // Do mês atual até abril: R$ 1.500
        {
          dayOfMonth: 5, // aproximação do 5º dia útil
          amount: 1500,
          startMonth: currentMonth,
          endMonth: 4,
          description: 'Salário',
          userId: userId ?? undefined,
        },
        // Maio a agosto: R$ 3.000
        {
          dayOfMonth: 5,
          amount: 3000,
          startMonth: 5,
          endMonth: 8,
          description: 'Salário',
          userId: userId ?? undefined,
        },
        // A partir de setembro: R$ 5.000 (setembro a dezembro)
        {
          dayOfMonth: 5,
          amount: 5000,
          startMonth: 9,
          endMonth: 12,
          description: 'Salário',
          userId: userId ?? undefined,
        },
      ],
    })

    return NextResponse.json({ message: 'Regras criadas', count: 3 })
  } catch (error) {
    console.error('[POST /api/recurring/seed]', error)
    return NextResponse.json({ error: 'Erro ao criar regras' }, { status: 500 })
  }
}
