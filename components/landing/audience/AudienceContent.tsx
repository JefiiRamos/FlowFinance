'use client'

import { motion } from 'framer-motion'

export function AudienceContent() {
  return (
    <div className="mx-auto max-w-4xl text-center">
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/80"
      >
        Para quem é
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="mt-6 text-4xl font-black tracking-tight text-white md:text-6xl xl:text-7xl"
      >
        Feito para quem
        <span className="mt-2 block text-white/55">
          não sabe quanto vem amanhã.
        </span>
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-muted-foreground md:text-xl"
      >
        Se sua renda oscila de um mês para o outro, você não precisa
        de mais uma planilha — precisa de um sistema que entenda
        essa realidade.
      </motion.p>
    </div>
  )
}
