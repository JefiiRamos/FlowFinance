'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export function SolutionContent() {
  return (
    <div className="mx-auto max-w-4xl text-center">

      {/* Badge */}

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="
          inline-flex
          items-center
          gap-2
          rounded-full
          border
          border-violet-500/20
          bg-violet-500/10
          px-4
          py-2
          backdrop-blur-xl
        "
      >
        <Sparkles className="h-4 w-4 text-violet-400" />

        <span className="text-sm text-violet-200">
          Inteligência artificial aplicada às suas finanças
        </span>
      </motion.div>

      {/* Título */}

      <motion.h2
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="
          mt-8
          text-4xl
          font-black
          tracking-tight
          md:text-6xl
        "
      >
        Você registra.
        <br />

        <span className="text-white/75">
          O FlowFinance faz o resto.
        </span>
      </motion.h2>

      {/* Descrição */}

      <motion.p
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="
          mx-auto
          mt-8
          max-w-3xl
          text-lg
          leading-8
          text-muted-foreground
          md:text-xl
        "
      >
        Basta registrar sua movimentação normalmente.
        Nossa inteligência artificial interpreta a informação,
        organiza automaticamente suas transações e recalcula
        seu planejamento financeiro em tempo real.
      </motion.p>

    </div>
  )
}