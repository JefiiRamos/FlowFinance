const AUTH_KEY = 'flowfinance-token'
const USER_KEY = 'flowfinance-user'

export interface AuthUser {
  id?: string
  name: string
  email?: string
}

export function setAuth(token: string, user?: AuthUser) {
  if (typeof window === 'undefined') return

  localStorage.setItem(AUTH_KEY, token)

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }
}

export function clearAuth() {
  if (typeof window === 'undefined') return

  localStorage.removeItem(AUTH_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null

  return localStorage.getItem(AUTH_KEY)
}

export function getUser(): AuthUser | null {
  if (typeof window === 'undefined') return null

  const user = localStorage.getItem(USER_KEY)

  if (!user) return null

  try {
    return JSON.parse(user)
  } catch {
    return null
  }
}

export function isAuthenticated(): boolean {
  return !!getToken()
}