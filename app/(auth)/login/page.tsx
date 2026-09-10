'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AuthField, authInputClassName } from '@/components/auth/auth-field'
import { setAuth } from '@/lib/auth'
import { DEMO_ACCOUNT } from '@/lib/demo-account'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
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
      toast.error('Erro inesperado', {
        description: 'Não foi possível realizar o login. Tente novamente.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {process.env.NEXT_PUBLIC_SHOW_DEMO_LOGIN === 'true' && (
        <div className="mb-6 rounded-2xl border border-violet-500/20 bg-violet-500/10 px-4 py-3 text-center text-xs leading-6 text-white/70">
          Demo: {DEMO_ACCOUNT.email} / {DEMO_ACCOUNT.password}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthField id="login-email" label="Email">
          <Input
            id="login-email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={authInputClassName}
            autoComplete="email"
          />
        </AuthField>

        <AuthField id="login-password" label="Senha">
          <Input
            id="login-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={authInputClassName}
            autoComplete="current-password"
          />
        </AuthField>

        <Button
          type="submit"
          className="mt-2 h-12 w-full rounded-2xl text-base shadow-[0_20px_40px_rgba(99,102,241,0.25)] cursor-pointer"
          size="lg"
          disabled={loading}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
    </>
  )
}
