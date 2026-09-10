'use client'

import { motion } from 'framer-motion'

export function ShowcaseContent() {
  return (
    <div className="mx-auto max-w-4xl text-center">
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/80"
      >
        Dentro do app
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="mt-6 text-4xl font-black tracking-tight text-white md:text-6xl xl:text-7xl"
      >
        Clareza total
        <span className="mt-2 block text-white/55">
          em um só lugar.
        </span>
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-muted-foreground md:text-xl"
      >
        Dashboard completo com métricas em tempo real, gráficos de projeção
        e simulador integrado. Você abre o app e já sabe onde está —
        e para onde está indo.
      </motion.p>
    </div>
  )
}
