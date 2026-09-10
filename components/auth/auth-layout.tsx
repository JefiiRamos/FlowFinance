'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { ArrowLeft, TrendingUp } from 'lucide-react'

import { AUTH_META, getAuthMode } from './auth-config'
import { AuthShowcase } from './auth-showcase'
import { GlassCard } from './glass-card'
import { cn } from '@/lib/utils'

const Silk = dynamic(() => import('@/components/silk'), { ssr: false })

const swapTransition = {
  type: 'spring' as const,
  stiffness: 220,
  damping: 30,
  mass: 0.9,
}

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const mode = getAuthMode(pathname)
  const isLogin = mode === 'login'
  const fromCadastro = searchParams.get('cadastro') === 'ok'

  const meta = AUTH_META[mode]
  const subtitle =
    isLogin && fromCadastro
      ? 'Cadastro feito! Entre com seu email e senha para acessar seu painel.'
      : meta.subtitle

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="fixed inset-0 -z-30">
        <Silk
          speed={4}
          scale={1.1}
          color="#7B7481"
          noiseIntensity={1.4}
          rotation={0}
        />
      </div>

      <div className="fixed inset-0 -z-20 bg-[radial-gradient(circle_at_20%_20%,rgba(139,92,246,0.12),transparent_40%)]" />
      <div className="fixed inset-0 -z-20 bg-[radial-gradient(circle_at_80%_80%,rgba(52,211,153,0.08),transparent_35%)]" />
      <div className="fixed inset-0 -z-20 bg-background/55 backdrop-blur-[2px]" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8 lg:px-10 lg:py-10">
        <header className="mb-8 flex items-center justify-between lg:mb-10">
          <Link
            href="/"
            className="group flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <span className="text-lg font-semibold text-white">FlowFinance</span>
          </Link>

          <Link
            href="/"
            className="
              hidden
              items-center
              gap-2
              rounded-full
              border
              border-white/10
              bg-white/[0.04]
              px-4
              py-2
              text-sm
              text-white/60
              backdrop-blur-xl
              transition-colors
              hover:bg-white/[0.08]
              hover:text-white
              sm:inline-flex
            "
          >
            <ArrowLeft className="h-4 w-4" />
            Início
          </Link>
        </header>

        <LayoutGroup id="auth-layout">
          <div className="grid flex-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <motion.div
              layout
              layoutId="auth-showcase-panel"
              transition={swapTransition}
              className={cn(
                'mx-auto w-full max-w-md lg:max-w-none',
                isLogin ? 'lg:order-1' : 'lg:order-2',
              )}
            >
              <AuthShowcase />
            </motion.div>

            <motion.div
              layout
              layoutId="auth-form-panel"
              transition={swapTransition}
              className={cn(
                'mx-auto w-full max-w-md',
                isLogin ? 'lg:order-2' : 'lg:order-1',
              )}
            >
              <GlassCard className="p-8 md:p-10">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={mode}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="mb-8 text-center lg:text-left">
                      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/80">
                        FlowFinance
                      </p>
                      <h1 className="mt-4 text-3xl font-black tracking-tight text-white md:text-4xl">
                        {meta.title}
                      </h1>
                      <p className="mt-3 text-sm leading-7 text-white/55 md:text-base">
                        {subtitle}
                      </p>
                    </div>

                    {children}

                    <div className="mt-8 border-t border-white/10 pt-6 text-center text-sm text-white/50">
                      {isLogin ? 'Não tem conta?' : 'Já tem conta?'}{' '}
                      <Link
                        href={meta.alternateHref}
                        className="font-medium text-white transition-colors hover:text-primary"
                      >
                        {meta.alternateLabel}
                      </Link>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </GlassCard>

              <p className="mt-6 text-center sm:hidden">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm text-white/45 transition-colors hover:text-white/75"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar à página inicial
                </Link>
              </p>
            </motion.div>
          </div>
        </LayoutGroup>
      </div>
    </div>
  )
}
