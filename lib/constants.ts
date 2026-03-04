import type { LucideIcon } from 'lucide-react'
import {
  UtensilsCrossed,
  Car,
  Home,
  PartyPopper,
  HeartPulse,
  GraduationCap,
  TrendingUp,
  MoreHorizontal,
  Banknote,
  Smartphone,
  CreditCard,
  Wallet,
  ArrowLeftRight,
} from 'lucide-react'

export const CATEGORIES = [
  { id: 'Alimentação', label: 'Alimentação', icon: UtensilsCrossed },
  { id: 'Transporte', label: 'Transporte', icon: Car },
  { id: 'Moradia', label: 'Moradia', icon: Home },
  { id: 'Lazer', label: 'Lazer', icon: PartyPopper },
  { id: 'Saúde', label: 'Saúde', icon: HeartPulse },
  { id: 'Educação', label: 'Educação', icon: GraduationCap },
  { id: 'Investimentos', label: 'Investimentos', icon: TrendingUp },
  { id: 'Outros', label: 'Outros', icon: MoreHorizontal },
] as const

export type CategoryId = (typeof CATEGORIES)[number]['id']

export const PAYMENT_METHODS = [
  { id: 'Dinheiro', label: 'Dinheiro', icon: Banknote },
  { id: 'PIX', label: 'PIX', icon: Smartphone },
  { id: 'Cartão de Crédito', label: 'Cartão de Crédito', icon: CreditCard },
  { id: 'Cartão de Débito', label: 'Cartão de Débito', icon: CreditCard },
  { id: 'Transferência', label: 'Transferência', icon: ArrowLeftRight },
  { id: 'Outros', label: 'Outros', icon: Wallet },
] as const

export type PaymentMethodId = (typeof PAYMENT_METHODS)[number]['id']

export function getCategoryIcon(categoryId: string): LucideIcon {
  const c = CATEGORIES.find((x) => x.id === categoryId)
  return c?.icon ?? MoreHorizontal
}

export function getPaymentIcon(paymentId: string): LucideIcon {
  const p = PAYMENT_METHODS.find((x) => x.id === paymentId)
  return p?.icon ?? Wallet
}
