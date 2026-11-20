/**
 * Build-time kit. Rooms are authored as ordinary three.js meshes, but each mesh only
 * carries a *surface description* (userData.s); the baker later merges everything into a
 * handful of buckets (one draw call each) with per-vertex albedo, baked light and room id.
 */
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import type { TileRect, UVRect } from './atlas'

export type Surface =
  /** Flat albedo, lit by the bake (and real-time lights in 'high'). */
  | { k: 'lit'; color: THREE.Color; r: number; m: number; ds: boolean; lift: THREE.Color | null; bake: number | null }
  /** Repeating pattern from the tile atlas (uv in pattern repeats). */
  | { k: 'tile'; tile: TileRect; color: THREE.Color; r: number; bake: number | null }
  /** Lit decal from the decal atlas (posters, plates…). */
  | { k: 'decal'; rect: UVRect; color: THREE.Color; r: number; m: number; lift: THREE.Color | null }
  /** Unlit screen from the screen atlas; colour = brightness (HDR allowed). */
  | { k: 'screen'; rect: UVRect; color: THREE.Color; fog: boolean }
  /** Unlit HDR colour (bulbs, LEDs). phase > 0 makes it blink. */
  | { k: 'glow'; color: THREE.Color; phase: number }
  /** Additive soft sprite / light spill from the screen atlas. */
  | { k: 'add'; rect: UVRect; color: THREE.Color }

export interface PieceData {
  s: Surface
  occ: boolean
}

export interface LitOpts {
  r?: number
  m?: number
  ds?: boolean
  /** Self-illumination added to the baked light (scalar = grey). */
  lift?: number | string
  /** Replace the bake with a constant (unlit-looking far scenery). */
  bake?: number
}

type V3 = [number, number, number]

export class Kit {
  private readonly geos = new Map<string, THREE.BufferGeometry>()
  private readonly loose: THREE.BufferGeometry[] = []
  private readonly surfs = new Map<string, Surface>()
  readonly placeholder = new THREE.MeshBasicMaterial({ visible: false })

  private cached<G extends THREE.BufferGeometry>(key: string, make: () => G, solid: boolean): G {
    let g = this.geos.get(key) as G | undefined
    if (!g) {
      g = make()
      g.userData.solid = solid
      this.geos.set(key, g)
    }
    return g
  }

  RB(w: number, h: number, d: number, r = 0.03, s = 2): THREE.BufferGeometry {
    return this.cached(`rb${w},${h},${d},${r},${s}`, () => new RoundedBoxGeometry(w, h, d, s, Math.max(0.001, Math.min(r, w / 2 - 0.002, h / 2 - 0.002, d / 2 - 0.002))), true)
  }
  BX(w: number, h: number, d: number): THREE.BufferGeometry {
    return this.cached(`bx${w},${h},${d}`, () => new THREE.BoxGeometry(w, h, d), true)
  }
  CY(rt: number, rb: number, h: number, seg = 16, open = false): THREE.BufferGeometry {
    return this.cached(`cy${rt},${rb},${h},${seg},${open}`, () => new THREE.CylinderGeometry(rt, rb, h, seg, 1, open), !open)
  }
  SP(r: number, ws = 14, hs = 10): THREE.BufferGeometry {
    return this.cached(`sp${r},${ws},${hs}`, () => new THREE.SphereGeometry(r, ws, hs), true)
  }
  PL(w: number, h: number, sx = 1, sy = 1): THREE.BufferGeometry {
    return this.cached(`pl${w},${h},${sx},${sy}`, () => new THREE.PlaneGeometry(w, h, sx, sy), false)
  }
  TO(r: number, t: number, rs = 6, ts = 24, arc = Math.PI * 2): THREE.BufferGeometry {
    return this.cached(`to${r},${t},${rs},${ts},${arc}`, () => new THREE.TorusGeometry(r, t, rs, ts, arc), false)
  }
  CO(r: number, h: number, s = 14): THREE.BufferGeometry {
    return this.cached(`co${r},${h},${s}`, () => new THREE.ConeGeometry(r, h, s), true)
  }
  ICO(r: number, detail = 1): THREE.BufferGeometry {
    return this.cached(`ico${r},${detail}`, () => new THREE.IcosahedronGeometry(r, detail), true)
  }
  /** Uncached geometry owned by the kit (disposed with it). */
  own<G extends THREE.BufferGeometry>(g: G, solid = false): G {
    g.userData.solid = solid
    this.loose.push(g)
    return g
  }

  private surface(key: string, make: () => Surface): Surface {
    let s = this.surfs.get(key)
    if (!s) {
      s = make()
      this.surfs.set(key, s)
    }
    return s
  }

  lit(color: string, o: LitOpts = {}): Surface {
    const key = `L${color}|${o.r ?? 0.78}|${o.m ?? 0}|${o.ds ?? false}|${o.lift ?? ''}|${o.bake ?? ''}`
    return this.surface(key, () => ({
      k: 'lit',
      color: new THREE.Color(color),
      r: o.r ?? 0.78,
      m: o.m ?? 0,
      ds: o.ds ?? false,
      lift: liftColor(o.lift),
      bake: o.bake ?? null,
    }))
  }
  tile(tile: TileRect, o: { tint?: string; r?: number; bake?: number } = {}): Surface {
    return { k: 'tile', tile, color: new THREE.Color(o.tint ?? '#ffffff'), r: o.r ?? 0.9, bake: o.bake ?? null }
  }
  decal(rect: UVRect, o: { tint?: string; r?: number; m?: number; lift?: number } = {}): Surface {
    return { k: 'decal', rect, color: new THREE.Color(o.tint ?? '#ffffff'), r: o.r ?? 0.75, m: o.m ?? 0, lift: liftColor(o.lift) }
  }
  screen(rect: UVRect, k = 1.25, fog = true): Surface {
    return { k: 'screen', rect, color: new THREE.Color(k, k, k), fog }
  }
  glow(color: string, k = 1, phase = 0): Surface {
    return this.surface(`G${color}|${k}|${phase}`, () => ({ k: 'glow', color: new THREE.Color(color).multiplyScalar(k), phase }))
  }
  add(rect: UVRect, color: string, k = 1): Surface {
    return { k: 'add', rect, color: new THREE.Color(color).multiplyScalar(k) }
  }

  /** Creates a placeholder mesh carrying the surface; transforms like the concept's add(). */
  mesh(p: THREE.Object3D, geo: THREE.BufferGeometry, s: Surface, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sc?: number | V3): THREE.Mesh {
    const m = new THREE.Mesh(geo, this.placeholder)
    m.position.set(x, y, z)
    m.rotation.set(rx, ry, rz)
    if (sc !== undefined) {
      if (typeof sc === 'number') m.scale.setScalar(sc)
      else m.scale.set(sc[0], sc[1], sc[2])
    }
    const occ = !!geo.userData.solid && (s.k === 'lit' || s.k === 'decal' || s.k === 'tile')
    const data: PieceData = { s, occ }
    m.userData.piece = data
    p.add(m)
    return m
  }

  tube(p: THREE.Object3D, pts: V3[], r: number, s: Surface, seg = 20, rs = 6): THREE.Mesh {
    const curve = new THREE.CatmullRomCurve3(pts.map((a) => new THREE.Vector3(a[0], a[1], a[2])))
    return this.mesh(p, this.own(new THREE.TubeGeometry(curve, seg, r, rs, false)), s)
  }

  group(p: THREE.Object3D, x = 0, y = 0, z = 0, ry = 0): THREE.Group {
    const g = new THREE.Group()
    g.position.set(x, y, z)
    g.rotation.y = ry
    p.add(g)
    return g
  }

  dispose(): void {
    for (const g of this.geos.values()) g.dispose()
    for (const g of this.loose) g.dispose()
    this.geos.clear()
    this.loose.length = 0
    this.placeholder.dispose()
  }
}

function liftColor(l: number | string | undefined): THREE.Color | null {
  if (l === undefined) return null
  if (typeof l === 'number') return new THREE.Color(l, l, l)
  return new THREE.Color(l)
}

/** Scales a geometry's uvs in place (tiled surfaces use uv in pattern repeats). */
export function scaleUV(geo: THREE.BufferGeometry, su: number, sv: number): THREE.BufferGeometry {
  const uv = geo.getAttribute('uv') as THREE.BufferAttribute
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv)
  uv.needsUpdate = true
  return geo
}
