const AUTH_KEY = 'flowfinance-token'

export function setAuth(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_KEY, token)
  }
}

export function clearAuth() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_KEY)
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(AUTH_KEY)
}

export function isAuthenticated(): boolean {
  return !!getToken()
}
