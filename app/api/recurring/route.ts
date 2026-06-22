import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/auth-server'
import { expenseCategoryDbNameToForm } from '@/lib/expense-category-from-seed'

export const dynamic = 'force-dynamic'

function pad(value: number) {
  return String(value).padStart(2, '0')
}

export async function POST() {
  try {
    const userId = await getSessionUserId()

    if (!userId) {
      return NextResponse.json({ created: 0, message: 'Nao autenticado' })
    }

    const rules = await prisma.recurringIncome.findMany({
      where: { userId },
    })

    const recurringExpenses = await prisma.recurringExpense.findMany({
      where: { userId },
      include: { category: true },
    })

    if (rules.length === 0 && recurringExpenses.length === 0) {
      return NextResponse.json({ created: 0, message: 'Nenhuma regra' })
    }

    const now = new Date()
    const year = now.getFullYear()
    const today = now.getDate()
    const currentMonth = now.getMonth() + 1
    let created = 0

    for (const rule of rules) {
      const start = rule.startMonth
      const end = rule.endMonth

      const months =
        start <= end
          ? Array.from({ length: end - start + 1 }, (_, i) => start + i)
          : [
              ...Array.from({ length: 12 - start + 1 }, (_, i) => start + i),
              ...Array.from({ length: end }, (_, i) => i + 1),
            ]

      for (const month of months) {
        if (month < 1 || month > 12) continue

        const lastDay = new Date(year, month, 0).getDate()
        const day = Math.min(rule.dayOfMonth, lastDay)
        const hasPassed = month < currentMonth || (month === currentMonth && today >= day)

        if (!hasPassed) continue

        const date = new Date(year, month - 1, day)
        const recurringKey = `income:${userId}:${rule.id}:${year}-${pad(month)}`

        const transaction = await prisma.transaction.upsert({
          where: { recurringKey },
          update: {},
          create: {
            recurringKey,
            source: 'recurring',
            type: 'income',
            amount: rule.amount,
            date,
            description: rule.description,
            userId,
            category: 'Outros',
            paymentMethod: 'Outros',
          },
        })

        if (transaction.createdAt.getTime() > Date.now() - 5000) {
          created++
        }
      }
    }

    for (const exp of recurringExpenses) {
      const lastDay = new Date(year, currentMonth, 0).getDate()
      const day = Math.min(exp.dueDay, lastDay)
      const hasPassed = today >= day

      if (!hasPassed) continue

      const date = new Date(year, currentMonth - 1, day)
      const categoryLabel = expenseCategoryDbNameToForm(exp.category?.name)
      const recurringKey = `expense:${userId}:${exp.id}:${year}-${pad(currentMonth)}`

      const transaction = await prisma.transaction.upsert({
        where: { recurringKey },
        update: {},
        create: {
          recurringKey,
          source: 'recurring',
          type: 'expense',
          amount: exp.amount,
          date,
          description: exp.name,
          userId,
          categoryId: exp.categoryId ?? undefined,
          category: categoryLabel,
          paymentMethod: 'Outros',
        },
      })

      if (transaction.createdAt.getTime() > Date.now() - 5000) {
        created++
      }
    }

    return NextResponse.json({ created })
  } catch (error) {
    console.error('[POST /api/recurring/sync]', error)
    return NextResponse.json({ error: 'Erro ao sincronizar' }, { status: 500 })
  }
}