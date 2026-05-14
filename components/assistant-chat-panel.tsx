'use client'

import { useCallback, useEffect, useRef, useState, type CSSProperties, type TransitionEvent } from 'react'
import Link from 'next/link'
import { ArrowLeft, Bot, Loader2, SendHorizonal, Sparkles, User, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { getToken } from '@/lib/auth'

type ChatRole = 'user' | 'assistant'

export interface ChatLine {
  id: string
  role: ChatRole
  body: string
  meta?: string
}

const WELCOME_MESSAGES: ChatLine[] = [
  {
    id: 'welcome',
    role: 'assistant',
    body: 'Olá! Descreva em uma frase o que gastou ou recebeu. Entendo atalhos como “42 uber”, “mercado 180 ontem” ou “salário 4500”. Quando der para identificar valor e tipo, registro no seu dashboard.',
  },
]

const SUGGESTIONS = ['35 padaria', 'uber 18', '120 mercado hoje', '65 gasolina']

const OVERLAY_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'
const OVERLAY_SHELL_MS = 300
const OVERLAY_INNER_OPEN_MS = 190
const OVERLAY_INNER_CLOSE_MS = 165
const OVERLAY_INNER_OPEN_DELAY_MS = 78
const OVERLAY_SHELL_CLOSE_DELAY_MS = 52

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export type AssistantChatLayout = 'page' | 'overlay'

interface AssistantChatPanelProps {
  layout: AssistantChatLayout
  /** Só no modo página (mobile): link voltar */
  showBackLink?: boolean
  /** Modo janela: fechar */
  onClose?: () => void
  /** Quando definido, o overlay usa animação de abrir/fechar (valor controlado pelo pai). */
  overlayMotionOpen?: boolean
  /** `transform` do shell — usado para desmontar após fechar. */
  onOverlayShellTransitionEnd?: (e: TransitionEvent<HTMLDivElement>) => void
  /** Chamado após a IA registrar uma transação no servidor (ex.: atualizar o dashboard). */
  onTransactionCreated?: () => void | Promise<void>
}

export function AssistantChatPanel({
  layout,
  showBackLink,
  onClose,
  overlayMotionOpen,
  onOverlayShellTransitionEnd,
  onTransactionCreated,
}: AssistantChatPanelProps) {
  const isOverlay = layout === 'overlay'
  const [messages, setMessages] = useState<ChatLine[]>(WELCOME_MESSAGES)
  const [draft, setDraft] = useState('')
  const [isSending, setIsSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const motion = overlayMotionOpen !== undefined
  const open = motion ? Boolean(overlayMotionOpen) : true

  const overlayShellStyle: CSSProperties | undefined = motion
    ? {
        transformOrigin: 'bottom right',
        willChange: 'transform, opacity, border-radius',
        transform: open
          ? 'scale(1) translate3d(0, 0, 0)'
          : 'scale(0.13) translate3d(10px, 12px, 0)',
        opacity: open ? 1 : 0,
        borderRadius: open ? '1rem' : '9999px',
        transition: open
          ? `transform ${OVERLAY_SHELL_MS}ms ${OVERLAY_EASE} 0ms, opacity ${OVERLAY_SHELL_MS}ms ${OVERLAY_EASE} 0ms, border-radius ${OVERLAY_SHELL_MS}ms ${OVERLAY_EASE} 0ms`
          : `transform ${OVERLAY_SHELL_MS}ms ${OVERLAY_EASE} ${OVERLAY_SHELL_CLOSE_DELAY_MS}ms, opacity ${OVERLAY_SHELL_MS}ms ${OVERLAY_EASE} ${OVERLAY_SHELL_CLOSE_DELAY_MS}ms, border-radius ${OVERLAY_SHELL_MS}ms ${OVERLAY_EASE} ${OVERLAY_SHELL_CLOSE_DELAY_MS}ms`,
      }
    : undefined

  const overlayInnerStyle: CSSProperties | undefined = motion
    ? {
        willChange: 'transform, opacity',
        transform: open ? 'translate3d(0, 0, 0)' : 'translate3d(0, 12px, 0)',
        opacity: open ? 1 : 0,
        transition: open
          ? `opacity ${OVERLAY_INNER_OPEN_MS}ms ${OVERLAY_EASE} ${OVERLAY_INNER_OPEN_DELAY_MS}ms, transform ${OVERLAY_INNER_OPEN_MS}ms ${OVERLAY_EASE} ${OVERLAY_INNER_OPEN_DELAY_MS}ms`
          : `opacity ${OVERLAY_INNER_CLOSE_MS}ms ${OVERLAY_EASE} 0ms, transform ${OVERLAY_INNER_CLOSE_MS}ms ${OVERLAY_EASE} 0ms`,
      }
    : undefined

  const send = useCallback(async () => {
    const text = draft.trim()
    if (!text || isSending) return

    const token = getToken()
    if (!token) {
      setMessages((prev) => [
        ...prev,
        { id: newId(), role: 'user', body: text },
        {
          id: newId(),
          role: 'assistant',
          body: 'Sua sessão expirou ou você não está logado. Entre de novo para usar o assistente.',
        },
      ])
      setDraft('')
      return
    }

    const userLine: ChatLine = { id: newId(), role: 'user', body: text }
    const history = [...messages, userLine]
    setMessages(history)
    setDraft('')
    setIsSending(true)

    try {
      const res = await fetch('/api/ai/expense-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.body })),
        }),
      })

      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        reply?: string
        created?: boolean
      }

      if (!res.ok) {
        const errMsg =
          data.error === 'OPENAI_API_KEY nao configurada'
            ? 'A chave da OpenAI não está configurada no servidor (OPENAI_API_KEY).'
            : data.error ?? 'Não foi possível obter resposta agora. Tente de novo em instantes.'
        setMessages((prev) => [
          ...prev,
          { id: newId(), role: 'assistant', body: errMsg, meta: res.status === 401 ? 'Sessão' : 'Erro' },
        ])
        return
      }

      const reply = typeof data.reply === 'string' ? data.reply : 'Sem resposta da IA.'
      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: 'assistant',
          body: reply,
          meta: data.created ? 'Registrado no dashboard' : undefined,
        },
      ])

      if (data.created) {
        await onTransactionCreated?.()
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: 'assistant',
          body: 'Falha de rede ao contatar o servidor. Verifique sua conexão e tente novamente.',
          meta: 'Erro',
        },
      ])
    } finally {
      setIsSending(false)
    }
  }, [draft, isSending, messages, onTransactionCreated])

  const header = (
    <div
      className={cn(
        'flex shrink-0 items-center gap-3 border-white/10 px-3 py-3 backdrop-blur-xl',
        isOverlay ? 'rounded-t-2xl border-b bg-black/50' : 'border-b bg-black/35 md:px-4'
      )}
    >
      {showBackLink && !isOverlay && (
        <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-foreground" asChild>
          <Link href="/dashboard" aria-label="Voltar ao dashboard">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
      )}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-500/25 to-fuchsia-500/20 shadow-inner sm:size-10">
          <Bot className="size-4 text-violet-300 sm:size-5" />
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-foreground">Assistente de gastos</h2>
          <p className="truncate text-[11px] text-muted-foreground sm:text-xs">
            {isOverlay ? 'OpenAI + suas transações' : 'OpenAI — registra gastos e receitas no dashboard'}
          </p>
        </div>
      </div>
      {isOverlay && onClose && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 text-muted-foreground hover:text-foreground"
          onClick={onClose}
          aria-label="Fechar assistente"
        >
          <X className="size-5" />
        </Button>
      )}
      {!isOverlay && (
        <span className="hidden shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:inline-flex">
          <Sparkles className="size-3 text-fuchsia-400" />
          IA ativa
        </span>
      )}
    </div>
  )

  const notice = !isOverlay && (
    <div className="mb-3 shrink-0 rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 backdrop-blur-xl">
      <p className="text-xs leading-relaxed text-muted-foreground">
        O assistente usa a API da OpenAI e pode registrar despesas e receitas na sua conta. Seja explícito com valores e datas
        quando quiser que algo entre no extrato.
      </p>
    </div>
  )

  const scrollClass = isOverlay
    ? 'h-[min(280px,38vh)] shrink-0 rounded-xl border border-white/10 bg-black/30 shadow-inner backdrop-blur-xl'
    : 'h-[min(52vh,420px)] shrink-0 rounded-xl border border-white/10 bg-black/20 shadow-inner backdrop-blur-xl sm:h-[min(56vh,480px)]'

  const body = (
    <>
      {notice}
      <ScrollArea className={scrollClass}>
        <div className="space-y-3 p-3 sm:space-y-4 sm:p-4">
          {messages.map((m) => (
            <div key={m.id} className={cn('flex gap-2', m.role === 'user' ? 'flex-row-reverse' : 'flex-row sm:gap-2.5')}>
              <div
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-lg border sm:size-8',
                  m.role === 'user'
                    ? 'border-cyan-500/25 bg-cyan-500/15'
                    : 'border-violet-500/25 bg-violet-500/15'
                )}
                aria-hidden
              >
                {m.role === 'user' ? (
                  <User className="size-3.5 text-cyan-300 sm:size-4" />
                ) : (
                  <Bot className="size-3.5 text-violet-300 sm:size-4" />
                )}
              </div>
              <div className={cn('max-w-[88%] space-y-0.5 sm:max-w-[85%]', m.role === 'user' ? 'items-end text-right' : 'items-start')}>
                <div
                  className={cn(
                    'inline-block rounded-2xl px-3 py-2 text-[13px] leading-relaxed shadow-sm sm:px-3.5 sm:py-2.5 sm:text-sm',
                    m.role === 'user'
                      ? 'rounded-tr-md bg-gradient-to-br from-cyan-600/35 to-cyan-900/25 text-foreground ring-1 ring-cyan-500/20'
                      : 'rounded-tl-md bg-white/5 text-foreground ring-1 ring-white/10'
                  )}
                >
                  {m.body}
                </div>
                {m.meta && (
                  <p className="px-1 text-[9px] font-medium uppercase tracking-wide text-muted-foreground/90 sm:text-[10px]">{m.meta}</p>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className={cn('mt-2 space-y-1.5 sm:mt-3 sm:space-y-2', isOverlay && 'shrink-0')}>
        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-[11px]">Sugestões</p>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setDraft(s)}
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-foreground transition-colors hover:border-violet-500/30 hover:bg-violet-500/10 sm:px-3 sm:py-1.5 sm:text-xs"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2 rounded-xl border border-white/10 bg-black/30 p-2.5 shadow-lg backdrop-blur-xl sm:mt-3 sm:p-3">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              void send()
            }
          }}
          placeholder="Ex.: 45 almoço com cliente"
          rows={isOverlay ? 2 : 2}
          disabled={isSending}
          className="min-h-[3.5rem] resize-none border-white/10 bg-black/20 text-sm sm:min-h-[4.5rem]"
        />
        <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 sm:mt-2">
          <span className="text-[10px] text-muted-foreground sm:text-[11px]">
            {isSending ? 'Aguardando a IA…' : 'Enter envia · Shift+Enter nova linha'}
          </span>
          <Button type="button" size="sm" className="gap-1.5 rounded-lg" onClick={() => void send()} disabled={isSending}>
            {isSending ? <Loader2 className="size-4 animate-spin" /> : <SendHorizonal className="size-4" />}
            Enviar
          </Button>
        </div>
      </div>
    </>
  )

  if (isOverlay) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Assistente de gastos"
        data-open={motion ? (open ? 'true' : 'false') : 'true'}
        style={overlayShellStyle}
        onTransitionEnd={motion ? onOverlayShellTransitionEnd : undefined}
        className={cn(
          'flex max-h-[min(85vh,620px)] w-[min(100vw-1.5rem,400px)] flex-col overflow-hidden border border-white/15 bg-black/55 shadow-2xl shadow-black/50 ring-1 ring-white/10 backdrop-blur-2xl',
          motion ? 'rounded-none' : 'rounded-2xl'
        )}
      >
        <div
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          style={overlayInnerStyle}
        >
          {header}
          <div className="flex min-h-0 flex-1 flex-col gap-2 p-3">{body}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col px-3 pb-4 pt-2 md:px-4">
      {header}
      <main className="flex min-h-0 flex-1 flex-col">{body}</main>
    </div>
  )
}
