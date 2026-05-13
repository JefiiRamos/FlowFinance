import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Assistente de gastos | FlowFinance',
  description: 'Envie mensagens curtas sobre o que gastou. Em breve, o assistente registrará automaticamente no dashboard.',
}

export default function AssistenteLayout({ children }: { children: React.ReactNode }) {
  return children
}
