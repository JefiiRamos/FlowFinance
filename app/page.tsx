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
import { Card } from '@/components/ui/card'

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
            <section className="mb-32 text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                Planejamento financeiro para renda variável
              </div>

              <h1 className="mx-auto max-w-5xl text-5xl font-black tracking-tight md:text-7xl">
                Nunca mais fique sem saber
                <span className="block text-primary">
                  quanto pode gastar.
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                O FlowFinance analisa sua renda variável, projeta seus próximos
                meses e calcula um valor seguro para gastar sem comprometer sua
                reserva financeira.
              </p>

              <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                <Link href="/login">
                  <Button
                    size="lg"
                    className="h-12 px-8 text-base"
                  >
                    Começar agora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 border-white/15 bg-white/5 px-8"
                >
                  Ver demonstração
                </Button>
              </div>

              <div className="mt-14 flex flex-wrap justify-center gap-10">
                <div>
                  <p className="text-3xl font-bold">12+</p>
                  <p className="text-sm text-muted-foreground">
                    meses de projeção
                  </p>
                </div>

                <div>
                  <p className="text-3xl font-bold">100%</p>
                  <p className="text-sm text-muted-foreground">
                    personalizável
                  </p>
                </div>

                <div>
                  <p className="text-3xl font-bold">5 min</p>
                  <p className="text-sm text-muted-foreground">
                    para começar
                  </p>
                </div>
              </div>

              <div className="mt-16 grid gap-4 md:grid-cols-3">
                <Card className="border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                  <div className="mb-4 text-3xl">📉</div>

                  <h3 className="text-lg font-semibold">
                    Recebe diferente todo mês?
                  </h3>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Freelancers, autônomos e consultores raramente possuem renda
                    previsível.
                  </p>
                </Card>

                <Card className="border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                  <div className="mb-4 text-3xl">😰</div>

                  <h3 className="text-lg font-semibold">
                    Não sabe quanto pode gastar?
                  </h3>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Evite gastar demais nos meses bons e passar aperto nos meses
                    ruins.
                  </p>
                </Card>

                <Card className="border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                  <div className="mb-4 text-3xl">💰</div>

                  <h3 className="text-lg font-semibold">
                    Dificuldade para criar reserva?
                  </h3>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Descubra exatamente quanto guardar para construir sua segurança
                    financeira.
                  </p>
                </Card>
              </div>

              <Card className="mt-20 border-white/10 bg-white/5 p-8 backdrop-blur-xl">
                <div className="mb-6 text-left">
                  <h3 className="text-xl font-bold">
                    Exemplo de análise financeira
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    Visualização simplificada do painel
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <Card className="border-white/10 bg-background/40 p-4">
                    <p className="text-sm text-muted-foreground">
                      Gasto Seguro
                    </p>

                    <p className="mt-2 text-2xl font-bold text-success">
                      R$ 2.315
                    </p>
                  </Card>

                  <Card className="border-white/10 bg-background/40 p-4">
                    <p className="text-sm text-muted-foreground">
                      Reserva
                    </p>

                    <p className="mt-2 text-2xl font-bold">
                      83%
                    </p>
                  </Card>

                  <Card className="border-white/10 bg-background/40 p-4">
                    <p className="text-sm text-muted-foreground">
                      Próximo mês
                    </p>

                    <p className="mt-2 text-2xl font-bold">
                      R$ 4.280
                    </p>
                  </Card>

                  <Card className="border-white/10 bg-background/40 p-4">
                    <p className="text-sm text-muted-foreground">
                      Média
                    </p>

                    <p className="mt-2 text-2xl font-bold">
                      R$ 3.950
                    </p>
                  </Card>
                </div>

                {/* <div className="mt-6 h-48 rounded-xl border border-white/10 bg-gradient-to-b from-primary/10 to-transparent" /> */}
              </Card>
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
