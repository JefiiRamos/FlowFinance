import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Assistente de gastos | FlowFinance',
  description:
    'Assistente com OpenAI: descreva gastos ou receitas em frases curtas e registre automaticamente no dashboard.',
}

export default function AssistenteLayout({ children }: { children: React.ReactNode }) {
  return children
}
