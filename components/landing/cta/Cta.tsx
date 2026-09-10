'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

const CHECKLIST = [
  'Cadastro gratuito em menos de 2 minutos',
  'Projeções automáticas a partir do seu histórico',
  'Assistente com IA para registrar transações',
  'Simulador e metas incluídos desde o início',
]

export function Cta() {
  return (
    <section
      id="cta"
      className="relative overflow-hidden py-32 md:py-40"
    >
      <div className="absolute left-1/2 top-1/2 -z-20 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/15 blur-[200px]" />

      <div className="absolute inset-0 -z-30 bg-gradient-to-b from-transparent via-violet-500/5 to-transparent" />

      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="
            relative
            overflow-hidden
            rounded-[40px]
            border
            border-white/10
            bg-[#0F131C]/80
            px-8
            py-16
            shadow-[0_60px_120px_rgba(0,0,0,.5)]
            backdrop-blur-xl
            md:px-16
            md:py-20
          "
        >
          {/* Reflexo */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-br
              from-violet-500/10
              via-transparent
              to-emerald-500/5
            "
          />

          <div className="relative mx-auto max-w-3xl text-center">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/80"
            >
              Comece agora
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="mt-6 text-4xl font-black tracking-tight text-white md:text-6xl"
            >
              Pare de adivinhar.
              <span className="mt-2 block text-white/55">
                Comece a planejar.
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground"
            >
              Junte-se a quem já decidiu ter controle real sobre
              finanças variáveis — sem planilha, sem stress,
              sem surpresas no fim do mês.
            </motion.p>

            <motion.ul
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mx-auto mt-10 flex max-w-md flex-col gap-3 text-left"
            >
              {CHECKLIST.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-sm text-muted-foreground"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  {item}
                </li>
              ))}
            </motion.ul>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link href="/login">
                <Button
                  size="lg"
                  className="h-12 rounded-full px-8 text-base"
                >
                  Criar conta gratuita
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>

              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full border-white/10 bg-white/5 px-8 backdrop-blur-xl transition-all hover:bg-white/10"
                >
                  Já tenho conta
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
