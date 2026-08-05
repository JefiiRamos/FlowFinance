'use client'

import { motion } from 'framer-motion'
import { BrainCircuit, CheckCircle2 } from 'lucide-react'

export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

export function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/5 p-5">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  )
}

export interface AnalysisData {
  category?: string
  amount?: string
  date?: string
  confidence?: string
}

export function AnalyzingCard({ data }: { data?: AnalysisData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="w-full max-w-md rounded-3xl border border-violet-500/20 bg-violet-500/5 p-6 backdrop-blur-xl"
    >
      <div className="mb-5 flex items-center gap-3">
        <BrainCircuit className="h-6 w-6 animate-pulse text-violet-400" />
        <div>
          <h3 className="font-semibold text-sm">IA analisando...</h3>
          <p className="text-xs text-muted-foreground">Entendendo sua movimentação</p>
        </div>
      </div>

      <div className="space-y-2.5">
        <InfoRow label="Categoria" value={data?.category ?? '...'} />
        <InfoRow label="Valor" value={data?.amount ?? '...'} />
        <InfoRow label="Data" value={data?.date ?? '...'} />
        <InfoRow label="Confiança" value={data?.confidence ?? '...'} />
      </div>
    </motion.div>
  )
}

export interface PlanningData {
  safeSpend?: string
  reserve?: string
  category?: string
  status?: string
}

export function ResultCard({ data }: { data: PlanningData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="w-full max-w-md rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-6 backdrop-blur-xl"
    >
      <div className="mb-5 flex items-center gap-3">
        <CheckCircle2 className="h-6 w-6 text-emerald-400" />
        <div>
          <h3 className="font-semibold text-sm">Planejamento atualizado</h3>
          <p className="text-xs text-muted-foreground">Tudo recalculado automaticamente</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Metric title="Gasto seguro" value={data.safeSpend ?? '—'} />
        <Metric title="Reserva" value={data.reserve ?? '—'} />
        <Metric title="Categoria" value={data.category ?? '—'} />
        <Metric title="Status" value={data.status ?? 'Atualizado'} />
      </div>
    </motion.div>
  )
}