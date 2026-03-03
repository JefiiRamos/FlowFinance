import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

/**
 * POST /api/recurring/sync
 * Cria transações automaticamente para rendas recorrentes do usuário
 */
export async function POST() {
  try {
    const userId = await getSessionUserId()
    const rules = await prisma.recurringIncome.findMany({
      where: userId ? { OR: [{ userId }, { userId: null }] } : {},
    })
    if (rules.length === 0) return NextResponse.json({ created: 0, message: 'Nenhuma regra' })

    const now = new Date()
    const year = now.getFullYear()
    const today = now.getDate()
    let created = 0

    for (const rule of rules) {
      const start = rule.startMonth
      const end = rule.endMonth
      const months = start <= end
        ? Array.from({ length: end - start + 1 }, (_, i) => start + i)
        : [...Array.from({ length: 12 - start + 1 }, (_, i) => start + i), ...Array.from({ length: end }, (_, i) => i + 1)]

      const currentMonth = now.getMonth() + 1
      for (const month of months) {
        if (month < 1 || month > 12) continue
        const lastDay = new Date(year, month, 0).getDate()
        const day = Math.min(rule.dayOfMonth, lastDay)
        const date = new Date(year, month - 1, day)

        const hasPassed = month < currentMonth || (month === currentMonth && today >= day)
        if (!hasPassed) continue

        const startOfDay = new Date(year, month - 1, day)
        const endOfDay = new Date(year, month - 1, day, 23, 59, 59)

        const existing = await prisma.transaction.findFirst({
          where: {
            type: 'income',
            description: rule.description,
            date: { gte: startOfDay, lte: endOfDay },
          },
        })
        if (existing) continue

        await prisma.transaction.create({
          data: {
            type: 'income',
            amount: rule.amount,
            date,
            description: rule.description,
            userId: userId ?? undefined,
          },
        })
        created++
      }
    }

    return NextResponse.json({ created })
  } catch (error) {
    console.error('[POST /api/recurring/sync]', error)
    return NextResponse.json({ error: 'Erro ao sincronizar' }, { status: 500 })
  }
}
