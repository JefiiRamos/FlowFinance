'use client'

import { motion } from 'framer-motion'

import { HeroBackground } from './HeroBackground'
import { HeroGlow } from './HeroGlow'
import { HeroContent } from './HeroContent'
import { HeroDashboard } from './HeroDashboard'

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-24 pb-10">

      <HeroBackground />

      <HeroGlow />

      <div className="relative mx-auto max-w-7xl">

        <HeroContent />

        <motion.div
          initial={{
            opacity: 0,
            y: 80,
            scale: 0.96,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            duration: 1,
            delay: 0.3,
            ease: 'easeOut',
          }}
          className="mt-24"
        >
          <HeroDashboard />
        </motion.div>

      </div>

    </section>
  )
}