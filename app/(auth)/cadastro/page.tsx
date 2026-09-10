'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AuthField, authInputClassName } from '@/components/auth/auth-field'
import { toast } from 'sonner'

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
      toast.success('Cadastro realizado!', {
        description: `Bem-vindo(a), ${data.user?.name ?? 'usuário'}!`,
      })
    } catch {
      setError('Erro ao cadastrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <AuthField id="register-name" label="Nome (opcional)">
        <Input
          id="register-name"
          type="text"
          placeholder="Seu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={authInputClassName}
          autoComplete="name"
        />
      </AuthField>

      <AuthField id="register-email" label="Email">
        <Input
          id="register-email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={authInputClassName}
          autoComplete="email"
        />
      </AuthField>

      <AuthField id="register-password" label="Senha">
        <Input
          id="register-password"
          type="password"
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={authInputClassName}
          autoComplete="new-password"
          minLength={6}
        />
      </AuthField>

      {error && (
        <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">
          {error}
        </p>
      )}

      <Button
        type="submit"
        className="mt-2 h-12 w-full rounded-2xl text-base shadow-[0_20px_40px_rgba(99,102,241,0.25)]"
        size="lg"
        disabled={loading}
      >
        {loading ? 'Cadastrando...' : 'Criar conta gratuita'}
      </Button>
    </form>
  )
}
