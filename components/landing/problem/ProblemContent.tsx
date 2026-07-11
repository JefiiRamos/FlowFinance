'use client'

import { motion } from 'framer-motion'

export function ProblemContent() {
  return (
    <div className="mx-auto max-w-4xl text-center">

      {/* Label */}

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: .6 }}
        className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/80"
      >
        O problema
      </motion.p>

      {/* Headline */}

      <motion.h2
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{
          duration: .8,
          delay: .1,
        }}
        className="mt-6 text-4xl font-black tracking-tight text-white md:text-6xl xl:text-7xl"
      >
        Sua renda muda.
        <span className="mt-2 block text-white/55">
          Suas contas não.
        </span>
      </motion.h2>

      {/* Description */}

      <motion.p
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{
          duration: .8,
          delay: .2,
        }}
        className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-muted-foreground md:text-xl"
      >
        Todo mês você precisa tomar decisões importantes sem saber
        exatamente quanto pode gastar. Nos meses bons sobra dinheiro.
        Nos meses ruins surge a dúvida: <span className="text-white">será que estou gastando demais?</span>
      </motion.p>

      {/* Supporting Text */}

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{
          duration: .8,
          delay: .35,
        }}
        className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground/80"
      >
        Freelancers, autônomos, consultores e profissionais com renda variável
        convivem diariamente com essa incerteza. O problema não é ganhar pouco —
        é não saber quanto é seguro gastar hoje sem comprometer os próximos meses.
      </motion.p>

    </div>
  )
}