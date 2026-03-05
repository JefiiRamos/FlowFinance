import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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

  console.log('Seed concluido')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
