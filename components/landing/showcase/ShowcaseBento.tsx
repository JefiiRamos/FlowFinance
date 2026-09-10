'use client'

import { motion } from 'framer-motion'
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react'

import { landingSummary } from '@/lib/landing-demo'

import { IncomeChartCompact } from '@/components/income-chart-compact'

const METRICS = [
  {
    label: 'Gasto seguro do mês',
    value: 'R$ 2.734',
    change: 'Atualizado agora',
    icon: Wallet,
    positive: true,
  },
  {
    label: 'Saldo projetado',
    value: 'R$ 4.180',
    change: '+18% vs. mês passado',
    icon: TrendingUp,
    positive: true,
  },
  {
    label: 'Reserva de emergência',
    value: '83%',
    change: 'Meta quase concluída',
    icon: TrendingUp,
    positive: true,
  },
  {
    label: 'Despesas fixas',
    value: 'R$ 1.280',
    change: '3 recorrentes ativas',
    icon: TrendingDown,
    positive: false,
  },
]

export function ShowcaseBento() {
  return (
    <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-12">
      {/* Métricas principais */}

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="
          grid
          gap-4
          sm:grid-cols-2
          lg:col-span-5
          lg:grid-cols-1
        "
      >
        {METRICS.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.08 }}
            className="
              rounded-[24px]
              border
              border-white/10
              bg-[#0F131C]/90
              p-5
              backdrop-blur-xl
            "
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {metric.label}
                </p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {metric.value}
                </p>
                <p
                  className={`mt-1 text-xs ${
                    metric.positive
                      ? 'text-emerald-400'
                      : 'text-muted-foreground'
                  }`}
                >
                  {metric.change}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                <metric.icon className="h-5 w-5 text-primary" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Gráfico de projeção */}

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.15 }}
        className="
          lg:col-span-7
          rounded-[34px]
          border
          border-white/10
          bg-[#0F131C]/90
          p-6
          shadow-[0_60px_120px_rgba(0,0,0,.45)]
          backdrop-blur-xl
        "
      >
        <IncomeChartCompact summary={landingSummary} />
      </motion.div>

      {/* Destaque de simulação */}

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.25 }}
        className="
          lg:col-span-12
          rounded-[34px]
          border
          border-violet-500/20
          bg-gradient-to-r
          from-violet-500/10
          via-transparent
          to-emerald-500/10
          p-8
          backdrop-blur-xl
          md:p-10
        "
      >
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-300/80">
              Simulador de cenários
            </p>
            <h3 className="mt-4 text-2xl font-bold text-white md:text-3xl">
              "E se minha renda cair 30% no próximo mês?"
            </h3>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              Teste qualquer cenário antes de tomar uma decisão.
              Veja o impacto no saldo, na reserva e no gasto seguro —
              tudo em segundos.
            </p>
          </div>

          <div className="grid min-w-[280px] gap-3 sm:grid-cols-3 md:grid-cols-1 lg:min-w-[220px]">
            <ScenarioPill label="Renda -30%" value="R$ 1.914" negative />
            <ScenarioPill label="Gasto seguro" value="R$ 1.520" />
            <ScenarioPill label="Saldo em 6 meses" value="R$ 8.400" highlight />
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function ScenarioPill({
  label,
  value,
  negative,
  highlight,
}: {
  label: string
  value: string
  negative?: boolean
  highlight?: boolean
}) {
  return (
    <div
      className={`
        rounded-2xl
        border
        px-5
        py-4
        ${
          highlight
            ? 'border-emerald-500/25 bg-emerald-500/10'
            : 'border-white/10 bg-white/[0.03]'
        }
      `}
    >
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={`mt-1 text-lg font-bold ${
          negative ? 'text-red-400' : highlight ? 'text-emerald-400' : 'text-white'
        }`}
      >
        {value}
      </p>
    </div>
  )
}
