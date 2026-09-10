'use client'

import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

type Accent = 'violet' | 'emerald' | 'amber' | 'sky'

const accentStyles: Record<
  Accent,
  { card: string; icon: string }
> = {
  violet: {
    card: 'border-violet-500/15 bg-violet-500/[0.04] hover:border-violet-500/25',
    icon: 'bg-violet-500/10 text-violet-400',
  },
  emerald: {
    card: 'border-emerald-500/15 bg-emerald-500/[0.04] hover:border-emerald-500/25',
    icon: 'bg-emerald-500/10 text-emerald-400',
  },
  amber: {
    card: 'border-amber-500/15 bg-amber-500/[0.04] hover:border-amber-500/25',
    icon: 'bg-amber-500/10 text-amber-400',
  },
  sky: {
    card: 'border-sky-500/15 bg-sky-500/[0.04] hover:border-sky-500/25',
    icon: 'bg-sky-500/10 text-sky-400',
  },
}

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  delay?: number
  accent?: Accent
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  delay = 0,
  accent = 'violet',
}: FeatureCardProps) {
  const styles = accentStyles[accent]

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`
        group
        rounded-[28px]
        border
        p-8
        backdrop-blur-xl
        transition-colors
        duration-300
        ${styles.card}
      `}
    >
      <div
        className={`
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-2xl
          ${styles.icon}
        `}
      >
        <Icon className="h-6 w-6" />
      </div>

      <h3 className="mt-6 text-xl font-bold tracking-tight text-white">
        {title}
      </h3>

      <p className="mt-3 text-base leading-7 text-muted-foreground">
        {description}
      </p>
    </motion.div>
  )
}
