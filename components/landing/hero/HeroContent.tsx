'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function HeroContent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.8,
        ease: 'easeOut',
      }}
      className="mx-auto max-w-5xl text-center"
    >
      {/* Badge */}

      <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-sm text-violet-200 backdrop-blur-xl">
        <Sparkles className="h-4 w-4" />
        Planejamento financeiro inteligente
      </div>

      {/* Headline */}

      <h1 className="mt-8 text-5xl font-black tracking-tight text-white md:text-7xl xl:text-8xl">
        Toda decisão financeira
        <span className="mt-2 block text-white/65">
          começa com uma pergunta.
        </span>
      </h1>

      {/* Supporting Copy */}

      <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-muted-foreground md:text-xl">
        O FlowFinance entende sua renda, acompanha seus gastos
        e calcula automaticamente um valor seguro para você viver
        com tranquilidade, mesmo quando sua renda muda todos os meses.
      </p>

      {/* CTA */}

      <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Link href="/login">
          <Button
            size="lg"
            className="h-12 rounded-full px-8 text-base"
          >
            Começar gratuitamente
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>

        <Button
          size="lg"
          variant="outline"
          className="h-12 rounded-full border-white/10 bg-white/5 px-8 backdrop-blur-xl transition-all hover:bg-white/10"
        >
          Ver demonstração
        </Button>
      </div>

      {/* Social Proof */}

      <div className="mt-14 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
        <div>
          <span className="font-semibold text-white">12 meses</span> de
          projeções
        </div>

        <div className="hidden h-4 w-px bg-white/10 sm:block" />

        <div>
          <span className="font-semibold text-white">IA integrada</span> para
          auxiliar suas decisões
        </div>

        <div className="hidden h-4 w-px bg-white/10 sm:block" />

        <div>
          <span className="font-semibold text-white">100% personalizado</span>{' '}
          para sua realidade financeira
        </div>
      </div>
    </motion.div>
  )
}