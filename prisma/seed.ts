import 'dotenv/config'
import { hash } from 'bcryptjs'
import { DEMO_ACCOUNT } from '../lib/demo-account'
import { createPrismaClient } from '../lib/create-prisma-client'

const prisma = createPrismaClient()

async function main() {
  const categories = [
    { id: 'cat-alimentacao', name: 'Alimentacao', type: 'expense' as const, icon: 'UtensilsCrossed' },
    { id: 'cat-transporte', name: 'Transporte', type: 'expense' as const, icon: 'Car' },
    { id: 'cat-moradia', name: 'Moradia', type: 'expense' as const, icon: 'Home' },
    { id: 'cat-lazer', name: 'Lazer', type: 'expense' as const, icon: 'PartyPopper' },
    { id: 'cat-saude', name: 'Saude', type: 'expense' as const, icon: 'HeartPulse' },
    { id: 'cat-educacao', name: 'Educacao', type: 'expense' as const, icon: 'GraduationCap' },
    { id: 'cat-investimentos-exp', name: 'Investimentos', type: 'expense' as const, icon: 'TrendingUp' },
    { id: 'cat-outros-exp', name: 'Outros', type: 'expense' as const, icon: 'MoreHorizontal' },
    { id: 'cat-salario', name: 'Salario', type: 'income' as const, icon: 'DollarSign' },
    { id: 'cat-freelance', name: 'Freelance', type: 'income' as const, icon: 'Briefcase' },
    { id: 'cat-outros-inc', name: 'Outros', type: 'income' as const, icon: 'MoreHorizontal' },
  ]

  for (const c of categories) {
    await prisma.category.upsert({
      where: { id: c.id },
      create: c,
      update: { name: c.name, type: c.type, icon: c.icon },
    })
  }

  const paymentMethods = [
    { id: 'pm-dinheiro', name: 'Dinheiro' },
    { id: 'pm-pix', name: 'PIX' },
    { id: 'pm-cc', name: 'Cartao de Credito' },
    { id: 'pm-cd', name: 'Cartao de Debito' },
    { id: 'pm-transferencia', name: 'Transferencia' },
    { id: 'pm-outros', name: 'Outros' },
  ]
  for (const pm of paymentMethods) {
    await prisma.paymentMethod.upsert({
      where: { id: pm.id },
      create: pm,
      update: { name: pm.name },
    })
  }

  const passwordHash = await hash(DEMO_ACCOUNT.password, 10)
  const demoUser = await prisma.user.upsert({
    where: { email: DEMO_ACCOUNT.email },
    create: {
      email: DEMO_ACCOUNT.email,
      passwordHash,
      name: DEMO_ACCOUNT.name,
      onboardingCompleted: true,
      onboardingCompletedAt: new Date(),
      monthlyIncomeTarget: 5200,
      payDay: 5,
      financialProfile: 'equilibrado',
      primaryGoal: 'reserva_emergencia',
    },
    update: {
      passwordHash,
      name: DEMO_ACCOUNT.name,
      onboardingCompleted: true,
    },
  })

  await prisma.transaction.deleteMany({ where: { userId: demoUser.id } })
  await prisma.goal.deleteMany({ where: { userId: demoUser.id } })
  await prisma.budgetLimit.deleteMany({ where: { userId: demoUser.id } })

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  await prisma.transaction.createMany({
    data: [
      {
        userId: demoUser.id,
        type: 'income',
        amount: 5200,
        date: new Date(monthStart.getFullYear(), monthStart.getMonth(), 5),
        description: 'Salario CLT',
        category: 'Salario',
        paymentMethod: 'Transferencia',
        categoryId: 'cat-salario',
        paymentMethodId: 'pm-transferencia',
        source: 'manual',
      },
      {
        userId: demoUser.id,
        type: 'income',
        amount: 800,
        date: new Date(monthStart.getFullYear(), monthStart.getMonth(), 18),
        description: 'Freelance design',
        category: 'Freelance',
        paymentMethod: 'PIX',
        categoryId: 'cat-freelance',
        paymentMethodId: 'pm-pix',
        source: 'manual',
      },
      {
        userId: demoUser.id,
        type: 'expense',
        amount: 1450,
        date: new Date(monthStart.getFullYear(), monthStart.getMonth(), 8),
        description: 'Aluguel',
        category: 'Moradia',
        paymentMethod: 'PIX',
        categoryId: 'cat-moradia',
        paymentMethodId: 'pm-pix',
        source: 'manual',
      },
      {
        userId: demoUser.id,
        type: 'expense',
        amount: 420,
        date: new Date(monthStart.getFullYear(), monthStart.getMonth(), 12),
        description: 'Supermercado',
        category: 'Alimentacao',
        paymentMethod: 'Cartao de Debito',
        categoryId: 'cat-alimentacao',
        paymentMethodId: 'pm-cd',
        source: 'manual',
      },
      {
        userId: demoUser.id,
        type: 'expense',
        amount: 189,
        date: new Date(monthStart.getFullYear(), monthStart.getMonth(), 15),
        description: 'Uber / transporte',
        category: 'Transporte',
        paymentMethod: 'Cartao de Credito',
        categoryId: 'cat-transporte',
        paymentMethodId: 'pm-cc',
        source: 'manual',
      },
      {
        userId: demoUser.id,
        type: 'expense',
        amount: 95,
        date: new Date(monthStart.getFullYear(), monthStart.getMonth(), 20),
        description: 'Cinema e lazer',
        category: 'Lazer',
        paymentMethod: 'Cartao de Credito',
        categoryId: 'cat-lazer',
        paymentMethodId: 'pm-cc',
        source: 'manual',
      },
    ],
  })

  await prisma.goal.create({
    data: {
      userId: demoUser.id,
      name: 'Reserva de emergencia',
      targetAmount: 10000,
      currentAmount: 3200,
      deadline: new Date(now.getFullYear(), 11, 31),
    },
  })

  await prisma.budgetLimit.createMany({
    data: [
      { userId: demoUser.id, category: 'Alimentacao', limit: 600 },
      { userId: demoUser.id, category: 'Transporte', limit: 350 },
      { userId: demoUser.id, category: 'Lazer', limit: 300 },
    ],
  })

  console.log('Seed concluido')
  console.log(`Conta demo: ${DEMO_ACCOUNT.email} / ${DEMO_ACCOUNT.password}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
