'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { AssistantChatPanel } from '@/components/assistant-chat-panel'
import { useLgUp } from '@/hooks/use-lg-up'

const Grainient = dynamic(() => import('@/components/grainient').then((m) => m.Grainient), {
  ssr: false,
})

export default function AssistentePage() {
  const router = useRouter()
  const lgUp = useLgUp()
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login')
    } else {
      setAuthChecked(true)
    }
  }, [router])

  useEffect(() => {
    if (!authChecked || !lgUp) return
    router.replace('/dashboard?assistant=1')
  }, [authChecked, lgUp, router])

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (lgUp) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
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

      <AssistantChatPanel layout="page" showBackLink />
    </div>
  )
}
