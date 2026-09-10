'use client'

import {
  BarChart3,
  BrainCircuit,
  FlaskConical,
  Repeat,
  ShieldCheck,
  Target,
} from 'lucide-react'

import { FeatureCard } from './FeatureCard'

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Gasto seguro',
    description:
      'Saiba exatamente quanto pode gastar este mês sem comprometer os próximos. Calculado com base na sua média e reserva.',
    accent: 'emerald' as const,
  },
  {
    icon: BarChart3,
    title: 'Projeções de 12 meses',
    description:
      'Visualize sua renda e gastos recomendados mês a mês. Antecipe meses bons e se prepare para os mais apertados.',
    accent: 'violet' as const,
  },
  {
    icon: BrainCircuit,
    title: 'Assistente com IA',
    description:
      'Registre transações em linguagem natural. A IA categoriza, organiza e atualiza seu planejamento automaticamente.',
    accent: 'violet' as const,
  },
  {
    icon: FlaskConical,
    title: 'Simulador de cenários',
    description:
      'E se você ganhar menos no próximo mês? Teste mudanças e veja o impacto no seu saldo antes de decidir.',
    accent: 'sky' as const,
  },
  {
    icon: Target,
    title: 'Metas financeiras',
    description:
      'Defina objetivos — reserva de emergência, viagem, equipamento — e acompanhe o progresso mês a mês.',
    accent: 'amber' as const,
  },
  {
    icon: Repeat,
    title: 'Receitas e despesas fixas',
    description:
      'Cadastre aluguel, assinaturas e receitas recorrentes. O sistema já considera tudo no cálculo do mês.',
    accent: 'emerald' as const,
  },
]

export function FeaturesGrid() {
  return (
    <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2 lg:grid-cols-3">
      {FEATURES.map((feature, index) => (
        <FeatureCard
          key={feature.title}
          {...feature}
          delay={index * 0.08}
        />
      ))}
    </div>
  )
}
