import { TrendingUp } from 'lucide-react'

export function Header() {
  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center rounded-xl bg-primary/20 p-2">
          <TrendingUp className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">FlowFinance</h1>
          <p className="text-xs text-muted-foreground">Gestao financeira inteligente</p>
        </div>
      </div>
      <div className="hidden items-center gap-2 sm:flex">
        <span className="inline-flex items-center rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-medium text-success">
          Ativo
        </span>
      </div>
    </header>
  )
}
