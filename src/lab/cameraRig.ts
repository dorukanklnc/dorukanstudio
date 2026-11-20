/**
 * Camera tweening between engine poses, plus the screen regions each layout keeps
 * free for the subject (the rest is covered by HTML panels and buttons).
 */
import gsap from 'gsap'
import type { CameraPose, FrameRect, HQEngine } from './engine/types'

export const isNarrow = (w: number) => w < 760

/** Where the whole building should sit in the intro / explore views. */
export function heroFrame(w: number): FrameRect {
  return isNarrow(w) ? { x0: 0.03, y0: 0.19, x1: 0.97, y1: 0.64 } : { x0: 0.05, y0: 0.15, x1: 0.95, y1: 0.8 }
}

/** Where a room close-up sits: left of the side panel, or above the bottom sheet on phones. */
export function roomFrame(w: number): FrameRect {
  return isNarrow(w) ? { x0: 0.03, y0: 0.09, x1: 0.97, y1: 0.45 } : { x0: 0.03, y0: 0.1, x1: 0.6, y1: 0.94 }
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

function mix(a: CameraPose, b: CameraPose, t: number): CameraPose {
  return {
    position: [lerp(a.position[0], b.position[0], t), lerp(a.position[1], b.position[1], t), lerp(a.position[2], b.position[2], t)],
    target: [lerp(a.target[0], b.target[0], t), lerp(a.target[1], b.target[1], t), lerp(a.target[2], b.target[2], t)],
    fov: lerp(a.fov, b.fov, t),
    offset: [lerp(a.offset[0], b.offset[0], t), lerp(a.offset[1], b.offset[1], t)],
  }
}

/** Owns the current camera pose and animates it. `onUpdate` runs after every pose change. */
export class CameraRig {
  private pose: CameraPose | null = null
  private tween: gsap.core.Tween | null = null
  private engine: HQEngine
  private onUpdate: () => void

  constructor(engine: HQEngine, onUpdate: () => void) {
    this.engine = engine
    this.onUpdate = onUpdate
  }

  get moving() {
    return !!this.tween
  }

  /** Jump (duration 0) or fly to a pose. A dolly with a slight lift reads as a camera move, not a zoom. */
  go(to: CameraPose, duration: number) {
    this.tween?.kill()
    this.tween = null
    const from = this.pose
    if (!from || duration <= 0) {
      this.set(to)
      return
    }
    const p = { t: 0 }
    this.tween = gsap.to(p, {
      t: 1,
      duration,
      ease: 'power3.inOut',
      onUpdate: () => this.set(mix(from, to, p.t)),
      onComplete: () => {
        this.tween = null
        this.set(to)
      },
    })
  }

  private set(pose: CameraPose) {
    this.pose = pose
    this.engine.setPose(pose)
    this.onUpdate()
  }

  dispose() {
    this.tween?.kill()
    this.tween = null
  }
}
