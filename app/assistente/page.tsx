'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { AssistantChatPanel } from '@/components/assistant-chat-panel'
import { useTransactions } from '@/hooks/use-transactions'

const Grainient = dynamic(() => import('@/components/grainient').then((m) => m.Grainient), {
  ssr: false,
})

export default function AssistentePage() {
  const router = useRouter()
  const { refetch } = useTransactions()
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login')
    } else {
      setAuthChecked(true)
    }
  }, [router])

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <div className="fixed inset-0 -z-10">
        <Grainient
          color1="#7c3aed"
          color2="#0c0a14"
          color3="#1e1b2e"
          timeSpeed={0.25}
          colorBalance={0}
          warpStrength={1}
          warpFrequency={5}
          warpSpeed={2}
          warpAmplitude={50}
          blendAngle={0}
          blendSoftness={0.05}
          rotationAmount={500}
          noiseScale={2}
          grainAmount={0.1}
          grainScale={2}
          grainAnimated={false}
          contrast={1.5}
          gamma={1}
          saturation={1}
          centerX={0}
          centerY={0}
          zoom={0.9}
          className="h-full w-full"
        />
      </div>
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_18%,rgba(110,124,255,0.12),transparent_34%),linear-gradient(180deg,rgba(9,11,16,0.1),rgba(9,11,16,0.78))]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-48 bg-gradient-to-b from-white/[0.035] to-transparent"
        aria-hidden
      />

      <AssistantChatPanel layout="page" showBackLink onTransactionCreated={refetch} />
    </div>
  )
}
