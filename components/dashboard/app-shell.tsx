'use client'

import { useState } from 'react'
import {
  LayoutDashboard,
  Target,
  Repeat,
  Wallet,
  FileBarChart,
  Menu,
  ChevronLeft,
  LogOut,
  User,
  Receipt,
  BarChart3,
  FlaskConical,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type NavSection =
  | 'inicio'
  | 'transacoes'
  | 'graficos'
  | 'metas'
  | 'simulador'
  | 'despesas-fixas'
  | 'contas'
  | 'relatorios'

const SIDEBAR_ITEMS: { id: NavSection; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'inicio', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transacoes', label: 'Transacoes', icon: Receipt },
  { id: 'graficos', label: 'Graficos', icon: BarChart3 },
  { id: 'metas', label: 'Metas', icon: Target },
  { id: 'simulador', label: 'Simulador', icon: FlaskConical },
  { id: 'despesas-fixas', label: 'Despesas fixas', icon: Repeat },
  { id: 'contas', label: 'Contas', icon: Wallet },
  { id: 'relatorios', label: 'Relatorios', icon: FileBarChart },
]

interface AppShellProps {
  section: NavSection
  onSectionChange: (section: NavSection) => void
  children: React.ReactNode
  onLogout: () => void
}

export function AppShell({ section, onSectionChange, children, onLogout }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-white/10 bg-black/40 backdrop-blur-xl transition-all duration-300 lg:flex',
          sidebarOpen ? 'w-56' : 'w-16'
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-3">
          {sidebarOpen && (
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-sm font-bold text-transparent">FlowFinance 3.0</span>
          )}
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
            aria-label={sidebarOpen ? 'Recolher menu' : 'Expandir menu'}
          >
            {sidebarOpen ? (
              <ChevronLeft className="size-4" />
            ) : (
              <Menu className="size-4" />
            )}
          </button>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = section === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSectionChange(item.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/20 text-primary'
                    : 'text-muted-foreground hover:bg-white/10 hover:text-foreground'
                )}
              >
                <Icon className="size-5 shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            )
          })}
        </nav>
        <div className="border-t border-white/10 p-2">
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-red-500/20 hover:text-red-400"
          >
            <LogOut className="size-5 shrink-0" />
            {sidebarOpen && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main content area - offset for desktop sidebar */}
      <div
        className={cn(
          'flex min-h-screen flex-1 flex-col pb-20 lg:pb-0',
          sidebarOpen ? 'lg:pl-56' : 'lg:pl-16'
        )}
      >
        {/* Mobile header with user */}
        <header className="sticky top-0 z-30 flex shrink-0 items-center justify-end gap-1 border-b border-white/10 bg-black/40 px-4 py-2 backdrop-blur-xl lg:hidden">
          <button
            type="button"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
            aria-label="Perfil"
          >
            <User className="size-5" />
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-500/20 hover:text-red-400"
            aria-label="Sair"
          >
            <LogOut className="size-5" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>

        {/* Mobile bottom nav - first 5 items */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-white/10 bg-black/80 py-2 backdrop-blur-xl lg:hidden">
          {SIDEBAR_ITEMS.slice(0, 5).map((item) => {
            const Icon = item.icon
            const isActive = section === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSectionChange(item.id)}
                className={cn(
                  'flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <Icon className="size-5" />
                <span className="truncate max-w-[4rem]">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
