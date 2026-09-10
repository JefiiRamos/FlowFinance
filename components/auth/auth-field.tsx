import type { ReactNode } from 'react'

import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface AuthFieldProps {
  id: string
  label: string
  children: ReactNode
  className?: string
}

export function AuthField({ id, label, children, className }: AuthFieldProps) {
  return (
    <div className={cn('space-y-2.5', className)}>
      <Label
        htmlFor={id}
        className="text-xs font-medium uppercase tracking-[0.18em] text-white/45"
      >
        {label}
      </Label>
      {children}
    </div>
  )
}

export const authInputClassName =
  'h-12 rounded-2xl border-white/10 bg-white/[0.04] px-4 text-white placeholder:text-white/25 focus-visible:border-white/20 focus-visible:bg-white/[0.06]'
