'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import {
  TrendingUp,
  BarChart3,
  ShieldCheck,
  Sparkles,
  PiggyBank,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const Silk = dynamic(() => import('@/components/silk'), { ssr: false })

const FEATURES = [
  {
    icon: BarChart3,
    title: 'Projeções inteligentes',
    desc: 'Visualize sua renda mês a mês com gráficos automáticos. A média futura considera a variabilidade dos seus ganhos.',
  },
  {
    icon: ShieldCheck,
    title: 'Gasto seguro',
    desc: 'Saiba exatamente quanto pode gastar por mês com margem de segurança. Evite surpresas e mantenha a reserva em dia.',
  },
  {
    icon: Sparkles,
    title: 'Simulador de cenários',
    desc: 'Teste diferentes margens de segurança, metas de reserva e veja o impacto na sua economia anual em tempo real.',
  },
]

export default function LPPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden overflow-y-auto">
      <div className="fixed inset-0 -z-10">
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
        <header className="border-b border-white/10 px-6 py-4 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/20">
                <TrendingUp className="size-5 text-primary" />
              </div>
              <span className="text-lg font-semibold text-foreground">
                FlowFinance
              </span>
            </div>
            <Link href="/login">
              <Button variant="outline" size="sm" className="border-white/20">
                Entrar
              </Button>
            </Link>
          </div>
        </header>

        <main className="flex-1 px-6 py-16 md:py-24">
          <div className="mx-auto max-w-6xl">
            <section className="mb-20 text-center">
              <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                Gestão financeira inteligente para renda variável
              </h1>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
                Projete sua renda, calcule o gasto seguro e planeje seus meses
                com clareza. Feito para freelancers, consultores e quem tem
                renda que varia.
              </p>
              <Link href="/login">
                <Button
                  size="lg"
                  className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Acessar painel
                  <ArrowRight className="size-5" />
                </Button>
              </Link>
            </section>

            <section className="mb-20">
              <h2 className="mb-10 text-center text-2xl font-bold text-foreground">
                Por que FlowFinance?
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {FEATURES.map(({ icon: Icon, title, desc }) => (
                  <div
                    key={title}
                    className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
                  >
                    <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/20">
                      <Icon className="size-6 text-primary" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">
                      {title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm md:p-12">
              <div className="flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
                <div className="flex items-center gap-4">
                  <div className="flex size-14 items-center justify-center rounded-xl bg-primary/20">
                    <PiggyBank className="size-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      Comece a planejar hoje
                    </h3>
                    <p className="text-muted-foreground">
                      Grátis. Sem cadastro complexo. Adicione suas rendas e veja
                      a projeção.
                    </p>
                  </div>
                </div>
                <Link href="/login">
                  <Button
                    size="lg"
                    className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Acessar painel
                    <ArrowRight className="size-5" />
                  </Button>
                </Link>
              </div>
            </section>
          </div>
        </main>

        <footer className="border-t border-white/10 px-6 py-6 backdrop-blur-sm">
          <p className="text-center text-sm text-muted-foreground">
            FlowFinance — Gestão financeira inteligente para renda variável
          </p>
        </footer>
      </div>
    </div>
  )
}
