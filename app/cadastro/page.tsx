'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { TrendingUp } from 'lucide-react'

const Silk = dynamic(() => import('@/components/silk'), { ssr: false })

export default function CadastroPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (!email.trim() || !password) {
        setError('Preencha email e senha')
        return
      }
      if (password.length < 6) {
        setError('Senha deve ter pelo menos 6 caracteres')
        return
      }
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          name: name.trim() || undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? 'Erro ao cadastrar')
        return
      }
      router.push('/login?cadastro=ok')
      router.refresh()
    } catch {
      setError('Erro ao cadastrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
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

          <h1 className="mb-2 text-center text-2xl font-bold text-foreground">Cadastre-se</h1>
          <p className="mb-6 text-center text-sm text-muted-foreground">
            Crie sua conta para acessar o painel
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome (opcional)</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-white/20 bg-white/5 focus:border-primary"
                autoComplete="name"
              />
            </div>
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
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-white/20 bg-white/5 focus:border-primary"
                autoComplete="new-password"
                minLength={6}
              />
            </div>
            {error && (
              <p className="text-center text-sm text-red-400">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Já tem conta?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Entrar
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
