import { z } from 'zod'

const categoryEnum = z.enum([
  'Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação', 'Investimentos', 'Outros',
])
const paymentEnum = z.enum([
  'Dinheiro', 'PIX', 'Cartão de Crédito', 'Cartão de Débito', 'Transferência', 'Outros',
])

export const createTransactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive('O valor deve ser maior que zero'),
  date: z.union([
    z.string().datetime(),
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida. Use YYYY-MM-DD'),
  ]),
  description: z.string().optional(),
  category: categoryEnum.optional(),
  paymentMethod: paymentEnum.optional(),
})

export const updateTransactionSchema = createTransactionSchema.partial()

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>
