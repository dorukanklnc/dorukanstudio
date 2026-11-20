/**
 * Dev-only harness for the HQ engine (served by Vite at /lab-dev.html, never built).
 * Query: ?q=high|low &view=hero|room &room=<id> &frame=x0,y0,x1,y1 &ui=1 &reduced=1 &pins=1
 */
import '@fontsource/pixelify-sans/latin-500.css'
import '@fontsource/pixelify-sans/latin-700.css'
import '@fontsource/pixelify-sans/latin-ext-500.css'
import '@fontsource/pixelify-sans/latin-ext-700.css'
import '@fontsource-variable/nunito/index.css'
import '@fontsource/ibm-plex-mono/latin-500.css'
import '@fontsource/ibm-plex-mono/latin-600.css'
import '@fontsource/ibm-plex-mono/latin-ext-500.css'
import '@fontsource/ibm-plex-mono/latin-ext-600.css'
import { createHQ } from '../index'
import { ROOM_IDS, type FrameRect, type HQEngine, type Quality, type RoomId } from '../types'

declare global {
  interface Window {
    __hq: HQEngine | null
    __ready: boolean
    __progress: number[]
    __buildMs: number
    __remount: (sameCanvas: boolean) => Promise<number>
    __show: () => Promise<void>
  }
}

const Q = new URLSearchParams(location.search)
const quality = (Q.get('q') ?? 'high') as Quality
const view = Q.get('view') ?? 'hero'
const room = (Q.get('room') ?? 'security') as RoomId
const phone = innerWidth < innerHeight
const defFrame: FrameRect = view === 'room'
  ? phone ? { x0: 0.02, y0: 0.08, x1: 0.98, y1: 0.5 } : { x0: 0.02, y0: 0.1, x1: 0.64, y1: 0.95 }
  : phone ? { x0: 0.03, y0: 0.14, x1: 0.97, y1: 0.62 } : { x0: 0.04, y0: 0.14, x1: 0.96, y1: 0.86 }
const frame: FrameRect = Q.has('frame')
  ? (([x0, y0, x1, y1]) => ({ x0, y0, x1, y1 }))(Q.get('frame')!.split(',').map(Number))
  : defFrame

let canvas = document.createElement('canvas')
document.body.appendChild(canvas)
window.__hq = null
window.__ready = false
window.__progress = []

const nextFrame = (): Promise<void> => new Promise((r) => requestAnimationFrame(() => r()))

async function mount(c: HTMLCanvasElement): Promise<HQEngine> {
  const t0 = performance.now()
  const hq = await createHQ({ canvas: c, quality, reducedMotion: Q.get('reduced') === '1', onProgress: (p) => window.__progress.push(+p.toFixed(3)) })
  window.__buildMs = Math.round(performance.now() - t0)
  hq.resize(innerWidth, innerHeight, devicePixelRatio)
  hq.setPose(view === 'room' ? hq.roomPose(room, frame) : hq.heroPose(frame))
  return hq
}

function decorate(hq: HQEngine): void {
  document.querySelectorAll('.frame,.mock,.pin').forEach((e) => e.remove())
  if (Q.get('showframe') === '1') {
    const d = document.createElement('div')
    d.className = 'frame'
    Object.assign(d.style, { left: `${frame.x0 * 100}%`, top: `${frame.y0 * 100}%`, width: `${(frame.x1 - frame.x0) * 100}%`, height: `${(frame.y1 - frame.y0) * 100}%` })
    document.body.appendChild(d)
  }
  if (Q.get('ui') === '1' && view === 'room') {
    const d = document.createElement('div')
    d.className = 'mock'
    Object.assign(d.style, phone ? { left: '12px', right: '12px', bottom: '12px', top: '52%' } : { right: '28px', top: '28px', bottom: '28px', width: '33%' })
    document.body.appendChild(d)
  }
  if (Q.get('pins') === '1') for (const id of ROOM_IDS) {
    const p = hq.projectRoom(id)
    if (!p.visible) continue
    const d = document.createElement('div')
    d.className = 'pin'
    Object.assign(d.style, { left: `${p.x}px`, top: `${p.y}px` })
    document.body.appendChild(d)
  }
}

async function show(): Promise<void> {
  const hq = window.__hq
  if (!hq) return
  decorate(hq)
  await nextFrame()
  await nextFrame()
  await nextFrame()
}

window.__show = show
window.__remount = async (sameCanvas: boolean): Promise<number> => {
  window.__hq?.dispose()
  window.__hq = null
  if (!sameCanvas) {
    canvas.remove()
    canvas = document.createElement('canvas')
    document.body.appendChild(canvas)
  }
  window.__hq = await mount(canvas)
  await show()
  return window.__buildMs
}

addEventListener('resize', () => window.__hq?.resize(innerWidth, innerHeight, devicePixelRatio))

mount(canvas)
  .then(async (hq) => {
    window.__hq = hq
    await show()
    window.__ready = true
  })
  .catch((e: unknown) => {
    console.error(e)
    document.body.insertAdjacentHTML('beforeend', `<pre id="hud">${String(e)}</pre>`)
  })
