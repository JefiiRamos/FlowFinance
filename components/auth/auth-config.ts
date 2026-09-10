export type AuthMode = 'login' | 'register'

export const AUTH_META: Record<
  AuthMode,
  {
    title: string
    subtitle: string
    alternateLabel: string
    alternateHref: string
  }
> = {
  login: {
    title: 'Entrar',
    subtitle:
      'Acesse seu painel financeiro e retome o controle da sua renda variável.',
    alternateLabel: 'Cadastre-se',
    alternateHref: '/cadastro',
  },
  register: {
    title: 'Criar conta',
    subtitle:
      'Configure seu perfil em poucos segundos e comece a planejar com clareza.',
    alternateLabel: 'Entrar',
    alternateHref: '/login',
  },
}

export function getAuthMode(pathname: string): AuthMode {
  return pathname.startsWith('/cadastro') ? 'register' : 'login'
}
