'use client'

import { motion } from 'framer-motion'

import { AudienceContent } from './AudienceContent'
import { AudienceGrid } from './AudienceGrid'

export function Audience() {
  return (
    <section
      id="audience"
      className="relative overflow-hidden py-32 md:py-40"
    >
      <div className="absolute left-1/2 top-1/2 -z-20 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/8 blur-[160px]" />

      <div className="absolute inset-0 -z-30 bg-gradient-to-b from-transparent via-background/20 to-transparent" />

      <div className="mx-auto flex max-w-7xl flex-col gap-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          <AudienceContent />
        </motion.div>

        <AudienceGrid />
      </div>
    </section>
  )
}
