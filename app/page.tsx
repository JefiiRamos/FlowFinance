'use client'

import { Problem } from '@/components/landing/problem'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import {
  TrendingUp,

  // ===== V1 =====
  // BarChart3,
  // ShieldCheck,
  // Sparkles,
  // PiggyBank,
  // ArrowRight,
} from 'lucide-react'

import { Button } from '@/components/ui/button'

// ===== V1 =====
// import { Card } from '@/components/ui/card'

import { Hero } from '@/components/landing/hero/Hero'

const Silk = dynamic(() => import('@/components/silk'), {
  ssr: false,
})

// ============================================================================
// V1
// ============================================================================

// const FEATURES = [
//   {
//     icon: BarChart3,
//     title: 'Projeções inteligentes',
//     desc: 'Visualize sua renda mês a mês com gráficos automáticos.',
//   },
//   {
//     icon: ShieldCheck,
//     title: 'Gasto seguro',
//     desc: 'Saiba exatamente quanto pode gastar.',
//   },
//   {
//     icon: Sparkles,
//     title: 'Simulador de cenários',
//     desc: 'Teste diferentes margens.',
//   },
// ]

export default function LPPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">

      {/* Background */}

      <div className="fixed inset-0 -z-20">
        <Silk
          speed={5}
          scale={1}
          color="#7B7481"
          noiseIntensity={1.5}
          rotation={0}
        />
      </div>

      <div className="absolute inset-0 -z-10 bg-background/60" />

      <div className="relative z-10 flex min-h-screen flex-col">

        {/* ==================================================================== */}
        {/* HEADER */}
        {/* ==================================================================== */}

        <header className="border-b border-white/10 backdrop-blur-sm">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>

              <span className="text-lg font-semibold">
                FlowFinance
              </span>
            </div>

            <Link href="/login">
              <Button
                variant="outline"
                className="border-white/10"
              >
                Entrar
              </Button>
            </Link>

          </div>
        </header>

        {/* ==================================================================== */}
        {/* LANDING V2 */}
        {/* ==================================================================== */}

        <main className="flex-1">

          <Hero />

          <Problem />

          {/*
          =========================================================================

          LANDING V1

          =========================================================================

          <section>
            ...
            Toda a landing antiga permanece aqui temporariamente.
            Conforme as novas seções forem ficando prontas,
            elas substituem essas partes.

          </section>

          */}
        </main>

        {/* ==================================================================== */}
        {/* FOOTER */}
        {/* ==================================================================== */}

        <footer className="border-t border-white/10 py-8">
          <div className="mx-auto max-w-7xl px-6">
            <p className="text-center text-sm text-muted-foreground">
              FlowFinance — Gestão financeira inteligente para renda variável
            </p>
          </div>
        </footer>

      </div>
    </div>
  )
}