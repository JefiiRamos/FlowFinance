'use client'

import { useCallback, useEffect, useRef, useState, type CSSProperties, type TransitionEvent } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Bot, Loader2, SendHorizonal, Sparkles, User, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { getToken, getUser } from '@/lib/auth'
import {
  AnalyzingCard,
  ResultCard,
  type AnalysisData,
  type PlanningData,
} from '@/components/landing/assistant/TransactionCards'

type ChatRole = 'user' | 'assistant'

type ChatKind = 'text' | 'analyzing' | 'result'

export interface ChatLine {
  id: string
  role: ChatRole
  kind?: ChatKind
  body: string
  meta?: string
  analysis?: AnalysisData
  result?: PlanningData
}

const WELCOME_MESSAGES: ChatLine[] = [
  {
    id: 'welcome',
    role: 'assistant',
    body: 'Olá! Descreva em uma frase o que gastou ou recebeu. Entendo atalhos como “42 uber”, “mercado 180 ontem” ou “salário 4500”. Quando identificar valor e tipo, registro no seu dashboard.',
  },
]

const SUGGESTIONS = ['35 padaria', 'uber 18', '120 mercado hoje', '65 gasolina']

const EXAMPLE_PROMPTS = [
  'Quanto eu posso gastar essa semana?',
  'Registre R$ 45 de almoço com cliente hoje.',
  'Onde eu mais gastei neste mês?',
  'Crie uma meta para minha reserva de emergência.',
]

const OVERLAY_EASE = 'cubic-bezier(0.32, 0.72, 0, 1)' // curva estilo iOS sheet
const OVERLAY_SHELL_MS = 420
const OVERLAY_INNER_OPEN_MS = 320
const OVERLAY_INNER_CLOSE_MS = 260
const OVERLAY_INNER_OPEN_DELAY_MS = 90
const OVERLAY_SHELL_CLOSE_DELAY_MS = 60

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
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
  const [messages, setMessages] = useState<ChatLine[]>(isOverlay ? WELCOME_MESSAGES : [])
  const [draft, setDraft] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [typedGreetingLength, setTypedGreetingLength] = useState(0)
  const [typedExample, setTypedExample] = useState('')
  const [exampleIndex, setExampleIndex] = useState(0)
  const [isDeletingExample, setIsDeletingExample] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const user = getUser()
  const firstName = user?.name?.trim().split(/\s+/)[0] || 'Jefferson'
  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? 'Bom dia' : currentHour < 18 ? 'Boa tarde' : 'Boa noite'
  const greetingIntro = `${greeting}, `
  const greetingName = firstName
  const greetingOutro = ', me diga como eu posso te ajudar hoje?'
  const fullGreeting = `${greetingIntro}${greetingName}${greetingOutro}`
  const typedGreeting = fullGreeting.slice(0, typedGreetingLength)
  const typedIntro = typedGreeting.slice(0, Math.min(greetingIntro.length, typedGreeting.length))
  const typedName = typedGreeting.slice(greetingIntro.length, Math.min(greetingIntro.length + greetingName.length, typedGreeting.length))
  const typedOutro = typedGreeting.slice(greetingIntro.length + greetingName.length)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOverlay || messages.length > 0) return
    setTypedGreetingLength(0)
  }, [fullGreeting, isOverlay, messages.length])

  useEffect(() => {
    if (isOverlay || messages.length > 0 || typedGreetingLength >= fullGreeting.length) return

    const lastTypedCharacter = fullGreeting[typedGreetingLength - 1]
    const delay = typedGreetingLength === 0 ? 260 : lastTypedCharacter === ',' ? 220 : 58
    const timeoutId = window.setTimeout(() => {
      setTypedGreetingLength((current) => Math.min(current + 1, fullGreeting.length))
    }, delay)

    return () => window.clearTimeout(timeoutId)
  }, [fullGreeting, isOverlay, messages.length, typedGreetingLength])

  useEffect(() => {
    if (isOverlay || messages.length > 0) return

    const currentExample = EXAMPLE_PROMPTS[exampleIndex]
    const isComplete = typedExample === currentExample
    const isEmpty = typedExample.length === 0
    const delay = isComplete ? 1650 : isEmpty && isDeletingExample ? 420 : isDeletingExample ? 28 : 52

    const timeoutId = window.setTimeout(() => {
      if (!isDeletingExample) {
        if (isComplete) {
          setIsDeletingExample(true)
          return
        }

        setTypedExample(currentExample.slice(0, typedExample.length + 1))
        return
      }

      if (isEmpty) {
        setIsDeletingExample(false)
        setExampleIndex((current) => (current + 1) % EXAMPLE_PROMPTS.length)
        return
      }

      setTypedExample(currentExample.slice(0, typedExample.length - 1))
    }, delay)

    return () => window.clearTimeout(timeoutId)
  }, [exampleIndex, isDeletingExample, isOverlay, messages.length, typedExample])

  const isControlled = overlayMotionOpen !== undefined
  const open = isControlled ? Boolean(overlayMotionOpen) : true

  const overlayShellStyle: CSSProperties | undefined = isControlled
  ? {
      transformOrigin: 'bottom right',
      willChange: 'transform, opacity, border-radius, filter',
      transform: open
        ? 'scale(1) translate3d(0, 0, 0)'
        : 'scale(0.13) translate3d(10px, 12px, 0)',
      opacity: open ? 1 : 0,
      borderRadius: open ? '1.5rem' : '9999px',
      filter: open ? 'blur(0px)' : 'blur(14px)',
      backdropFilter: 'blur(28px) saturate(180%)',
      WebkitBackdropFilter: 'blur(28px) saturate(180%)',
      transition: open
        ? `transform ${OVERLAY_SHELL_MS}ms ${OVERLAY_EASE} 0ms, opacity ${OVERLAY_SHELL_MS}ms ${OVERLAY_EASE} 0ms, border-radius ${OVERLAY_SHELL_MS}ms ${OVERLAY_EASE} 0ms, filter ${OVERLAY_SHELL_MS}ms ${OVERLAY_EASE} 0ms`
        : `transform ${OVERLAY_SHELL_MS}ms ${OVERLAY_EASE} ${OVERLAY_SHELL_CLOSE_DELAY_MS}ms, opacity ${OVERLAY_SHELL_MS}ms ${OVERLAY_EASE} ${OVERLAY_SHELL_CLOSE_DELAY_MS}ms, border-radius ${OVERLAY_SHELL_MS}ms ${OVERLAY_EASE} ${OVERLAY_SHELL_CLOSE_DELAY_MS}ms, filter ${OVERLAY_SHELL_MS}ms ${OVERLAY_EASE} ${OVERLAY_SHELL_CLOSE_DELAY_MS}ms`,
    }
  : undefined

  const overlayInnerStyle: CSSProperties | undefined = isControlled
  ? {
      willChange: 'transform, opacity, filter',
      transform: open ? 'translate3d(0, 0, 0) scale(1)' : 'translate3d(0, 14px, 0) scale(0.98)',
      opacity: open ? 1 : 0,
      filter: open ? 'blur(0px)' : 'blur(6px)',
      transition: open
        ? `opacity ${OVERLAY_INNER_OPEN_MS}ms ${OVERLAY_EASE} ${OVERLAY_INNER_OPEN_DELAY_MS}ms, transform ${OVERLAY_INNER_OPEN_MS}ms ${OVERLAY_EASE} ${OVERLAY_INNER_OPEN_DELAY_MS}ms, filter ${OVERLAY_INNER_OPEN_MS}ms ${OVERLAY_EASE} ${OVERLAY_INNER_OPEN_DELAY_MS}ms`
        : `opacity ${OVERLAY_INNER_CLOSE_MS}ms ${OVERLAY_EASE} 0ms, transform ${OVERLAY_INNER_CLOSE_MS}ms ${OVERLAY_EASE} 0ms, filter ${OVERLAY_INNER_CLOSE_MS}ms ${OVERLAY_EASE} 0ms`,
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
  
      // mostra a mensagem do usuário imediatamente
      setMessages(history)
      setDraft('')
      setIsSending(true)
  
      // pequena pausa antes de "a IA começar a digitar" — parece mais natural
      await wait(550)
  
      const analyzingId = newId()
      const analyzingLine: ChatLine = { id: analyzingId, role: 'assistant', kind: 'analyzing', body: '' }
      setMessages((prev) => [...prev, analyzingLine])
  
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
        planning?: PlanningData
      }

      if (!res.ok) {
        const errMsg = data.error ?? 'Não foi possível obter resposta agora. Tente de novo em instantes.'
        setMessages((prev) =>
          prev.map((m) =>
            m.id === analyzingId
              ? { ...m, kind: 'text', body: errMsg, meta: res.status === 401 ? 'Sessão' : 'Erro' }
              : m
          )
        )
        return
      }

      const reply = typeof data.reply === 'string' ? data.reply : 'Sem resposta do assistente.'

      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== analyzingId) return m

          if (data.created && data.planning) {
            return { ...m, kind: 'result', body: reply, result: data.planning }
          }

          return {
            ...m,
            kind: 'text',
            body: reply,
            meta: data.created ? 'Registrado no dashboard' : undefined,
          }
        })
      )

      if (data.created) {
        await onTransactionCreated?.()
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === analyzingId
            ? {
                ...m,
                kind: 'text',
                body: 'Falha de rede ao contatar o servidor. Verifique sua conexão e tente novamente.',
                meta: 'Erro',
              }
            : m
        )
      )
    } finally {
      setIsSending(false)
    }
  }, [draft, isSending, messages, onTransactionCreated])

  const header = (
    <div
      className={cn(
        'relative flex shrink-0 items-center gap-3 overflow-hidden border-white/10 px-3 py-3 backdrop-blur-xl',
        isOverlay
          ? 'rounded-t-2xl border-b bg-white/[0.04]'
          : 'rounded-t-2xl border bg-card/80 shadow-[0_18px_70px_rgba(0,0,0,0.22)] before:pointer-events-none before:absolute before:inset-x-8 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-primary/45 before:to-transparent'
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
        <div className="relative flex size-9 shrink-0 items-center justify-center rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-500/25 to-fuchsia-500/20 shadow-inner sm:size-10">
          <span className="absolute inset-0 rounded-xl bg-primary/20 blur-md opacity-40" aria-hidden />
          <Bot className="size-4 text-violet-300 sm:size-5" />
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-foreground">Assistente de gastos</h2>
          <p className="truncate text-[11px] text-muted-foreground sm:text-xs">
            {isOverlay ? 'Bot automático + suas transações' : 'Registra gastos e receitas no dashboard'}
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
        <span className="hidden shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground shadow-inner sm:inline-flex">
          <Sparkles className="size-3 text-fuchsia-400" />
          Bot ativo
        </span>
      )}
    </div>
  )

  // const notice = !isOverlay && (
  //   <div className="mb-3 shrink-0 rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 shadow-inner backdrop-blur-xl">
  //     <p className="text-xs leading-relaxed text-muted-foreground">
  //       O assistente interpreta frases curtas e registra despesas e receitas na sua conta. Seja explícito com valores e datas
  //       quando quiser que algo entre no extrato.
  //     </p>
  //   </div>
  // )

  const scrollClass = isOverlay
    ? 'h-[calc(100vh-280px)] flex-1 rounded-xl border border-border bg-background'
    : 'min-h-[42vh] flex-1 rounded-xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(0,0,0,0.16))] shadow-inner backdrop-blur-xl'

  const body = (
    <>
      {/* {notice} */}
      <ScrollArea className={scrollClass}>
        {messages.length === 0 && !isOverlay ? (
          <div className="flex min-h-[42vh] items-center justify-center p-5 text-center sm:p-8">
            <motion.div
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative max-w-3xl"
            >
              <div
                className="pointer-events-none absolute inset-x-10 -top-10 h-24 rounded-full bg-primary/10 blur-3xl"
                aria-hidden
              />
              <p className="relative min-h-[7rem] text-balance text-3xl font-semibold leading-tight tracking-normal text-foreground sm:text-4xl lg:text-5xl">
                <span>{typedIntro}</span>
                {typedName && (
                  <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-white via-primary to-fuchsia-300">
                    {typedName}
                  </span>
                )}
                <span>{typedOutro}</span>
                <span
                  className="ml-1 inline-block h-[1em] w-px translate-y-1 bg-primary align-baseline shadow-[0_0_18px_rgba(110,124,255,0.85)] animate-pulse"
                  aria-hidden
                />
              </p>
              <div className="relative mx-auto mt-5 flex min-h-10 max-w-2xl items-center justify-center rounded-full  px-4 py-2.5 text-sm leading-relaxed text-muted-foreground shadow-inner backdrop-blur-xl sm:text-base">
                
                <span className="text-foreground/90">{typedExample}</span>
                <span
                  className="ml-1 inline-block h-[1em] w-px translate-y-0.5 bg-primary shadow-[0_0_16px_rgba(110,124,255,0.75)] animate-pulse"
                  aria-hidden
                />
              </div>
            </motion.div>
          </div>
        ) : (
        <div className="space-y-3 p-3 sm:space-y-4 sm:p-4">
          <AnimatePresence initial={false}>
            {messages.map((m) => {
              if (m.kind === 'analyzing') {
                return (
                  <div key={m.id} className="flex justify-start">
                    <AnalyzingCard />
                  </div>
                )
              }

              if (m.kind === 'result') {
                return (
                  <div key={m.id} className="flex justify-start">
                    <ResultCard data={m.result ?? {}} />
                  </div>
                )
              }

              return (
                <motion.div
                  key={m.id}
                  layout
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  whileHover={!isOverlay ? { y: -1 } : undefined}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className={cn('flex gap-2', m.role === 'user' ? 'flex-row-reverse' : 'flex-row sm:gap-2.5')}
                >
                  <div
                    className={cn(
                      'flex size-7 shrink-0 items-center justify-center rounded-lg border sm:size-8',
                      m.role === 'user'
                        ? 'border-cyan-500/25 bg-cyan-500/15 shadow-[0_0_24px_rgba(34,211,238,0.08)]'
                        : 'border-violet-500/25 bg-violet-500/15 shadow-[0_0_24px_rgba(139,92,246,0.1)]'
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
                          ? 'rounded-tr-md bg-primary text-primary-foreground text-foreground ring-1 ring-cyan-500/20 shadow-[0_12px_34px_rgba(110,124,255,0.18)]'
                          : 'rounded-tl-md bg-muted/90 text-foreground ring-1 ring-white/5'
                      )}
                    >
                      {m.body}
                    </div>
                    {m.meta && (
                      <p className="px-1 text-[9px] font-medium uppercase tracking-wide text-muted-foreground/90 sm:text-[10px]">{m.meta}</p>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>
        )}
      </ScrollArea>

      <div className={cn('mt-2 space-y-1.5 sm:mt-3 sm:space-y-2', isOverlay && 'shrink-0')}>
        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-[11px]">Sugestões</p>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setDraft(s)}
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-500/30 hover:bg-violet-500/10 hover:shadow-[0_10px_28px_rgba(110,124,255,0.12)] active:translate-y-0 sm:px-3 sm:py-1.5 sm:text-xs"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-border bg-card/95 p-3 shadow-[0_18px_60px_rgba(0,0,0,0.22)] transition-all duration-200 focus-within:border-primary/35 focus-within:shadow-[0_18px_70px_rgba(110,124,255,0.16)] sm:mt-3 sm:p-3">
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
          className="min-h-[3.5rem] resize-none rounded-xl border-white/10 bg-black/20 text-sm transition-colors focus-visible:ring-primary/25 sm:min-h-[4.5rem]"
        />
        <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 sm:mt-2">
          <span className="text-[10px] text-muted-foreground sm:text-[11px]">
            {isSending ? 'Processando…' : 'Enter envia · Shift+Enter nova linha'}
          </span>
          <Button type="button" size="sm" className="gap-1.5 rounded-xl shadow-[0_10px_28px_rgba(110,124,255,0.22)] transition-transform active:scale-[0.98]" onClick={() => void send()} disabled={isSending}>
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
        data-open={isControlled ? (open ? 'true' : 'false') : 'true'}
        style={overlayShellStyle}
        onTransitionEnd={isControlled ? onOverlayShellTransitionEnd : undefined}
        className={cn(
          'flex h-[85vh] w-[480px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg',
          isControlled ? 'rounded-none' : 'rounded-2xl'
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
    <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-1 flex-col px-3 py-4 sm:px-5 lg:px-8 lg:py-8">
      <div className="pointer-events-none absolute inset-x-10 top-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" aria-hidden />
      {header}
      <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-b-2xl border-x border-b border-white/10 bg-card/70 p-3 shadow-2xl shadow-black/25 backdrop-blur-xl before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_0%,rgba(110,124,255,0.12),transparent_32%)] before:opacity-80 sm:p-4">
        <div className="relative flex min-h-0 flex-1 flex-col">
        {body}
        </div>
      </main>
    </div>
  )
}
