'use client'

import { motion } from 'framer-motion'
import { ShieldCheck, Sparkles, TrendingUp } from 'lucide-react'

import { GlassCard } from './glass-card'

const MINI_CHART = [38, 52, 44, 68, 55, 72, 61]

export function AuthShowcase() {
  return (
    <div className="relative hidden h-full min-h-[640px] lg:block">
      <div className="absolute left-1/2 top-1/2 -z-10 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/15 blur-[120px]" />

      <div className="relative mx-auto flex h-full max-w-md flex-col justify-center gap-5 py-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <GlassCard className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/30 to-primary/20">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-white/45">
                  Seu painel
                </p>
                <p className="mt-1 text-lg font-semibold text-white">
                  FlowFinance
                </p>
                <p className="text-sm text-white/55">
                  Gestão para renda variável
                </p>
              </div>
              <div className="ml-auto flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Ativo
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="ml-8"
        >
          <GlassCard className="p-7">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-sm text-white/50">Gasto seguro</p>
                <p className="mt-2 text-4xl font-black tracking-tight text-white">
                  R$ 2.734
                </p>
                <p className="mt-2 text-sm text-emerald-300/90">
                  Atualizado em tempo real
                </p>
              </div>

              <div className="relative flex h-20 w-20 items-center justify-center">
                <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="6"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    fill="none"
                    stroke="url(#authArc)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray="160 201"
                  />
                  <defs>
                    <linearGradient id="authArc" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#a78bfa" />
                      <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="absolute text-sm font-bold text-white">79%</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="-ml-4 mr-10"
        >
          <GlassCard className="p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-white/50">Projeção de renda</p>
                <p className="mt-1 text-2xl font-bold text-white">12 meses</p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs text-violet-200">
                <Sparkles className="h-3.5 w-3.5" />
                IA integrada
              </div>
            </div>

            <div className="flex h-24 items-end gap-2">
              {MINI_CHART.map((value, index) => (
                <div
                  key={index}
                  className="flex-1 rounded-full bg-gradient-to-t from-violet-500/20 to-violet-400/70"
                  style={{ height: `${value}%` }}
                />
              ))}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="ml-12"
        >
          <GlassCard className="inline-flex items-center gap-3 px-5 py-4">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <p className="text-sm text-white/70">
              Saiba quanto gastar — mesmo com renda variável
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}
