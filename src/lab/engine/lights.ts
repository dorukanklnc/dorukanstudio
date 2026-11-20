/**
 * Light rig. Every lamp of the concept still exists, but as a *bake light*: its
 * contribution is evaluated per vertex at build time (room-masked, with soft box shadows).
 * A few accent lights are flagged `realtime` and become real three.js lights in 'high'
 * quality only (excluded from that bake); one of them casts the single shadow map.
 */
import * as THREE from 'three'
import { OUTSIDE } from './layout'

export interface BakeLight {
  type: 'spot' | 'point'
  room: number
  anchor: THREE.Object3D
  local: THREE.Vector3
  targetLocal: THREE.Vector3 | null
  color: THREE.Color
  intensity: number
  distance: number
  angle: number
  penumbra: number
  /** Trace soft shadow rays against the room's props during the bake. */
  shadow: boolean
  /** Becomes a real-time light in 'high' quality. */
  realtime: boolean
  /** The one real-time shadow caster. */
  castShadow: boolean
  // resolved world-space values (filled by resolveLights)
  pos: THREE.Vector3
  dir: THREE.Vector3
  coneCos: number
  penCos: number
}

export interface LightSpec {
  type?: 'spot' | 'point'
  pos: [number, number, number]
  target?: [number, number, number]
  color: string
  intensity: number
  distance?: number
  angle?: number
  penumbra?: number
  shadow?: boolean
  realtime?: boolean
  castShadow?: boolean
}

export class LightRig {
  readonly lights: BakeLight[] = []

  add(anchor: THREE.Object3D, room: number, s: LightSpec): BakeLight {
    const l: BakeLight = {
      type: s.type ?? (s.target ? 'spot' : 'point'),
      room,
      anchor,
      local: new THREE.Vector3(...s.pos),
      targetLocal: s.target ? new THREE.Vector3(...s.target) : null,
      color: new THREE.Color(s.color),
      intensity: s.intensity,
      distance: s.distance ?? 0,
      angle: s.angle ?? 1,
      penumbra: s.penumbra ?? 0.85,
      shadow: s.shadow ?? false,
      realtime: s.realtime ?? false,
      castShadow: s.castShadow ?? false,
      pos: new THREE.Vector3(),
      dir: new THREE.Vector3(0, -1, 0),
      coneCos: 0,
      penCos: 1,
    }
    this.lights.push(l)
    return l
  }

  /** Converts anchor-local positions to world space (call after updateMatrixWorld). */
  resolve(): void {
    for (const l of this.lights) {
      l.pos.copy(l.local)
      l.anchor.localToWorld(l.pos)
      if (l.targetLocal) {
        const t = l.targetLocal.clone()
        l.anchor.localToWorld(t)
        l.dir.subVectors(t, l.pos).normalize()
      }
      l.coneCos = Math.cos(l.angle)
      l.penCos = Math.cos(l.angle * (1 - l.penumbra))
    }
  }

  /** Real three.js lights for 'high' quality (call after resolve()). */
  createRealtime(): { group: THREE.Group; shadowLight: THREE.SpotLight | null } {
    const group = new THREE.Group()
    let shadowLight: THREE.SpotLight | null = null
    for (const l of this.lights) {
      if (!l.realtime) continue
      if (l.type === 'spot') {
        const s = new THREE.SpotLight(l.color, l.intensity, l.distance, l.angle, l.penumbra, 2)
        s.position.copy(l.pos)
        s.target.position.copy(l.pos).add(l.dir)
        group.add(s, s.target)
        if (l.castShadow && !shadowLight) {
          s.castShadow = true
          s.shadow.mapSize.set(1024, 1024)
          s.shadow.bias = -0.0006
          s.shadow.normalBias = 0.025
          s.shadow.radius = 4
          s.shadow.camera.near = 0.25
          s.shadow.camera.far = 9
          shadowLight = s
        }
      } else {
        const p = new THREE.PointLight(l.color, l.intensity, l.distance, 2)
        p.position.copy(l.pos)
        group.add(p)
      }
    }
    return { group, shadowLight }
  }
}

/** Global (non-room) light terms used by the bake, mirroring the concept's rig. */
export const GLOBAL = {
  hemiSky: new THREE.Color('#5468A0'),
  hemiGround: new THREE.Color('#2A2018'),
  hemi: 0.9,
  moonColor: new THREE.Color('#AFC3F2'),
  moon: 0.9,
  moonDir: new THREE.Vector3(30, 45, 40).normalize(),
  bounceColor: new THREE.Color('#FFB070'),
  bounce: 0.25,
  bounceDir: new THREE.Vector3(-10, -4, 30).normalize(),
}

export const ROOM_OUTSIDE = OUTSIDE
