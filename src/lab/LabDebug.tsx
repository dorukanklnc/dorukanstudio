import { useEffect, useState } from 'react'
import type { HQEngine } from './engine/types'

type Info = ReturnType<HQEngine['stats']> & { fps: number }

/**
 * `/experience-lab?debug`: live render settings and frame rate, so a visitor's machine
 * can be diagnosed from one screenshot. Nothing here is sent anywhere.
 */
export function LabDebug({ engine, tuning }: { engine: HQEngine; tuning: string }) {
  const [info, setInfo] = useState<Info>(() => ({ ...engine.stats(), fps: 0 }))

  useEffect(() => {
    let raf = 0
    let frames = 0
    let since = performance.now()
    const tick = (now: number) => {
      frames++
      if (now - since >= 1000) {
        setInfo({ ...engine.stats(), fps: Math.round((frames * 1000) / (now - since)) })
        frames = 0
        since = now
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [engine])

  const nav = navigator as Navigator & { deviceMemory?: number }
  return (
    <div className="lab-debug" aria-hidden="true">
      <div>
        <b>{info.fps} fps</b> · {info.quality} · render {info.pixelRatio.toFixed(2)}× (screen {window.devicePixelRatio}×)
      </div>
      <div>
        {window.innerWidth}×{window.innerHeight} · {navigator.hardwareConcurrency ?? '?'} cores · {nav.deviceMemory ?? '?'} GB ·{' '}
        {info.drawCalls} draws
      </div>
      <div>GPU: {info.gpu || 'not reported by the browser'}</div>
      <div>auto-tuning: {tuning}</div>
    </div>
  )
}
