'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  ChevronLeft,
  FileBarChart,
  FlaskConical,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  Receipt,
  Repeat,
  Target,
  User,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getUser } from '@/lib/auth'

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

const SIDEBAR_ENTRIES: NavEntry[] = [
  { kind: 'section', id: 'inicio', label: 'Inicio', icon: LayoutDashboard },
  { kind: 'link', href: ASSISTENTE_HREF, label: 'Assistente', icon: MessageSquareText },
  { kind: 'section', id: 'transacoes', label: 'Transacoes', icon: Receipt },
  { kind: 'section', id: 'graficos', label: 'Graficos', icon: BarChart3 },
  { kind: 'section', id: 'metas', label: 'Metas', icon: Target },
  { kind: 'section', id: 'simulador', label: 'Simulador', icon: FlaskConical },
  { kind: 'section', id: 'despesas-fixas', label: 'Fixas', icon: Repeat },
  { kind: 'section', id: 'contas', label: 'Contas', icon: Wallet },
  { kind: 'section', id: 'relatorios', label: 'Relatorios', icon: FileBarChart },
]

const MOBILE_TAB_ENTRIES = SIDEBAR_ENTRIES.slice(0, 6)

interface AppShellProps {
  section: NavSection
  onSectionChange: (section: NavSection) => void
  children: React.ReactNode
  onLogout: () => void
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
  const user = getUser()

  const navRowClass =
    'group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all duration-300 hover:translate-x-1'

  const activeClass = 'border border-primary/20 bg-primary/10 text-white shadow-lg shadow-black/20'
  const idleClass = 'border border-transparent text-[#A1A7B3] hover:bg-white/[0.04] hover:text-white'

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <aside
        className={cn(
          'fixed bottom-4 left-4 top-4 z-40 hidden flex-col rounded-2xl border border-white/5 bg-[#0F131C]/85 shadow-2xl shadow-black/20 backdrop-blur-xl transition-all duration-300 lg:flex',
          sidebarOpen ? 'w-64' : 'w-[74px]'
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-3">
          <div className={cn('flex min-w-0 items-center gap-3', !sidebarOpen && 'justify-center')}>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-white shadow-lg shadow-black/20">
              F
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">FlowFinance</p>
                <p className="truncate text-xs font-medium text-[#6B7280]">Premium finance</p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={cn(
              'flex size-9 items-center justify-center rounded-xl text-[#A1A7B3] transition-all duration-300 hover:bg-white/[0.04] hover:text-white',
              !sidebarOpen && 'absolute -right-3 top-5 border border-white/5 bg-[#141924]'
            )}
            aria-label={sidebarOpen ? 'Recolher menu' : 'Expandir menu'}
          >
            {sidebarOpen ? <ChevronLeft className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
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
                    className={cn(navRowClass, isActive ? activeClass : idleClass, !sidebarOpen && 'justify-center px-0')}
                  >
                    <Icon className="size-5 shrink-0" />
                    {sidebarOpen && <span className="truncate">{entry.label}</span>}
                  </button>
                )
              }

              const isActive = pathname === entry.href || pathname.startsWith(`${entry.href}/`)
              return (
                <Link
                  key={entry.href}
                  href={entry.href}
                  className={cn(navRowClass, isActive ? activeClass : idleClass, !sidebarOpen && 'justify-center px-0')}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="size-5 shrink-0" />
                  {sidebarOpen && <span className="truncate">{entry.label}</span>}
                </Link>
              )
            }

            const isActive = section === entry.id
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => onSectionChange(entry.id)}
                className={cn(navRowClass, isActive ? activeClass : idleClass, !sidebarOpen && 'justify-center px-0')}
              >
                <Icon className="size-5 shrink-0" />
                {sidebarOpen && <span className="truncate">{entry.label}</span>}
              </button>
            )
          })}
        </nav>

        <div className="space-y-3 border-t border-white/5 p-3">
          <div
            className={cn(
              'flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-3',
              !sidebarOpen && 'justify-center p-2'
            )}
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-primary">
              <User className="size-5" />
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{user?.name ?? 'Usuario'}</p>
                <p className="truncate text-xs font-medium text-[#6B7280]">Conta ativa</p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onLogout}
            className={cn(
              'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#A1A7B3] transition-all duration-300 hover:bg-red-500/10 hover:text-red-400',
              !sidebarOpen && 'justify-center px-0'
            )}
          >
            <LogOut className="size-5 shrink-0" />
            {sidebarOpen && <span>Sair</span>}
          </button>
        </div>
      </aside>

      <div
        className={cn(
          'flex min-h-screen flex-1 flex-col pb-24 transition-all duration-300 lg:pb-0',
          sidebarOpen ? 'lg:pl-[18rem]' : 'lg:pl-[6.5rem]'
        )}
      >
        <header className="sticky top-0 z-30 flex shrink-0 items-center justify-end gap-2 border-b border-white/5 bg-[#090B10]/80 px-4 py-3 backdrop-blur-xl lg:hidden">
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-xl text-muted-foreground transition-all duration-300 hover:bg-white/[0.04] hover:text-foreground"
            aria-label="Perfil"
          >
            <User className="size-5" />
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="flex size-10 items-center justify-center rounded-xl text-muted-foreground transition-all duration-300 hover:bg-red-500/10 hover:text-red-400"
            aria-label="Sair"
          >
            <LogOut className="size-5" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>

        <nav className="fixed bottom-3 left-3 right-3 z-40 flex items-center justify-around rounded-2xl border border-white/5 bg-[#0F131C]/90 p-2 shadow-2xl shadow-black/20 backdrop-blur-xl lg:hidden">
          {MOBILE_TAB_ENTRIES.map((entry) => {
            const Icon = entry.icon

            if (entry.kind === 'link') {
              const isActive = pathname === entry.href || pathname.startsWith(`${entry.href}/`)
              return (
                <Link
                  key={entry.href}
                  href={entry.href}
                  className={cn(
                    'flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1.5 py-2 text-[10px] font-semibold transition-all duration-300 sm:text-xs',
                    isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-white/[0.04] hover:text-white'
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
                  'flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1.5 py-2 text-[10px] font-semibold transition-all duration-300 sm:text-xs',
                  isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-white/[0.04] hover:text-white'
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
