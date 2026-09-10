'use client'

import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

interface AudienceCardProps {
  icon: LucideIcon
  title: string
  description: string
  example: string
  delay?: number
}

export function AudienceCard({
  icon: Icon,
  title,
  description,
  example,
  delay = 0,
}: AudienceCardProps) {
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
      className="
        group
        rounded-[28px]
        border
        border-white/10
        bg-[#0F131C]/80
        p-8
        shadow-[0_40px_80px_rgba(0,0,0,.35)]
        backdrop-blur-xl
        transition-colors
        duration-300
        hover:border-white/20
      "
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-primary">
        <Icon className="h-6 w-6" />
      </div>

      <h3 className="mt-6 text-xl font-bold tracking-tight text-white">
        {title}
      </h3>

      <p className="mt-3 text-base leading-7 text-muted-foreground">
        {description}
      </p>

      <p className="mt-5 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm italic text-white/70">
        {example}
      </p>
    </motion.div>
  )
}
