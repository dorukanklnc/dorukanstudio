import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'
import { profile } from '../content/portfolio'
import { linkHandler, navigate, pathFor, useRoute } from '../lib/router'
import { useMedia } from '../lib/useMedia'
import gsap from 'gsap'
import { CameraRig, heroFrame, isNarrow, roomFrame } from './cameraRig'
import type { HQEngine, Quality, RoomId } from './engine/types'
import { QuickPortfolio } from './QuickPortfolio'
import { RoomPanel } from './RoomPanel'
import { STATIONS, stationById } from './stations'
import './lab.css'

type Status = 'loading' | 'ready' | 'unsupported' | 'error'

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') ?? c.getContext('webgl'))
  } catch {
    return false
  }
}

/** Phones and low-memory devices start in the light mode; `?quality=high|low` overrides. */
function detectQuality(): Quality {
  const q = new URLSearchParams(window.location.search).get('quality')
  if (q === 'high' || q === 'low') return q
  const nav = navigator as Navigator & { deviceMemory?: number }
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const small = Math.min(window.innerWidth, window.innerHeight) < 700
  if ((coarse && small) || (nav.deviceMemory ?? 8) <= 4 || (navigator.hardwareConcurrency ?? 8) <= 4) return 'low'
  return 'high'
}

const FLY = 1.15

export default function LabApp() {
  const { route } = useRoute()
  const reduced = useMedia('(prefers-reduced-motion: reduce)')
  const stageRef = useRef<HTMLDivElement>(null)
  const pinRefs = useRef(new Map<RoomId, HTMLButtonElement>())
  const rigRef = useRef<CameraRig | null>(null)
  const engineRef = useRef<HQEngine | null>(null)
  const reducedRef = useRef(reduced)
  const [engine, setEngine] = useState<HQEngine | null>(null)
  const [supported] = useState(hasWebGL)
  const [status, setStatus] = useState<Status>(supported ? 'loading' : 'unsupported')
  const [progress, setProgress] = useState(0)
  const [hover, setHover] = useState<RoomId | null>(null)
  const [size, setSize] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }))

  const roomParam = route.name === 'lab' ? route.room : undefined
  const station = stationById(roomParam)
  const showPortfolio = roomParam === 'portfolio' || status === 'unsupported' || status === 'error'
  const mode: 'hub' | 'room' | 'portfolio' = showPortfolio ? 'portfolio' : station ? 'room' : 'hub'
  const narrow = isNarrow(size.w)
  const stationIndex = station ? STATIONS.indexOf(station) : -1

  // Unknown room → the hub.
  useEffect(() => {
    if (roomParam && roomParam !== 'portfolio' && !station) navigate({ name: 'lab' }, { replace: true })
  }, [roomParam, station])

  // Camera moves follow the wall clock: on a slow GPU they finish on time in bigger
  // steps instead of stretching out (GSAP's default lag smoothing would slow them down).
  useEffect(() => {
    gsap.ticker.lagSmoothing(0)
    return () => gsap.ticker.lagSmoothing(500, 33)
  }, [])

  // Not linked from the site yet: keep it out of search results while in development.
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex'
    document.head.appendChild(meta)
    const prevTitle = document.title
    document.body.classList.add('lab-body')
    return () => {
      meta.remove()
      document.title = prevTitle
      document.body.classList.remove('lab-body')
    }
  }, [])

  useEffect(() => {
    document.title = station ? `${station.label} — ${profile.name}` : `Experience Lab — ${profile.name}`
  }, [station])

  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  /** Keep the HTML pins glued to the rooms' nameplates. */
  const updatePins = useCallback(() => {
    const eng = engineRef.current
    if (!eng) return
    for (const s of STATIONS) {
      const el = pinRefs.current.get(s.id)
      if (!el) continue
      const p = eng.projectRoom(s.id)
      el.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px)`
      el.dataset.visible = p.visible ? 'true' : 'false'
    }
  }, [])

  // Mount the engine once; it owns its own <canvas>.
  useEffect(() => {
    if (!supported) return
    let disposed = false
    let eng: HQEngine | null = null
    const canvas = document.createElement('canvas')
    canvas.className = 'lab-canvas'
    canvas.setAttribute('aria-hidden', 'true')
    stageRef.current?.prepend(canvas)
    import('./engine')
      .then(({ createHQ }) =>
        createHQ({ canvas, quality: detectQuality(), reducedMotion: reducedRef.current, onProgress: (p) => !disposed && setProgress(p) }),
      )
      .then((e) => {
        if (disposed) {
          e.dispose()
          return
        }
        eng = e
        engineRef.current = e
        e.resize(window.innerWidth, window.innerHeight, window.devicePixelRatio || 1)
        rigRef.current = new CameraRig(e, updatePins)
        if (import.meta.env.DEV) (window as unknown as { __labStats: () => unknown }).__labStats = () => e.stats()
        setEngine(e)
        setStatus('ready')
      })
      .catch((err) => {
        console.error('Experience Lab failed to start', err)
        if (!disposed) setStatus('error')
      })
    return () => {
      disposed = true
      rigRef.current?.dispose()
      rigRef.current = null
      engineRef.current = null
      eng?.dispose()
      canvas.remove()
      setEngine(null)
    }
  }, [supported, updatePins])

  useEffect(() => {
    reducedRef.current = reduced
    engine?.setReducedMotion(reduced)
  }, [engine, reduced])

  useLayoutEffect(() => {
    engine?.resize(size.w, size.h, window.devicePixelRatio || 1)
  }, [engine, size])

  // Camera: hub ⇄ room. First placement and resizes jump; navigation flies.
  const placedRef = useRef(false)
  const lastSizeRef = useRef(size)
  useLayoutEffect(() => {
    const rig = rigRef.current
    if (!engine || !rig || mode === 'portfolio') return
    const resized = lastSizeRef.current !== size
    lastSizeRef.current = size
    const pose = station ? engine.roomPose(station.id, roomFrame(size.w)) : engine.heroPose(heroFrame(size.w))
    rig.go(pose, !placedRef.current || resized || reduced ? 0 : FLY)
    placedRef.current = true
    engine.setFocus(station?.id ?? null)
  }, [engine, mode, station, size, reduced])

  // Pause rendering when nothing is visible.
  useEffect(() => {
    if (!engine) return
    const sync = () => engine.setPaused(document.hidden || mode === 'portfolio')
    sync()
    document.addEventListener('visibilitychange', sync)
    return () => document.removeEventListener('visibilitychange', sync)
  }, [engine, mode])

  // If the first seconds are slow, drop to the light mode.
  useEffect(() => {
    if (!engine || reduced || new URLSearchParams(window.location.search).get('quality')) return
    let raf = 0
    let last = performance.now()
    const times: number[] = []
    const tick = (now: number) => {
      times.push(now - last)
      last = now
      if (times.length < 90) raf = requestAnimationFrame(tick)
      else {
        const sorted = times.slice(10).sort((a, b) => a - b)
        if (sorted[Math.floor(sorted.length / 2)] > 30) engine.setQuality('low')
      }
    }
    const start = window.setTimeout(() => (raf = requestAnimationFrame(tick)), 1200)
    return () => {
      window.clearTimeout(start)
      cancelAnimationFrame(raf)
    }
  }, [engine, reduced])

  useEffect(() => {
    engine?.setHover(hover)
  }, [engine, hover])

  const open = useCallback((id: RoomId) => navigate({ name: 'lab', room: id }), [])
  const back = useCallback(() => navigate({ name: 'lab' }), [])
  const step = useCallback(
    (d: number) => {
      const i = stationIndex < 0 ? 0 : (stationIndex + d + STATIONS.length) % STATIONS.length
      navigate({ name: 'lab', room: STATIONS[i].id }, { replace: true })
    },
    [stationIndex],
  )

  useEffect(() => {
    if (mode !== 'room') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') back()
      else if (e.key === 'ArrowRight' && !(e.target instanceof HTMLInputElement)) step(1)
      else if (e.key === 'ArrowLeft' && !(e.target instanceof HTMLInputElement)) step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mode, back, step])

  const pickAt = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!engine || e.target !== e.currentTarget) return null
    const r = e.currentTarget.getBoundingClientRect()
    return engine.pick(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
  }
  const onPointerMove = (e: ReactMouseEvent<HTMLDivElement> & { pointerType: string }) => {
    if (e.pointerType !== 'mouse' || mode !== 'hub') return
    const id = pickAt(e)
    if (id !== hover) setHover(id)
  }
  const onClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (mode !== 'hub') return
    const id = pickAt(e)
    if (id) open(id)
  }

  const pct = Math.round(progress * 100)
  const pins = useMemo(() => STATIONS, [])

  return (
    <div className="lab" data-mode={mode} data-ready={status === 'ready' || undefined}>
      <div
        ref={stageRef}
        className="lab-stage"
        data-hover={hover ? 'true' : undefined}
        onPointerMove={onPointerMove}
        onPointerLeave={() => setHover(null)}
        onClick={onClick}
        aria-hidden={mode === 'portfolio' || undefined}
      />

      {status === 'loading' && (
        <div className="lab-loading" role="status">
          <span>Opening the HQ…</span>
          <span className="lab-progress" aria-hidden="true">
            <span style={{ width: `${pct}%` }} />
          </span>
          <span className="lab-pct">{pct}%</span>
        </div>
      )}

      {mode !== 'portfolio' && (
        <>
          <header className="lab-top">
            <a className="lab-brand" href={pathFor({ name: 'lab' })} onClick={linkHandler({ name: 'lab' })}>
              <span className="lab-brand-name">{profile.name}</span>
              <span className="lab-brand-tag">{profile.tagline}</span>
            </a>
            <nav className="lab-nav" aria-label="Experience Lab">
              <a href={pathFor({ name: 'lab', room: 'portfolio' })} onClick={linkHandler({ name: 'lab', room: 'portfolio' })}>
                Quick portfolio
              </a>
              <a href={pathFor({ name: 'home' })}>Classic site</a>
            </nav>
          </header>

          {mode === 'hub' && status === 'ready' && !narrow && (
            <div className="lab-pins">
              {pins.map((s, i) => (
                <button
                  key={s.id}
                  ref={(el) => {
                    if (el) pinRefs.current.set(s.id, el)
                    else pinRefs.current.delete(s.id)
                  }}
                  type="button"
                  className="lab-pin"
                  data-active={hover === s.id || undefined}
                  data-start={s.id === 'security' || undefined}
                  style={{ ['--pin' as string]: s.color }}
                  onClick={() => open(s.id)}
                  onFocus={() => setHover(s.id)}
                  onBlur={() => setHover(null)}
                  onPointerEnter={() => setHover(s.id)}
                  onPointerLeave={() => setHover(null)}
                >
                  <span className="lab-pin-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="lab-pin-label">{s.id === 'security' ? `Start here · ${s.short}` : s.label}</span>
                </button>
              ))}
            </div>
          )}

          {mode === 'hub' && (
            <div className="lab-bottom">
              {narrow && <p className="lab-intro">Eight rooms, one engineer. Tap a room below or start the tour at the security desk.</p>}
              {narrow && status === 'ready' && (
                <ul className="lab-chips-row" aria-label="Rooms">
                  {STATIONS.map((s, i) => (
                    <li key={s.id}>
                      <button type="button" className="lab-chip" onClick={() => open(s.id)}>
                        <span className="lab-chip-num" style={{ background: s.color }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        {s.short}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="lab-cta">
                <button type="button" className="lab-btn lab-btn-dark lab-btn-lg" onClick={() => open('security')} disabled={status !== 'ready'}>
                  Explore <span aria-hidden="true">→</span>
                </button>
                <a className="lab-btn lab-btn-lg" href={pathFor({ name: 'lab', room: 'portfolio' })} onClick={linkHandler({ name: 'lab', room: 'portfolio' })}>
                  Quick portfolio
                </a>
              </div>
              {!narrow && <p className="lab-hint">Click a lit room to step inside · or start the tour at Security</p>}
            </div>
          )}

          {mode === 'room' && station && (
            <RoomPanel
              station={station}
              index={stationIndex}
              total={STATIONS.length}
              onBack={back}
              onPrev={() => step(-1)}
              onNext={() => step(1)}
            />
          )}
        </>
      )}

      {mode === 'portfolio' && (
        <QuickPortfolio
          onClose={status === 'ready' || status === 'loading' ? back : undefined}
          note={
            status === 'unsupported' || status === 'error'
              ? 'Your browser couldn’t start the 3D view, so here is the quick version of the portfolio.'
              : undefined
          }
        />
      )}
    </div>
  )
}
