'use client'

import { motion } from 'framer-motion'

import { landingSummary } from '@/lib/landing-demo'

import { IncomeVsSpendingChart } from '@/components/income-vs-spending-chart'
import { IncomeChartCompact } from '@/components/income-chart-compact'

export function ProblemCharts() {
  return (
    <div className="mx-auto max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative"
      >
        {/* Gráfico principal */}

        <div
          className="
            rounded-[34px]
            border
            border-white/10
            bg-[#0F131C]/90
            p-6
            shadow-[0_60px_120px_rgba(0,0,0,.45)]
            backdrop-blur-xl
          "
        >
          <IncomeVsSpendingChart
            summary={landingSummary}
          />
        </div>

        {/* Card flutuante */}

        <motion.div
          initial={{
            opacity: 0,
            x: 30,
            y: 20,
            scale: 0.95,
          }}
          whileInView={{
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
          }}
          transition={{
            duration: 0.8,
            delay: 0.25,
          }}
          className="
            absolute
            -bottom-10
            right-10
            hidden
            w-[420px]
            rounded-[28px]
            border
            border-white/10
            bg-[#0F131C]/95
            p-5
            shadow-2xl
            backdrop-blur-xl
            lg:block
          "
        >
          <IncomeChartCompact
            summary={landingSummary}
          />
        </motion.div>
      </motion.div>

      <div className="h-28" />
    </div>
  )
}