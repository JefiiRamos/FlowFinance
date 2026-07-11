'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface SolutionStepProps {
  children: ReactNode
  delay?: number
}

export function SolutionStep({
  children,
  delay = 0,
}: SolutionStepProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 40,
        scale: 0.96,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      viewport={{
        once: true,
        amount: 0.35,
      }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="flex w-full justify-center"
    >
      {children}
    </motion.div>
  )
}