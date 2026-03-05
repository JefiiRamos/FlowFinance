import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const userId = await getSessionUserId()
    const rules = await prisma.recurringIncome.findMany({
      where: userId ? { OR: [{ userId }, { userId: null }] } : {},
    })
    const recurringExpenses = await prisma.recurringExpense.findMany({
      where: userId ? { OR: [{ userId }, { userId: null }] } : {},
    })
    if (rules.length === 0 && recurringExpenses.length === 0) {
      return NextResponse.json({ created: 0, message: 'Nenhuma regra' })
    }

    const now = new Date()
    const year = now.getFullYear()
    const today = now.getDate()
    let created = 0

    // Sincroniza rendas recorrentes (income)
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

    // Sincroniza despesas recorrentes (expense) - apenas mês atual
    const currentMonth = now.getMonth() + 1
    for (const exp of recurringExpenses) {
      const lastDay = new Date(year, currentMonth, 0).getDate()
      const day = Math.min(exp.dueDay, lastDay)
      const date = new Date(year, currentMonth - 1, day)
      const hasPassed = now.getDate() >= day
      if (!hasPassed) continue

      const startOfDay = new Date(year, currentMonth - 1, day)
      const endOfDay = new Date(year, currentMonth - 1, day, 23, 59, 59)

      const existing = await prisma.transaction.findFirst({
        where: {
          type: 'expense',
          description: exp.name,
          date: { gte: startOfDay, lte: endOfDay },
          userId: userId ?? undefined,
        },
      })
      if (existing) continue

      await prisma.transaction.create({
        data: {
          type: 'expense',
          amount: exp.amount,
          date,
          description: exp.name,
          userId: userId ?? undefined,
          categoryId: exp.categoryId ?? undefined,
        },
      })
      created++
    }

    return NextResponse.json({ created })
  } catch (error) {
    console.error('[POST /api/recurring/sync]', error)
    return NextResponse.json({ error: 'Erro ao sincronizar' }, { status: 500 })
  }
}
