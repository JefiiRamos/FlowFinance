import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: ReactNode
  className?: string
}

export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div
      className={cn(
        `
          relative
          overflow-hidden
          rounded-[28px]
          border
          border-white/[0.14]
          bg-white/[0.06]
          shadow-[0_24px_80px_rgba(0,0,0,0.35)]
          backdrop-blur-2xl
        `,
        className,
      )}
    >
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-gradient-to-br
          from-white/[0.12]
          via-transparent
          to-transparent
        "
      />
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          rounded-[28px]
          ring-1
          ring-inset
          ring-white/[0.06]
        "
      />
      <div className="relative">{children}</div>
    </div>
  )
}
