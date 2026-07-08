'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { TrendingUp } from 'lucide-react'
import { setAuth } from '@/lib/auth'
import { toast } from 'sonner'

const Silk = dynamic(() => import('@/components/silk'), { ssr: false })

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromCadastro = searchParams.get('cadastro') === 'ok'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
  
    try {
      if (!email.trim() || !password) {
        toast.error('Preencha email e senha', {
          description: 'Informe seu email e sua senha.',
        })
        return
      }
  
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      })
  
      const data = await res.json().catch(() => ({}))
  
      if (!res.ok) {
        toast.error('Falha no login', {
          description: data.error ?? 'Email ou senha inválidos.',
        })
        return
      }
  
      setAuth(data.token, data.user)
  
      toast.success('Login realizado!', {
        description: `Bem-vindo(a), ${data.user.name}!`,
      })
      
      router.replace('/dashboard')
    } catch {
      toast.error('Erro inesperado', { description: 'Não foi possível realizar o login. Tente novamente.' })
    } finally { setLoading(false) }
  }
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background - Silk animation */}
      <div className="fixed inset-0 -z-10">
        <Silk
          speed={4}
          scale={1.2}
          color="#5227FF"
          noiseIntensity={1.2}
          rotation={0}
        />
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />

      <div className="w-full max-w-sm px-4">
        <div className="rounded-2xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-xl">
          <Link href="/" className="mb-8 flex items-center justify-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/20">
              <TrendingUp className="size-6 text-primary" />
            </div>
            <span className="text-xl font-semibold text-foreground">FlowFinance</span>
          </Link>

          <h1 className="mb-2 text-center text-2xl font-bold text-foreground">Entrar</h1>
          <p className="mb-6 text-center text-sm text-muted-foreground">
            {fromCadastro ? 'Cadastro feito! Entre com seu email e senha.' : 'Acesse seu painel financeiro'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-white/20 bg-white/5 focus:border-primary"
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-white/20 bg-white/5 focus:border-primary"
                autoComplete="current-password"
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Não tem conta?{' '}
            <Link href="/cadastro" className="text-primary hover:underline">
              Cadastre-se
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Voltar à página inicial
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-black">
        <span className="text-muted-foreground">Carregando...</span>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
