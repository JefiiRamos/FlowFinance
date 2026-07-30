/**
 * Zera saldo e receitas exibidos no dashboard para um usuário:
 * o app calcula tudo a partir de transações; remove também rendas/despesas
 * recorrentes desse usuário e zera saldos de contas, para o sync não repovoar.
 *
 * Uso (na raiz do projeto, com DATABASE_URL no .env):
 *   npx tsx scripts/reset-user-finances.ts
 *   npx tsx scripts/reset-user-finances.ts outro@email.com
 */
import 'dotenv/config'
import { createPrismaClient } from '../lib/create-prisma-client'

const DEFAULT_EMAIL = 'jefao@gmail.com'

async function main() {
  const emailArg = (process.argv[2] ?? DEFAULT_EMAIL).trim()
  const prisma = createPrismaClient()

  try {
    const user = await prisma.user.findFirst({
      where: { email: { equals: emailArg, mode: 'insensitive' } },
    })
    if (!user) {
      console.error(`Usuário não encontrado: ${emailArg}`)
      process.exit(1)
    }

    console.log(`Alvo: ${user.email} (id ${user.id})`)
    console.log('Removendo transações, recorrências e zerando contas…')

    const stats = await prisma.$transaction(async (tx) => {
      const transactions = await tx.transaction.deleteMany({ where: { userId: user.id } })
      const recurringIncomes = await tx.recurringIncome.deleteMany({ where: { userId: user.id } })
      const recurringExpenses = await tx.recurringExpense.deleteMany({ where: { userId: user.id } })
      const accounts = await tx.account.updateMany({
        where: { userId: user.id },
        data: { balance: 0 },
      })
      return {
        transactionsDeleted: transactions.count,
        recurringIncomesDeleted: recurringIncomes.count,
        recurringExpensesDeleted: recurringExpenses.count,
        accountsBalanceReset: accounts.count,
      }
    })

    console.log('Feito:', stats)
    console.log('Saldo total e receitas do mês passam a refletir lista vazia (zero) após recarregar o app.')
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
