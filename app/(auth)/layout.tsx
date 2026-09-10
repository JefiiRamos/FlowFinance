import { Suspense, type ReactNode } from 'react'

import { AuthLayout } from '@/components/auth/auth-layout'

export default function AuthGroupLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <span className="text-white/45">Carregando...</span>
        </div>
      }
    >
      <AuthLayout>{children}</AuthLayout>
    </Suspense>
  )
}
