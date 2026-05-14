'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  BadgeDollarSign,
  CalendarDays,
  Check,
  Home,
  PiggyBank,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { getToken } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'

const Silk = dynamic(() => import('@/components/silk'), { ssr: false })

type FixedExpense = {
  id: string
  name: string
  amount: string
  dueDay: string
}

type ProfileOption = {
  value: 'essencial' | 'equilibrado' | 'crescimento'
  title: string
  description: string
  icon: typeof ShieldCheck
}

type GoalOption = {
  value: 'organizar' | 'economizar' | 'quitar-dividas' | 'investir'
  title: string
  description: string
  icon: typeof Target
}

const profileOptions: ProfileOption[] = [
  {
    value: 'essencial',
    title: 'Rotina essencial',
    description: 'Foco em previsibilidade, controle firme e caixa protegido.',
    icon: ShieldCheck,
  },
  {
    value: 'equilibrado',
    title: 'Equilibrio inteligente',
    description: 'Separar bem gastos, guardar todo mes e manter flexibilidade.',
    icon: Wallet,
  },
  {
    value: 'crescimento',
    title: 'Crescimento acelerado',
    description: 'Priorizar sobra mensal maior e visao de longo prazo.',
    icon: Rocket,
  },
]

const goalOptions: GoalOption[] = [
  {
    value: 'organizar',
    title: 'Organizar a vida financeira',
    description: 'Ter clareza total do que entra e do que sai.',
    icon: Sparkles,
  },
  {
    value: 'economizar',
    title: 'Guardar dinheiro',
    description: 'Montar reserva e criar disciplina com metas mensais.',
    icon: PiggyBank,
  },
  {
    value: 'quitar-dividas',
    title: 'Quitar dividas',
    description: 'Ganhar folego e reduzir peso das contas no mes.',
    icon: Home,
  },
  {
    value: 'investir',
    title: 'Investir melhor',
    description: 'Transformar sobra mensal em patrimonio com constancia.',
    icon: TrendingUp,
  },
]

const expenseSuggestions = [
  { name: 'Aluguel', dueDay: '5' },
  { name: 'Internet', dueDay: '10' },
  { name: 'Energia', dueDay: '12' },
  { name: 'Streaming', dueDay: '15' },
]

const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

function createExpense(): FixedExpense {
  return {
    id: crypto.randomUUID(),
    name: '',
    amount: '',
    dueDay: '10',
  }
}

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [salary, setSalary] = useState('')
  const [extraIncome, setExtraIncome] = useState('')
  const [payDay, setPayDay] = useState('5')
  const [financialProfile, setFinancialProfile] = useState<ProfileOption['value']>('equilibrado')
  const [primaryGoal, setPrimaryGoal] = useState<GoalOption['value']>('organizar')
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([createExpense()])

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.replace('/login')
      return
    }

    const controller = new AbortController()

    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        })

        if (res.status === 401) {
          router.replace('/login')
          return
        }

        const data = await res.json().catch(() => null)
        if (!res.ok || !data) {
          setError('Nao foi possivel carregar seu onboarding.')
          return
        }

        if (data.onboardingCompleted) {
          router.replace('/dashboard')
          return
        }

        setName(data.name ?? '')
      } catch (fetchError) {
        if ((fetchError as Error).name !== 'AbortError') {
          setError('Nao foi possivel carregar seu onboarding.')
        }
      } finally {
        setLoading(false)
      }
    }

    loadUser()
    return () => controller.abort()
  }, [router])

  const incomeValue = Number(salary) || 0
  const extraIncomeValue = Number(extraIncome) || 0
  const parsedExpenses = fixedExpenses
    .map((item) => ({
      ...item,
      numericAmount: Number(item.amount) || 0,
      numericDueDay: Number(item.dueDay) || 1,
    }))
    .filter((item) => item.name.trim() && item.numericAmount > 0)

  const totalFixedExpenses = useMemo(
    () => parsedExpenses.reduce((sum, item) => sum + item.numericAmount, 0),
    [parsedExpenses]
  )

  const projectedFreeAmount = incomeValue + extraIncomeValue - totalFixedExpenses
  const progress = ((step + 1) / 4) * 100

  function addExpense(prefill?: Partial<FixedExpense>) {
    setFixedExpenses((current) => [
      ...current,
      {
        ...createExpense(),
        ...prefill,
      },
    ])
  }

  function updateExpense(id: string, field: keyof FixedExpense, value: string) {
    setFixedExpenses((current) =>
      current.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
  }

  function removeExpense(id: string) {
    setFixedExpenses((current) => {
      if (current.length === 1) {
        return [{ ...current[0], name: '', amount: '', dueDay: '10' }]
      }
      return current.filter((item) => item.id !== id)
    })
  }

  function validateStep(currentStep: number) {
    if (currentStep === 0 && !name.trim()) {
      setError('Informe seu nome para personalizar sua experiencia.')
      return false
    }
    if (currentStep === 1) {
      if (!(Number(salary) > 0)) {
        setError('Informe seu salario mensal.')
        return false
      }
      if (!(Number(payDay) >= 1 && Number(payDay) <= 31)) {
        setError('Escolha um dia de recebimento entre 1 e 31.')
        return false
      }
    }
    if (currentStep === 2) {
      const invalidExpense = fixedExpenses.find((item) =>
        item.name.trim() || item.amount.trim() || item.dueDay.trim()
          ? !(item.name.trim() && Number(item.amount) > 0 && Number(item.dueDay) >= 1 && Number(item.dueDay) <= 31)
          : false
      )
      if (invalidExpense) {
        setError('Revise suas contas fixas antes de continuar.')
        return false
      }
    }
    setError('')
    return true
  }

  function handleNext() {
    if (!validateStep(step)) return
    setStep((current) => Math.min(3, current + 1))
  }

  async function handleSubmit() {
    if (!validateStep(3)) return
    const token = getToken()
    if (!token) {
      router.replace('/login')
      return
    }

    setSaving(true)
    setError('')

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          salary: Number(salary),
          payDay: Number(payDay),
          extraIncome: Number(extraIncome) || 0,
          financialProfile,
          primaryGoal,
          fixedExpenses: fixedExpenses
            .map((item) => ({
              name: item.name.trim(),
              amount: Number(item.amount),
              dueDay: Number(item.dueDay),
            }))
            .filter((item) => item.name && item.amount > 0),
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? 'Nao foi possivel concluir seu onboarding.')
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Nao foi possivel concluir seu onboarding.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070711] text-foreground">
      <div className="fixed inset-0 -z-20">
        <Silk speed={3.5} scale={1.1} color="#6D5BFF" noiseIntensity={1} rotation={0} />
      </div>
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(88,80,236,0.24),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.14),transparent_28%),linear-gradient(180deg,rgba(8,8,20,0.18),rgba(6,6,15,0.86))]" />

      <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[2rem] border border-white/10 bg-black/30 p-5 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-8">
            <div className="mb-8 flex flex-col gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <Link href="/" className="mb-4 inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-white">
                  <TrendingUp className="size-4" />
                  FlowFinance
                </Link>
                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Vamos montar seu painel com a sua cara
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
                  Em poucos passos eu configuro sua renda, suas contas fixas e o foco financeiro inicial para sua dashboard ja abrir fazendo sentido.
                </p>
              </div>

              <div className="min-w-52 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.24em] text-white/45">
                  <span>Progresso</span>
                  <span>0{step + 1}/04</span>
                </div>
                <Progress value={progress} className="h-2.5 bg-white/10" />
              </div>
            </div>

            <div key={step} className="animate-in fade-in slide-in-from-right-4 duration-500">
              {step === 0 && (
                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="space-y-5">
                    <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-100">
                      <Sparkles className="size-4" />
                      Passo 1 · identidade financeira
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-semibold text-white">Como voce quer aparecer no FlowFinance?</h2>
                      <p className="max-w-xl text-sm leading-6 text-white/65">
                        Eu uso essas informacoes para personalizar o onboarding, as mensagens da dashboard e o contexto inicial do seu controle mensal.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-white/80">Seu nome</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex.: Jessica"
                        className="h-12 border-white/15 bg-white/5 text-white placeholder:text-white/35 focus-visible:border-violet-400"
                        autoComplete="name"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 self-start">
                    {[
                      'Seu onboarding salva salario e despesas fixas automaticamente.',
                      'As entradas ja chegam prontas nas secoes de rendas e contas recorrentes.',
                      'A dashboard deixa de abrir vazia e passa a refletir sua realidade.',
                    ].map((item) => (
                      <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/75">
                        <div className="mb-2 flex items-center gap-2 text-white">
                          <Check className="size-4 text-emerald-300" />
                          Configuracao inteligente
                        </div>
                        <p className="leading-6">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-100">
                    <BadgeDollarSign className="size-4" />
                    Passo 2 · entradas mensais
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <Label htmlFor="salary" className="text-white/80">Salario principal</Label>
                      <Input
                        id="salary"
                        type="number"
                        min="0"
                        step="0.01"
                        value={salary}
                        onChange={(e) => setSalary(e.target.value)}
                        placeholder="4500"
                        className="mt-3 h-12 border-white/15 bg-black/20 text-lg text-white"
                      />
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <Label htmlFor="extraIncome" className="text-white/80">Media de renda extra</Label>
                      <Input
                        id="extraIncome"
                        type="number"
                        min="0"
                        step="0.01"
                        value={extraIncome}
                        onChange={(e) => setExtraIncome(e.target.value)}
                        placeholder="0"
                        className="mt-3 h-12 border-white/15 bg-black/20 text-lg text-white"
                      />
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <Label htmlFor="payDay" className="text-white/80">Dia de recebimento</Label>
                      <Input
                        id="payDay"
                        type="number"
                        min="1"
                        max="31"
                        value={payDay}
                        onChange={(e) => setPayDay(e.target.value)}
                        placeholder="5"
                        className="mt-3 h-12 border-white/15 bg-black/20 text-lg text-white"
                      />
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/8 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-emerald-100/70">Entrada principal</p>
                      <strong className="mt-2 block text-2xl text-white">{brl.format(incomeValue)}</strong>
                    </div>
                    <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/8 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/70">Renda complementar</p>
                      <strong className="mt-2 block text-2xl text-white">{brl.format(extraIncomeValue)}</strong>
                    </div>
                    <div className="rounded-2xl border border-violet-400/15 bg-violet-400/8 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-violet-100/70">Recebimento</p>
                      <strong className="mt-2 block text-2xl text-white">Dia {payDay || '--'}</strong>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-1 text-xs font-medium text-orange-100">
                        <CalendarDays className="size-4" />
                        Passo 3 · contas fixas
                      </div>
                      <h2 className="mt-3 text-2xl font-semibold text-white">Quais despesas ja chegam todo mes?</h2>
                    </div>
                    <Button type="button" variant="secondary" className="border border-white/10 bg-white/8 text-white hover:bg-white/12" onClick={() => addExpense()}>
                      Adicionar conta
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {expenseSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.name}
                        type="button"
                        onClick={() => addExpense({ name: suggestion.name, dueDay: suggestion.dueDay })}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/75 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                      >
                        + {suggestion.name}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    {fixedExpenses.map((item, index) => (
                      <div key={item.id} className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-[1.3fr_0.7fr_0.5fr_auto]">
                        <div>
                          <Label className="text-white/75">Conta {index + 1}</Label>
                          <Input
                            value={item.name}
                            onChange={(e) => updateExpense(item.id, 'name', e.target.value)}
                            placeholder="Ex.: Aluguel"
                            className="mt-2 h-11 border-white/15 bg-black/20 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-white/75">Valor</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.amount}
                            onChange={(e) => updateExpense(item.id, 'amount', e.target.value)}
                            placeholder="1200"
                            className="mt-2 h-11 border-white/15 bg-black/20 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-white/75">Vence</Label>
                          <Input
                            type="number"
                            min="1"
                            max="31"
                            value={item.dueDay}
                            onChange={(e) => updateExpense(item.id, 'dueDay', e.target.value)}
                            className="mt-2 h-11 border-white/15 bg-black/20 text-white"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-11 w-full text-white/60 hover:bg-white/10 hover:text-white md:w-auto"
                            onClick={() => removeExpense(item.id)}
                          >
                            Remover
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs font-medium text-violet-100">
                    <Target className="size-4" />
                    Passo 4 · foco inicial
                  </div>

                  <div>
                    <h2 className="text-2xl font-semibold text-white">Que tom o FlowFinance deve assumir com voce?</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
                      Escolha seu momento atual. Isso ajuda a aplicar uma camada mais humana e relevante nas recomendacoes do sistema.
                    </p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    {profileOptions.map((option) => {
                      const Icon = option.icon
                      const selected = financialProfile === option.value
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setFinancialProfile(option.value)}
                          className={cn(
                            'rounded-3xl border p-5 text-left transition duration-300 hover:-translate-y-0.5',
                            selected
                              ? 'border-violet-300/50 bg-violet-400/15 shadow-[0_20px_60px_rgba(109,91,255,0.18)]'
                              : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'
                          )}
                        >
                          <Icon className="mb-4 size-6 text-white" />
                          <strong className="block text-base text-white">{option.title}</strong>
                          <p className="mt-2 text-sm leading-6 text-white/65">{option.description}</p>
                        </button>
                      )
                    })}
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {goalOptions.map((option) => {
                      const Icon = option.icon
                      const selected = primaryGoal === option.value
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setPrimaryGoal(option.value)}
                          className={cn(
                            'rounded-3xl border p-5 text-left transition duration-300 hover:border-white/20 hover:bg-white/8',
                            selected ? 'border-cyan-300/50 bg-cyan-400/12' : 'border-white/10 bg-white/5'
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn('rounded-2xl p-3', selected ? 'bg-cyan-300/20' : 'bg-white/8')}>
                              <Icon className="size-5 text-white" />
                            </div>
                            <div>
                              <strong className="block text-base text-white">{option.title}</strong>
                              <p className="mt-1 text-sm leading-6 text-white/65">{option.description}</p>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {error && <p className="mt-6 text-sm text-red-300">{error}</p>}

            <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-white/45">
                {step === 2 ? 'Se quiser, voce pode deixar contas fixas em branco e adicionar depois.' : 'Tudo aqui pode ser ajustado novamente dentro da plataforma.'}
              </div>
              <div className="flex gap-3 self-end">
                <Button
                  type="button"
                  variant="ghost"
                  className="border border-white/10 bg-white/5 text-white hover:bg-white/10"
                  onClick={() => setStep((current) => Math.max(0, current - 1))}
                  disabled={step === 0 || saving}
                >
                  <ArrowLeft className="mr-2 size-4" />
                  Voltar
                </Button>
                {step < 3 ? (
                  <Button type="button" className="min-w-36" onClick={handleNext}>
                    Continuar
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                ) : (
                  <Button type="button" className="min-w-36" onClick={handleSubmit} disabled={saving}>
                    {saving ? 'Finalizando...' : 'Entrar na dashboard'}
                  </Button>
                )}
              </div>
            </div>
          </section>

          <aside className="rounded-[2rem] border border-white/10 bg-white/6 p-5 backdrop-blur-2xl sm:p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/45">Preview ao vivo</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Seu plano inicial</h2>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <Wallet className="size-5 text-cyan-200" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-emerald-400/15 bg-emerald-400/10 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-100/70">Entrada mensal prevista</p>
                <strong className="mt-2 block text-3xl text-white">
                  {brl.format(incomeValue + extraIncomeValue)}
                </strong>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-white/55">Contas fixas mapeadas</p>
                  <strong className="mt-1 block text-2xl text-white">{brl.format(totalFixedExpenses)}</strong>
                  <p className="mt-2 text-xs text-white/45">{parsedExpenses.length} item(ns) recorrentes</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-white/55">Sobra apos fixas</p>
                  <strong className={cn('mt-1 block text-2xl', projectedFreeAmount >= 0 ? 'text-white' : 'text-red-300')}>
                    {brl.format(projectedFreeAmount)}
                  </strong>
                  <p className="mt-2 text-xs text-white/45">Base inicial para metas e alertas</p>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <p className="text-sm text-white/55">Leitura do seu momento</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80">
                    {profileOptions.find((item) => item.value === financialProfile)?.title}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80">
                    {goalOptions.find((item) => item.value === primaryGoal)?.title}
                  </span>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/8 to-white/4 p-5">
                <p className="text-sm text-white/55">O que sera configurado agora</p>
                <ul className="mt-4 space-y-3 text-sm text-white/75">
                  <li className="flex items-center gap-3">
                    <Check className="size-4 text-emerald-300" />
                    1 renda recorrente principal
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="size-4 text-emerald-300" />
                    Contas fixas na area de despesas recorrentes
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="size-4 text-emerald-300" />
                    Perfil salvo para futuras personalizacoes
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
