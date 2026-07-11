'use client'

import { motion } from 'framer-motion'
import { ArrowDown, BrainCircuit, CheckCircle2 } from 'lucide-react'

import { SolutionStep } from './SolutionStep'

export function SolutionFlow() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center">

      {/* STEP 1 */}

      <SolutionStep delay={0}>

        <div className="space-y-6">

          <div className="text-sm font-medium text-muted-foreground">
            Você registra normalmente
          </div>

          <div
            className="
              rounded-3xl
              border
              border-white/10
              bg-[#10141D]
              p-6
              shadow-xl
            "
          >

            <div className="mb-3 flex items-center gap-2">

              <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-400" />

            </div>

            <div
              className="
                rounded-2xl
                border
                border-white/5
                bg-black/30
                px-5
                py-4
                font-medium
                text-lg
              "
            >
              💬 "120 mercado hoje"
            </div>

          </div>

        </div>

      </SolutionStep>

      {/* ARROW */}

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: .25 }}
        viewport={{ once: true }}
        className="my-10"
      >
        <ArrowDown className="h-8 w-8 text-violet-400" />
      </motion.div>

      {/* STEP 2 */}

      <SolutionStep delay={.2}>

        <div
          className="
            w-full
            max-w-xl
            rounded-3xl
            border
            border-violet-500/20
            bg-violet-500/5
            p-8
            backdrop-blur-xl
          "
        >

          <div className="mb-5 flex items-center gap-3">

            <BrainCircuit className="h-7 w-7 text-violet-400" />

            <div>
              <h3 className="font-semibold">
                IA analisando...
              </h3>

              <p className="text-sm text-muted-foreground">
                Entendendo sua movimentação
              </p>
            </div>

          </div>

          <div className="space-y-3">

            <InfoRow
              label="Categoria"
              value="Alimentação"
            />

            <InfoRow
              label="Valor"
              value="R$ 120,00"
            />

            <InfoRow
              label="Data"
              value="Hoje"
            />

            <InfoRow
              label="Confiança"
              value="99%"
            />

          </div>

        </div>

      </SolutionStep>

      {/* ARROW */}

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: .45 }}
        viewport={{ once: true }}
        className="my-10"
      >
        <ArrowDown className="h-8 w-8 text-violet-400" />
      </motion.div>

      {/* STEP 3 */}

      <SolutionStep delay={.4}>

        <div
          className="
            w-full
            max-w-xl
            rounded-3xl
            border
            border-emerald-500/20
            bg-emerald-500/5
            p-8
            backdrop-blur-xl
          "
        >

          <div className="mb-6 flex items-center gap-3">

            <CheckCircle2 className="h-7 w-7 text-emerald-400" />

            <div>

              <h3 className="font-semibold">
                Planejamento atualizado
              </h3>

              <p className="text-sm text-muted-foreground">
                Tudo recalculado automaticamente
              </p>

            </div>

          </div>

          <div className="grid gap-4 md:grid-cols-2">

            <Metric
              title="Gasto seguro"
              value="R$ 2.734"
            />

            <Metric
              title="Reserva"
              value="+ R$ 120"
            />

            <Metric
              title="Categoria"
              value="Alimentação"
            />

            <Metric
              title="Status"
              value="Atualizado"
            />

          </div>

        </div>

      </SolutionStep>

    </div>
  )
}

function InfoRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3">
      <span className="text-muted-foreground">
        {label}
      </span>

      <span className="font-medium">
        {value}
      </span>
    </div>
  )
}

function Metric({
  title,
  value,
}: {
  title: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/5 p-5">
      <p className="text-sm text-muted-foreground">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold">
        {value}
      </p>
    </div>
  )
}