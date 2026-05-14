import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

const fixedExpenseSchema = z.object({
  name: z.string().trim().min(1, 'Nome da conta obrigatorio'),
  amount: z.number().positive('Valor da conta deve ser maior que zero'),
  dueDay: z.number().int().min(1).max(31),
})

const onboardingSchema = z.object({
  name: z.string().trim().min(1, 'Nome obrigatorio').max(80),
  salary: z.number().positive('Salario deve ser maior que zero'),
  payDay: z.number().int().min(1).max(31),
  extraIncome: z.number().min(0).default(0),
  financialProfile: z.enum(['essencial', 'equilibrado', 'crescimento']),
  primaryGoal: z.enum(['organizar', 'economizar', 'quitar-dividas', 'investir']),
  fixedExpenses: z.array(fixedExpenseSchema).max(12).default([]),
})

export async function POST(request: NextRequest) {
  try {
    const userId = await getSessionUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = onboardingSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Dados invalidos' },
        { status: 400 }
      )
    }

    const data = parsed.data
    const recurringIncomeRows = [
      {
        description: 'Salario principal',
        amount: data.salary,
        dayOfMonth: data.payDay,
        startMonth: 1,
        endMonth: 12,
        userId,
      },
      ...(data.extraIncome > 0
        ? [
            {
              description: 'Renda extra media',
              amount: data.extraIncome,
              dayOfMonth: Math.min(28, data.payDay + 5),
              startMonth: 1,
              endMonth: 12,
              userId,
            },
          ]
        : []),
    ]

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          name: data.name,
          onboardingCompleted: true,
          onboardingCompletedAt: new Date(),
          monthlyIncomeTarget: data.salary + data.extraIncome,
          payDay: data.payDay,
          financialProfile: data.financialProfile,
          primaryGoal: data.primaryGoal,
        },
      })

      await tx.recurringIncome.deleteMany({ where: { userId } })
      await tx.recurringExpense.deleteMany({ where: { userId } })

      await tx.recurringIncome.createMany({
        data: recurringIncomeRows,
      })

      if (data.fixedExpenses.length > 0) {
        await tx.recurringExpense.createMany({
          data: data.fixedExpenses.map((item) => ({
            name: item.name,
            amount: item.amount,
            dueDay: item.dueDay,
            userId,
          })),
        })
      }
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[POST /api/onboarding]', error)
    return NextResponse.json({ error: 'Erro ao salvar onboarding' }, { status: 500 })
  }
}
