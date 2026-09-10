'use client'

import { motion } from 'framer-motion'

import { ShowcaseBento } from './ShowcaseBento'
import { ShowcaseContent } from './ShowcaseContent'

export function Showcase() {
  return (
    <section
      id="showcase"
      className="relative overflow-hidden py-32 md:py-40"
    >
      <div className="absolute left-1/2 top-1/2 -z-20 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-[180px]" />

      <div className="absolute inset-0 -z-30 bg-gradient-to-b from-transparent via-background/30 to-transparent" />

      <div className="mx-auto flex max-w-7xl flex-col gap-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          <ShowcaseContent />
        </motion.div>

        <ShowcaseBento />
      </div>
    </section>
  )
}
