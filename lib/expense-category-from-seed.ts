import type { CategoryId } from '@/lib/constants'
import { CATEGORIES } from '@/lib/constants'

/** Nomes no seed Prisma (sem acento) → ids usados no front / validação Zod */
const SEED_EXPENSE_NAME_TO_FORM: Record<string, CategoryId> = {
  Alimentacao: 'Alimentação',
  Transporte: 'Transporte',
  Moradia: 'Moradia',
  Lazer: 'Lazer',
  Saude: 'Saúde',
  Educacao: 'Educação',
  Investimentos: 'Investimentos',
  Outros: 'Outros',
}

/** Converte nome da tabela Category (seed) para o id de categoria do formulário. */
export function expenseCategoryDbNameToForm(dbName: string | null | undefined): CategoryId | 'Outros' {
  if (!dbName) return 'Outros'
  if (CATEGORIES.some((c) => c.id === dbName)) return dbName as CategoryId
  return SEED_EXPENSE_NAME_TO_FORM[dbName] ?? 'Outros'
}
