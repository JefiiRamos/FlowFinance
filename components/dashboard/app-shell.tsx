'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  MessageSquareText,
  type LucideIcon,
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

type NavEntry =
  | { kind: 'section'; id: NavSection; label: string; icon: LucideIcon }
  | { kind: 'link'; href: string; label: string; icon: LucideIcon }

const ASSISTENTE_HREF = '/assistente'

/** Ordem da sidebar: Assistente logo após o Dashboard para ficar fácil de achar. */
const SIDEBAR_ENTRIES: NavEntry[] = [
  { kind: 'section', id: 'inicio', label: 'Dashboard', icon: LayoutDashboard },
  { kind: 'link', href: ASSISTENTE_HREF, label: 'Assistente', icon: MessageSquareText },
  { kind: 'section', id: 'transacoes', label: 'Transacoes', icon: Receipt },
  { kind: 'section', id: 'graficos', label: 'Graficos', icon: BarChart3 },
  { kind: 'section', id: 'metas', label: 'Metas', icon: Target },
  { kind: 'section', id: 'simulador', label: 'Simulador', icon: FlaskConical },
  { kind: 'section', id: 'despesas-fixas', label: 'Despesas fixas', icon: Repeat },
  { kind: 'section', id: 'contas', label: 'Contas', icon: Wallet },
  { kind: 'section', id: 'relatorios', label: 'Relatorios', icon: FileBarChart },
]

/** Primeiros itens na barra inferior (mobile). */
const MOBILE_TAB_ENTRIES = SIDEBAR_ENTRIES.slice(0, 6)

interface AppShellProps {
  section: NavSection
  onSectionChange: (section: NavSection) => void
  children: React.ReactNode
  onLogout: () => void
  /** false = sidebar desktop usa botão que abre painel em vez de ir para /assistente */
  assistantNavUsesLink?: boolean
  assistantOverlayOpen?: boolean
  onAssistantSidebarClick?: () => void
}

export function AppShell({
  section,
  onSectionChange,
  children,
  onLogout,
  assistantNavUsesLink = true,
  assistantOverlayOpen = false,
  onAssistantSidebarClick,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()

  const navRowClass =
    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer'

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
          {SIDEBAR_ENTRIES.map((entry) => {
            const Icon = entry.icon
            if (entry.kind === 'link') {
              const isAssistente = entry.href === ASSISTENTE_HREF
              const usePanel = isAssistente && !assistantNavUsesLink && onAssistantSidebarClick
              if (usePanel) {
                const isActive = assistantOverlayOpen
                return (
                  <button
                    key={entry.href}
                    type="button"
                    onClick={onAssistantSidebarClick}
                    aria-pressed={isActive}
                    className={cn(
                      navRowClass,
                      isActive
                        ? 'bg-primary/20 text-primary'
                        : 'text-muted-foreground hover:bg-white/10 hover:text-foreground'
                    )}
                  >
                    <Icon className="size-5 shrink-0" />
                    {sidebarOpen && <span>{entry.label}</span>}
                  </button>
                )
              }
              const isActive = pathname === entry.href || pathname.startsWith(`${entry.href}/`)
              return (
                <Link
                  key={entry.href}
                  href={entry.href}
                  className={cn(
                    navRowClass,
                    isActive
                      ? 'bg-primary/20 text-primary'
                      : 'text-muted-foreground hover:bg-white/10 hover:text-foreground'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="size-5 shrink-0" />
                  {sidebarOpen && <span>{entry.label}</span>}
                </Link>
              )
            }
            const isActive = section === entry.id
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => onSectionChange(entry.id)}
                className={cn(
                  navRowClass,
                  isActive
                    ? 'bg-primary/20 text-primary'
                    : 'text-muted-foreground hover:bg-white/10 hover:text-foreground'
                )}
              >
                <Icon className="size-5 shrink-0" />
                {sidebarOpen && <span>{entry.label}</span>}
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

        {/* Mobile bottom nav — inclui Assistente junto às seções principais */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-white/10 bg-black/80 py-2 backdrop-blur-xl lg:hidden">
          {MOBILE_TAB_ENTRIES.map((entry) => {
            const Icon = entry.icon
            if (entry.kind === 'link') {
              const isActive = pathname === entry.href || pathname.startsWith(`${entry.href}/`)
              return (
                <Link
                  key={entry.href}
                  href={entry.href}
                  className={cn(
                    'flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-1.5 py-1.5 text-[10px] font-medium transition-colors sm:text-xs',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="size-5 shrink-0" />
                  <span className="truncate text-center leading-tight">{entry.label}</span>
                </Link>
              )
            }
            const isActive = section === entry.id
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => onSectionChange(entry.id)}
                className={cn(
                  'flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-1.5 py-1.5 text-[10px] font-medium transition-colors cursor-pointer sm:text-xs',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <Icon className="size-5 shrink-0" />
                <span className="truncate text-center leading-tight">{entry.label}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
