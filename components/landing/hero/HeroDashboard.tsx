'use client'

import Image from 'next/image'

export function HeroDashboard() {
  return (
    <div className="relative mx-auto max-w-[1500px]">

      {/* Glow atrás da dashboard */}
      <div className="absolute left-1/2 top-1/2 -z-20 h-[500px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[140px]" />

      {/* Shadow */}
      <div className="absolute inset-x-24 bottom-0 -z-10 h-20 rounded-full bg-black/60 blur-3xl" />

      <div
        className="
          group
          relative
          overflow-hidden
          rounded-[32px]
          border
          border-white/10
          bg-[#0B0B10]
          shadow-[0_60px_120px_rgba(0,0,0,.45)]
          transition-all
          duration-700
        "
      >
        {/* Reflexo de vidro */}
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-br
            from-white/10
            via-transparent
            to-transparent
          "
        />

        {/* Borda iluminada */}
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            rounded-[32px]
            ring-1
            ring-inset
            ring-white/10
          "
        />

        {/* Screenshot */}
        <Image
          src="/print1landing.png"
          alt="Dashboard do FlowFinance"
          width={2200}
          height={1400}
          priority
          draggable={false}
          className="
            w-full
            select-none
            object-cover
            transition-transform
            duration-700
            group-hover:scale-[1.015]
          "
        />

        {/* Gradiente inferior */}
        <div
          className="
            pointer-events-none
            absolute
            inset-x-0
            bottom-0
            h-40
            bg-gradient-to-t
            from-black/15
            to-transparent
          "
        />
      </div>

    </div>
  )
}