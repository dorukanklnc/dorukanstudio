/**
 * Static merge + light bake.
 *
 * Every placeholder mesh is flattened into one of seven buckets (one draw call each).
 * Lit buckets get per-vertex albedo, roughness/metalness, a room id and two baked-light
 * attributes: `bakeLow` (every lamp) and `bakeHigh` (without the lamps that are real-time
 * lights in 'high'). Each lamp only reaches vertices of its own room, spot cones and
 * distance falloff follow three.js' physical model, and soft shadows / contact AO come from
 * rays and proximity tests against the room's prop bounding boxes.
 */
import * as THREE from 'three'
import type { UVRect } from './atlas'
import type { PieceData, Surface } from './kit'
import { COL_X, COLS, D, FLOOR_Y, H, OUTSIDE, ROOMS } from './layout'
import { GLOBAL, type BakeLight } from './lights'
import { yieldToMain } from './yield'

export type BucketKind = 'lit' | 'litDS' | 'tile' | 'decal' | 'screen' | 'glow' | 'add'
export type DynamicKind = 'arm' | 'rings'

interface Layout {
  nor: boolean
  uv: boolean
  bake: boolean
  tile: boolean
  rm: boolean
  phase: boolean
}
const L_LIT: Layout = { nor: true, uv: false, bake: true, tile: false, rm: true, phase: false }
export const LAYOUTS: Record<BucketKind, Layout> = {
  lit: L_LIT,
  litDS: L_LIT,
  tile: { nor: true, uv: true, bake: true, tile: true, rm: true, phase: false },
  decal: { nor: true, uv: true, bake: true, tile: false, rm: true, phase: false },
  screen: { nor: false, uv: true, bake: false, tile: false, rm: false, phase: false },
  glow: { nor: false, uv: false, bake: false, tile: false, rm: false, phase: true },
  add: { nor: false, uv: true, bake: false, tile: false, rm: false, phase: false },
}

export interface BakedMesh {
  kind: BucketKind
  geometry: THREE.BufferGeometry
  bakeLow: Float32Array | null
  bakeHigh: Float32Array | null
  dynamic: DynamicKind | null
  /** World matrix of the dynamic pivot (identity for static buckets). */
  matrix: THREE.Matrix4
}

class Acc {
  pos: number[] = []
  wpos: number[] = []
  nor: number[] = []
  wnor: number[] = []
  uv: number[] = []
  col: number[] = []
  room: number[] = []
  rm: number[] = []
  tile: number[] = []
  phase: number[] = []
  lift: number[] = []
  ov: number[] = []
  owner: number[] = []
  idx: number[] = []
  n = 0
}

function kindOf(s: Surface): BucketKind {
  if (s.k === 'lit') return s.ds ? 'litDS' : 'lit'
  return s.k
}

const _v = new THREE.Vector3()
const _w = new THREE.Vector3()
const _n = new THREE.Vector3()
const _nm = new THREE.Matrix3()
const _nms = new THREE.Matrix3()
const _ms = new THREE.Matrix4()

function remap(r: UVRect, u: number, v: number): [number, number] {
  return [r.u0 + u * (r.u1 - r.u0), r.v0 + v * (r.v1 - r.v0)]
}

function addMesh(acc: Acc, mesh: THREE.Mesh, s: Surface, room: number, owner: number, toStored: THREE.Matrix4 | null): void {
  const geo = mesh.geometry
  const mw = mesh.matrixWorld
  _nm.getNormalMatrix(mw)
  if (toStored) _ms.multiplyMatrices(toStored, mw)
  else _ms.copy(mw)
  _nms.getNormalMatrix(_ms)
  const P = geo.getAttribute('position') as THREE.BufferAttribute
  const N = geo.getAttribute('normal') as THREE.BufferAttribute | undefined
  const U = geo.getAttribute('uv') as THREE.BufferAttribute | undefined
  const base = acc.n
  const c = s.color
  for (let i = 0; i < P.count; i++) {
    _v.fromBufferAttribute(P, i)
    _w.copy(_v).applyMatrix4(mw)
    _v.applyMatrix4(_ms)
    acc.pos.push(_v.x, _v.y, _v.z)
    acc.wpos.push(_w.x, _w.y, _w.z)
    if (N) {
      _n.fromBufferAttribute(N, i).applyMatrix3(_nm).normalize()
      acc.wnor.push(_n.x, _n.y, _n.z)
      _n.fromBufferAttribute(N, i).applyMatrix3(_nms).normalize()
      acc.nor.push(_n.x, _n.y, _n.z)
    } else {
      acc.wnor.push(0, 0, 1)
      acc.nor.push(0, 0, 1)
    }
    const u = U ? U.getX(i) : 0, v = U ? U.getY(i) : 0
    if (s.k === 'tile') {
      acc.uv.push(u, v)
      acc.tile.push(s.tile.u0, s.tile.v0, s.tile.du, s.tile.dv)
    } else if (s.k === 'decal' || s.k === 'screen' || s.k === 'add') {
      const [a, b] = remap(s.rect, u, v)
      acc.uv.push(a, b)
    }
    acc.col.push(c.r, c.g, c.b)
    acc.room.push(room)
    acc.owner.push(owner)
    if (s.k === 'lit') acc.rm.push(s.r, s.m)
    else if (s.k === 'tile') acc.rm.push(s.r, 0)
    else if (s.k === 'decal') acc.rm.push(s.r, s.m)
    if (s.k === 'glow') acc.phase.push(s.phase)
    const lift = s.k === 'lit' || s.k === 'decal' ? s.lift : null
    acc.lift.push(lift ? lift.r : 0, lift ? lift.g : 0, lift ? lift.b : 0)
    acc.ov.push((s.k === 'lit' || s.k === 'tile') && s.bake !== null ? s.bake : -1)
  }
  const flip = _ms.determinant() < 0
  if (geo.index) {
    const I = geo.index
    for (let i = 0; i < I.count; i += 3) {
      const a = I.getX(i), b = I.getX(i + 1), cc = I.getX(i + 2)
      if (flip) acc.idx.push(base + a, base + cc, base + b)
      else acc.idx.push(base + a, base + b, base + cc)
    }
  } else {
    for (let i = 0; i < P.count; i += 3) {
      if (flip) acc.idx.push(base + i, base + i + 2, base + i + 1)
      else acc.idx.push(base + i, base + i + 1, base + i + 2)
    }
  }
  acc.n += P.count
}

/* ------------------------------------------------------------------ occluders */
interface Occluders {
  box: Float32Array // 6 per box
  owner: Int32Array
  count: number
}

function collectOccluders(items: { mesh: THREE.Mesh; room: number; owner: number }[]): Occluders[] {
  const per: { b: number[]; o: number[] }[] = ROOMS.map(() => ({ b: [], o: [] }))
  const bb = new THREE.Box3()
  for (const it of items) {
    if (it.room >= OUTSIDE) continue
    const piece = it.mesh.userData.piece as PieceData
    if (!piece.occ) continue
    const g = it.mesh.geometry
    if (!g.boundingBox) g.computeBoundingBox()
    if (!g.boundingBox) continue
    bb.copy(g.boundingBox).applyMatrix4(it.mesh.matrixWorld)
    const sx = bb.max.x - bb.min.x, sy = bb.max.y - bb.min.y, sz = bb.max.z - bb.min.z
    if (Math.max(sx, sy, sz) < 0.08 || Math.max(sx, sy, sz) > 3.2) continue
    per[it.room].b.push(bb.min.x, bb.min.y, bb.min.z, bb.max.x, bb.max.y, bb.max.z)
    per[it.room].o.push(it.owner)
  }
  return per.map((p) => ({ box: new Float32Array(p.b), owner: new Int32Array(p.o), count: p.o.length }))
}

/** Does the segment o→o+d (t ∈ (0,1)) hit any box except `skip`? */
function segmentBlocked(oc: Occluders, skip: number, ox: number, oy: number, oz: number, dx: number, dy: number, dz: number): boolean {
  const B = oc.box
  const ex = ox + dx, ey = oy + dy, ez = oz + dz
  const lx = Math.min(ox, ex), hx = Math.max(ox, ex), ly = Math.min(oy, ey), hy = Math.max(oy, ey), lz = Math.min(oz, ez), hz = Math.max(oz, ez)
  for (let i = 0; i < oc.count; i++) {
    const j = i * 6
    if (B[j + 3] < lx || B[j] > hx || B[j + 4] < ly || B[j + 1] > hy || B[j + 5] < lz || B[j + 2] > hz) continue
    if (oc.owner[i] === skip) continue
    let t0 = 1e-4, t1 = 1
    let ok = true
    for (let a = 0; a < 3 && ok; a++) {
      const o = a === 0 ? ox : a === 1 ? oy : oz
      const d = a === 0 ? dx : a === 1 ? dy : dz
      const mn = B[j + a], mx = B[j + 3 + a]
      if (Math.abs(d) < 1e-9) {
        if (o < mn || o > mx) ok = false
      } else {
        let ta = (mn - o) / d, tb = (mx - o) / d
        if (ta > tb) { const t = ta; ta = tb; tb = t }
        if (ta > t0) t0 = ta
        if (tb < t1) t1 = tb
        if (t0 > t1) ok = false
      }
    }
    if (ok) return true
  }
  return false
}

const smooth = (a: number, b: number, x: number): number => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/* ------------------------------------------------------------------ bake */
const SAMPLES: [number, number][] = [[0.14, 0.05], [-0.05, 0.14], [-0.14, -0.05], [0.05, -0.14]]

async function bakeAcc(acc: Acc, lights: BakeLight[], occ: Occluders[], step: (i: number) => Promise<void>): Promise<{ low: Float32Array; high: Float32Array }> {
  const n = acc.n
  const low = new Float32Array(n * 3), high = new Float32Array(n * 3)
  const byRoom: BakeLight[][] = []
  for (let r = 0; r <= OUTSIDE; r++) byRoom.push(lights.filter((l) => l.room === r))
  const IPI = 1 / Math.PI
  const g = GLOBAL
  const md = g.moonDir, bd = g.bounceDir
  // crude one-bounce fill: a small share of each room spot's flux as ambient in that room
  const bounce = byRoom.map((ls) => {
    const b = [0, 0, 0]
    for (const L of ls) if (L.type === 'spot') { const k = L.intensity * 0.016 * IPI; b[0] += L.color.r * k; b[1] += L.color.g * k; b[2] += L.color.b * k }
    return b
  })
  for (let i = 0; i < n; i++) {
    if (i > 0 && (i & 4095) === 0) await step(i)
    const i3 = i * 3
    const ov = acc.ov[i]
    if (ov >= 0) {
      low[i3] = low[i3 + 1] = low[i3 + 2] = ov
      high[i3] = high[i3 + 1] = high[i3 + 2] = ov
      continue
    }
    const px = acc.wpos[i3], py = acc.wpos[i3 + 1], pz = acc.wpos[i3 + 2]
    const nx = acc.wnor[i3], ny = acc.wnor[i3 + 1], nz = acc.wnor[i3 + 2]
    const room = acc.room[i], owner = acc.owner[i]
    const inside = room < OUTSIDE
    // global terms
    const hf = inside ? 0.7 + 0.3 * smooth(-D, 0, pz) : 1
    const hm = 0.5 * ny + 0.5
    let cr = (g.hemiGround.r + (g.hemiSky.r - g.hemiGround.r) * hm) * g.hemi * hf
    let cg = (g.hemiGround.g + (g.hemiSky.g - g.hemiGround.g) * hm) * g.hemi * hf
    let cb = (g.hemiGround.b + (g.hemiSky.b - g.hemiGround.b) * hm) * g.hemi * hf
    const mdl = Math.max(0, nx * md.x + ny * md.y + nz * md.z) * g.moon * (inside ? 0.8 * smooth(-1.4, 0.15, pz) : 1)
    cr += g.moonColor.r * mdl; cg += g.moonColor.g * mdl; cb += g.moonColor.b * mdl
    const bdl = Math.max(0, nx * bd.x + ny * bd.y + nz * bd.z) * g.bounce * (inside ? smooth(-2, 0.2, pz) : 1)
    cr += g.bounceColor.r * bdl; cg += g.bounceColor.g * bdl; cb += g.bounceColor.b * bdl
    cr *= IPI; cg *= IPI; cb *= IPI
    let rr = 0, rg = 0, rb = 0
    // local lamps
    const ls = byRoom[room]
    const bf = bounce[room]
    if (inside) { const up = 0.75 + 0.25 * ny; cr += bf[0] * up; cg += bf[1] * up; cb += bf[2] * up }
    const oc = inside ? occ[room] : null
    for (const L of ls) {
      let dx = L.pos.x - px, dy = L.pos.y - py, dz = L.pos.z - pz
      const dist = Math.hypot(dx, dy, dz)
      if (dist < 1e-4) continue
      dx /= dist; dy /= dist; dz /= dist
      const ndl = nx * dx + ny * dy + nz * dz
      if (ndl <= 0) continue
      let att = 1 / Math.max(dist * dist, 0.01)
      if (L.distance > 0) {
        const q = dist / L.distance
        const f = Math.max(0, 1 - q * q * q * q)
        att *= f * f
      }
      if (L.type === 'spot') att *= smooth(L.coneCos, L.penCos, -(dx * L.dir.x + dy * L.dir.y + dz * L.dir.z))
      let k = L.intensity * att * ndl * IPI
      if (k < 1e-4) continue
      if (L.shadow && oc) {
        const ox = px + nx * 0.03, oy = py + ny * 0.03, oz = pz + nz * 0.03
        let vis = 0
        for (const [sx, sz] of SAMPLES) if (!segmentBlocked(oc, owner, ox, oy, oz, L.pos.x + sx - ox, L.pos.y - oy, L.pos.z + sz - oz)) vis++
        k *= 0.15 + 0.85 * (vis / SAMPLES.length)
      }
      if (L.realtime) { rr += L.color.r * k; rg += L.color.g * k; rb += L.color.b * k }
      else { cr += L.color.r * k; cg += L.color.g * k; cb += L.color.b * k }
    }
    // ambient occlusion: prop proximity + room corners
    let ao = 1
    if (oc) {
      let o = 0
      const R = 0.55
      const B = oc.box
      for (let b = 0; b < oc.count; b++) {
        if (oc.owner[b] === owner) continue
        const j = b * 6
        const qx = Math.min(Math.max(px, B[j]), B[j + 3]), qy = Math.min(Math.max(py, B[j + 1]), B[j + 4]), qz = Math.min(Math.max(pz, B[j + 2]), B[j + 5])
        const d = Math.hypot(px - qx, py - qy, pz - qz)
        if (d > R) continue
        const vx = (B[j] + B[j + 3]) / 2 - px, vy = (B[j + 1] + B[j + 4]) / 2 - py, vz = (B[j + 2] + B[j + 5]) / 2 - pz
        const vl = Math.hypot(vx, vy, vz) || 1
        const w = (nx * vx + ny * vy + nz * vz) / vl
        if (w <= 0.05) continue
        const sx = B[j + 3] - B[j], sy = B[j + 4] - B[j + 1], sz = B[j + 5] - B[j + 2]
        const sf = Math.min(1, Math.sqrt((sx * sy + sy * sz + sx * sz) / 3) / 0.45)
        const f = 1 - d / R
        o += w * f * f * sf
      }
      ao *= 1 - Math.min(0.5, o * 0.45)
      const def = ROOMS[room]
      const w = COLS[def.col]
      const lx = px - COL_X[def.col], ly = py - FLOOR_Y[def.floor]
      const s = (d: number): number => 1 - smooth(0, 0.5, d)
      const dF = s(ly), dC = s(H - ly), dB = s(pz + D), dL = s(lx + w / 2), dR = s(w / 2 - lx)
      const corner = Math.max(dF * dB, dF * dL, dF * dR, dB * dL, dB * dR, dC * dB, dC * dL, dC * dR)
      ao *= 1 - 0.3 * corner
    }
    const lr = acc.lift[i3], lg = acc.lift[i3 + 1], lb = acc.lift[i3 + 2]
    high[i3] = cr * ao + lr; high[i3 + 1] = cg * ao + lg; high[i3 + 2] = cb * ao + lb
    low[i3] = (cr + rr) * ao + lr; low[i3 + 1] = (cg + rg) * ao + lg; low[i3 + 2] = (cb + rb) * ao + lb
  }
  return { low, high }
}

function toGeometry(acc: Acc, layout: Layout): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(acc.pos, 3))
  if (layout.nor) g.setAttribute('normal', new THREE.Float32BufferAttribute(acc.nor, 3))
  if (layout.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(acc.uv, 2))
  g.setAttribute('color', new THREE.Float32BufferAttribute(acc.col, 3))
  g.setAttribute('aRoom', new THREE.Float32BufferAttribute(acc.room, 1))
  if (layout.rm) g.setAttribute('aRM', new THREE.Float32BufferAttribute(acc.rm, 2))
  if (layout.tile) g.setAttribute('tile', new THREE.Float32BufferAttribute(acc.tile, 4))
  if (layout.phase) g.setAttribute('aPhase', new THREE.Float32BufferAttribute(acc.phase, 1))
  g.setIndex(acc.n > 65535 ? new THREE.Uint32BufferAttribute(acc.idx, 1) : new THREE.Uint16BufferAttribute(acc.idx, 1))
  g.computeBoundingSphere()
  g.computeBoundingBox()
  return g
}


/**
 * Bakes the placeholder scene under `root`. Groups with userData.dynamic become their own
 * meshes (in the group's local space) so they can still be animated.
 */
export async function bakeScene(root: THREE.Object3D, lights: BakeLight[], onProgress: (p: number) => void): Promise<BakedMesh[]> {
  root.updateMatrixWorld(true)
  type Item = { mesh: THREE.Mesh; room: number; owner: number; dyn: THREE.Object3D | null }
  const items: Item[] = []
  let owner = 0
  const walk = (o: THREE.Object3D, room: number, dyn: THREE.Object3D | null): void => {
    const r = typeof o.userData.room === 'number' ? (o.userData.room as number) : room
    const d = o.userData.dynamic ? o : dyn
    if ((o as THREE.Mesh).isMesh && o.userData.piece) items.push({ mesh: o as THREE.Mesh, room: r, owner: owner++, dyn: d })
    for (const c of o.children) walk(c, r, d)
  }
  walk(root, OUTSIDE, null)
  const occ = collectOccluders(items)

  const statics = new Map<BucketKind, Acc>()
  const dyns = new Map<THREE.Object3D, Map<BucketKind, Acc>>()
  const inv = new Map<THREE.Object3D, THREE.Matrix4>()
  for (const it of items) {
    const s = (it.mesh.userData.piece as PieceData).s
    const kind = kindOf(s)
    let target: Map<BucketKind, Acc> = statics
    let toStored: THREE.Matrix4 | null = null
    if (it.dyn) {
      let m = dyns.get(it.dyn)
      if (!m) { m = new Map(); dyns.set(it.dyn, m); inv.set(it.dyn, it.dyn.matrixWorld.clone().invert()) }
      target = m
      toStored = inv.get(it.dyn) ?? null
    }
    let acc = target.get(kind)
    if (!acc) { acc = new Acc(); target.set(kind, acc) }
    addMesh(acc, it.mesh, s, it.room, it.owner, toStored)
  }
  onProgress(0.25)
  await yieldToMain()

  const out: BakedMesh[] = []
  const all: { acc: Acc; kind: BucketKind; dyn: THREE.Object3D | null }[] = []
  for (const [kind, acc] of statics) all.push({ acc, kind, dyn: null })
  for (const [d, m] of dyns) for (const [kind, acc] of m) all.push({ acc, kind, dyn: d })
  const total = all.reduce((a, b) => a + (LAYOUTS[b.kind].bake ? b.acc.n : 0), 0) || 1
  let done = 0
  for (const { acc, kind, dyn } of all) {
    const layout = LAYOUTS[kind]
    let low: Float32Array | null = null, high: Float32Array | null = null
    if (layout.bake) {
      const r = await bakeAcc(acc, lights, occ, async (i) => {
        onProgress(0.25 + 0.7 * ((done + i) / total))
        await yieldToMain()
      })
      low = r.low
      high = r.high
      done += acc.n
    }
    const geometry = toGeometry(acc, layout)
    if (low) geometry.setAttribute('bake', new THREE.Float32BufferAttribute(low, 3))
    out.push({ kind, geometry, bakeLow: low, bakeHigh: high, dynamic: dyn ? (dyn.userData.dynamic as DynamicKind) : null, matrix: dyn ? dyn.matrixWorld.clone() : new THREE.Matrix4() })
  }
  onProgress(1)
  return out
}
