/** Room shells, the cut-away frame with cream piping, nameplates, brick shell and roof. */
import * as THREE from 'three'
import { scaleUV, type Kit } from './kit'
import { COL_X, COLS, CEIL_TOP, D, FLOOR_Y, H, OUTSIDE, ROOMS, SLAB, TE, TOP_Y, TOTAL_W, X0, type RoomDef } from './layout'
import type { LightRig } from './lights'
import { PAL } from './palette'
import type { Art, TileKey } from './textures'

const WALLS: Record<string, TileKey | [TileKey, TileKey]> = {
  studio: 'wallStudio',
  ai: 'wallAi',
  mobile: 'wallMobile',
  about: 'wallAbout',
  saas: ['wallSchool', 'wallHotel'],
  security: 'wallSecurity',
  iot: 'wallIot',
  game: 'wallGame',
}

function grid(k: Kit, w: number, h: number, step: number, su: number, sv: number): THREE.BufferGeometry {
  const g = k.own(new THREE.PlaneGeometry(w, h, Math.max(1, Math.ceil(w / step)), Math.max(1, Math.ceil(h / step))))
  return scaleUV(g, su, sv)
}

/** Floor, walls, ceiling and baseboards of one room (inside its group). */
export function buildShell(k: Kit, art: Art, r: RoomDef, g: THREE.Group): void {
  const w = COLS[r.col], hw = w / 2
  const step = 0.22
  k.mesh(g, grid(k, w, D, step, w / 2.6, D / 2.6), k.tile(art.t.planks, { r: 0.62, tint: '#C8A27A' }), 0, 0, -D / 2, -Math.PI / 2)
  const wall = WALLS[r.id]
  const [left, right] = Array.isArray(wall) ? wall : [wall, wall]
  if (left !== right) {
    k.mesh(g, grid(k, hw, H, step, hw / 1.6, H / 1.6), k.tile(art.t[left]), -hw / 2, H / 2, -D)
    k.mesh(g, grid(k, hw, H, step, hw / 1.6, H / 1.6), k.tile(art.t[right]), hw / 2, H / 2, -D)
  } else {
    k.mesh(g, grid(k, w, H, step, w / 1.6, H / 1.6), k.tile(art.t[left]), 0, H / 2, -D)
  }
  k.mesh(g, grid(k, D, H, step, D / 1.6, H / 1.6), k.tile(art.t[left]), -hw, H / 2, -D / 2, 0, Math.PI / 2, 0)
  k.mesh(g, grid(k, D, H, step, D / 1.6, H / 1.6), k.tile(art.t[right]), hw, H / 2, -D / 2, 0, -Math.PI / 2, 0)
  k.mesh(g, grid(k, w, D, 0.3, 1, 1), k.lit('#4A4038', { r: 0.95 }), 0, H, -D / 2, Math.PI / 2)
  const base = k.lit('#EFE3C8', { r: 0.7 })
  k.mesh(g, k.BX(w, 0.12, 0.03), base, 0, 0.06, -D + 0.015)
  k.mesh(g, k.BX(0.03, 0.12, D), base, -hw + 0.015, 0.06, -D / 2)
  k.mesh(g, k.BX(0.03, 0.12, D), base, hw - 0.015, 0.06, -D / 2)
  // brass nameplate on the cut band above the opening (room-tagged so hover brightens it)
  const band = r.floor === 0 ? SLAB : TOP_Y - CEIL_TOP
  const pw = Math.min(2.15, w - 0.9), ph = (pw * 112) / 768
  const y = H + band / 2 + 0.01
  k.mesh(g, k.PL(pw, ph), k.decal(art.d.nameplates[r.id], { r: 0.38, m: 0.35, lift: 0.16 }), 0, y, 0.345)
  k.mesh(g, k.RB(0.14, 0.04, 0.08, 0.01), k.lit('#2A2420', { m: 0.5, r: 0.4 }), 0, y + ph / 2 + 0.05, 0.38)
}

function rrShape(s: THREE.Shape | THREE.Path, x: number, y: number, w: number, h: number, r: number): void {
  s.moveTo(x + r, y)
  s.lineTo(x + w - r, y)
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false)
  s.lineTo(x + w, y + h - r)
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false)
  s.lineTo(x + r, y + h)
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false)
  s.lineTo(x, y + r)
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false)
}

function frameShape(grow: number, shrink: number): THREE.Shape {
  const s = new THREE.Shape()
  rrShape(s, X0 - grow, 0, TOTAL_W + grow * 2, TOP_Y + grow, 0.16 + grow)
  for (const r of ROOMS) {
    const w = COLS[r.col], x = COL_X[r.col] - w / 2, y = FLOOR_Y[r.floor]
    const p = new THREE.Path()
    rrShape(p, x + shrink, y + shrink, w - shrink * 2, H - shrink * 2, 0.3)
    s.holes.push(p)
  }
  return s
}

/** emissive / albedo, so out = albedo · (bake + lift) reproduces an emissive term. */
function liftFor(albedo: string, emissive: string, k: number): string {
  const a = new THREE.Color(albedo), e = new THREE.Color(emissive).multiplyScalar(k)
  return '#' + new THREE.Color(e.r / a.r, e.g / a.g, e.b / a.b).getHexString()
}

export function buildFrame(k: Kit, art: Art, root: THREE.Group, rig: LightRig): void {
  const body = k.lit('#2C2521', { r: 0.7, lift: liftFor('#2C2521', '#3A2C22', 0.25) })
  const line = k.lit('#EFE4CA', { r: 0.6, lift: 0.13 })
  const cream = k.own(new THREE.ExtrudeGeometry(frameShape(0, 0), { depth: 0.3, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2, curveSegments: 8 }))
  k.mesh(root, cream, body)
  const ink = k.own(new THREE.ExtrudeGeometry(frameShape(0.09, 0.07), { depth: 0.31, bevelEnabled: false, curveSegments: 8 }))
  k.mesh(root, ink, line, 0, 0, -0.05)
  // cornice + street ledge
  k.mesh(root, k.RB(TOTAL_W + 0.7, 0.26, D + TE + 0.75, 0.04), body, 0, TOP_Y + 0.1, -(D + TE) / 2 + 0.18)
  k.mesh(root, k.BX(TOTAL_W + 0.72, 0.045, 0.02), line, 0, TOP_Y + 0.02, 0.556)
  k.mesh(root, k.RB(TOTAL_W + 0.4, 0.16, 0.5, 0.03), k.lit('#3A3F4E', { r: 0.9 }), 0, 0.08, 0.3)
  // brick shell (sides, back, roof slab)
  const brick = k.tile(art.t.brick, { r: 0.92 })
  const box = (w: number, h: number, d: number, x: number, y: number, z: number, su: number, sv: number): void => {
    k.mesh(root, scaleUV(k.own(new THREE.BoxGeometry(w, h, d, Math.ceil(w / 1.5), Math.ceil(h / 1.5), Math.ceil(d / 1.5))), su, sv), brick, x, y, z)
  }
  // inset 1.2 cm from the room planes so the shell never z-fights the wallpaper
  const E = 0.012
  box(TE - E, TOP_Y, D + TE, X0 + (TE - E) / 2, TOP_Y / 2, -(D + TE) / 2, 3, 4)
  box(TE - E, TOP_Y, D + TE, -X0 - (TE - E) / 2, TOP_Y / 2, -(D + TE) / 2, 3, 4)
  box(TOTAL_W, TOP_Y, TE - E, 0, TOP_Y / 2, -D - E - (TE - E) / 2, 12, 4)
  // lit side windows on the right exterior wall
  for (let f = 0; f < 2; f++) for (let i = 0; i < 2; i++) {
    const z = -1.2 - i * 2.0, y = FLOOR_Y[f] + 1.7
    k.mesh(root, k.RB(0.06, 1.0, 0.7, 0.02), k.lit('#151A28'), -X0 + 0.01, y, z)
    k.mesh(root, k.BX(0.02, 0.86, 0.56), k.glow('#FFC27A', 0.9), -X0 + 0.04, y, z)
  }
  buildRoof(k, art, root, rig)
}

function buildRoof(k: Kit, art: Art, root: THREE.Group, rig: LightRig): void {
  const roof = k.group(root, 0, TOP_Y, 0)
  const parapet = k.lit('#323C58', { r: 0.9 })
  k.mesh(roof, k.RB(TOTAL_W, 0.36, 0.22, 0.04), parapet, 0, 0.18, -D - TE + 0.11)
  for (const s of [-1, 1]) k.mesh(roof, k.RB(0.22, 0.36, D + TE, 0.04), parapet, s * (TOTAL_W / 2 - 0.11), 0.18, -(D + TE) / 2)
  // water tower
  const wt = k.group(roof, -7.4, 0, -2.6)
  const iron = k.lit('#2A2420', { m: 0.3 })
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) k.mesh(wt, k.BX(0.09, 1.2, 0.09), iron, sx * 0.55, 0.6, sz * 0.55)
  k.mesh(wt, k.BX(1.25, 0.06, 0.06), iron, 0, 0.5, 0.55, 0, 0, 0.6)
  k.mesh(wt, k.BX(1.25, 0.06, 0.06), iron, 0, 0.5, 0.55, 0, 0, -0.6)
  k.mesh(wt, k.CY(0.82, 0.82, 0.08, 24), iron, 0, 1.22, 0)
  k.mesh(wt, k.CY(0.78, 0.8, 1.35, 24), k.lit('#8A5A34', { r: 0.85 }), 0, 1.92, 0)
  for (let i = 0; i < 3; i++) k.mesh(wt, k.TO(0.8, 0.02, 4, 32), k.lit(PAL.ink, { m: 0.5, r: 0.5 }), 0, 1.45 + i * 0.45, 0, Math.PI / 2)
  k.mesh(wt, k.CO(0.95, 0.62, 24), k.lit('#2E2724', { r: 0.7 }), 0, 2.9, 0)
  k.mesh(wt, k.SP(0.06, 6, 4), k.lit(PAL.mustard, { m: 0.7, r: 0.3 }), 0, 3.24, 0)
  // rooftop sign, centred over the middle column
  const sg = k.group(roof, COL_X[1], 0, -2.9)
  const steel = k.lit('#24201D', { m: 0.4 })
  for (const sx of [-2.9, -1, 1, 2.9]) {
    k.mesh(sg, k.BX(0.07, 1.25, 0.07), steel, sx, 0.62, 0)
    k.mesh(sg, k.BX(0.05, 1.4, 0.05), steel, sx, 0.6, -0.45, -0.45, 0, 0)
  }
  k.mesh(sg, k.BX(6.0, 0.06, 0.06), steel, 0, 0.5, 0)
  for (let i = 0; i < 6; i++) k.mesh(sg, k.BX(0.05, 0.75, 0.04), steel, -2.5 + i * 1.0, 0.85, 0, 0, 0, 0.75 * (i % 2 ? 1 : -1))
  k.mesh(sg, k.RB(6.5, 1.12, 0.14, 0.05), k.lit(PAL.ink), 0, 1.75, 0)
  k.mesh(sg, k.PL(6.36, 1.0), k.decal(art.d.sign, { r: 0.6, lift: 0.62 }), 0, 1.75, 0.075)
  for (let i = 0; i < 22; i++) {
    const x = -3.05 + i * (6.1 / 21)
    k.mesh(sg, k.SP(0.035, 6, 4), k.glow('#FFD79A', 5), x, 2.36, 0.06)
    k.mesh(sg, k.SP(0.035, 6, 4), k.glow('#FFD79A', 5), x, 1.14, 0.06)
  }
  k.mesh(sg, k.PL(7.2, 2.2), k.add(art.s.soft, '#FFD79A', 0.18), 0, 1.75, 0.3)
  for (const sx of [-2.2, 0, 2.2]) {
    k.mesh(sg, k.CY(0.05, 0.08, 0.12, 10), k.lit(PAL.ink), sx, 0.95, 0.5, -1.0)
    rig.add(sg, OUTSIDE, { pos: [sx, 1.1, 0.75], color: '#FFD3A0', intensity: 1.6, distance: 2.2 })
  }
  // antenna, dish, AC unit
  const an = k.group(roof, 8.6, 0, -3.3)
  const gm = k.lit('#4A4F5E', { m: 0.6, r: 0.4 })
  k.mesh(an, k.CY(0.04, 0.06, 3.6, 8), gm, 0, 1.8, 0)
  for (let i = 0; i < 3; i++) k.mesh(an, k.BX(0.7 - i * 0.18, 0.025, 0.025), gm, 0, 2.4 + i * 0.4, 0)
  k.mesh(an, k.SP(0.07, 8, 6), k.glow(PAL.orange, 6, 4), 0, 3.65, 0)
  k.mesh(an, k.PL(0.9, 0.9), k.add(art.s.soft, PAL.orange, 0.6), 0, 3.65, 0.08)
  const dish = k.group(roof, 6.1, 0, -1.8, -0.6)
  k.mesh(dish, k.CY(0.05, 0.08, 0.6, 8), k.lit('#BFC4CC', { m: 0.5 }), 0, 0.3, 0)
  k.mesh(dish, k.own(new THREE.SphereGeometry(0.62, 24, 8, 0, Math.PI * 2, 0, 0.9)), k.lit('#D9DCE0', { r: 0.5, m: 0.3, ds: true }), 0, 0.85, 0, -0.9, 0, 0)
  k.mesh(dish, k.CY(0.012, 0.012, 0.6, 4), k.lit('#888888'), 0, 1.0, 0.2, -0.9 + Math.PI / 2 - 0.4)
  const ac = k.group(roof, -3.6, 0, -3.4)
  k.mesh(ac, k.RB(1.2, 0.7, 0.8, 0.04), k.lit('#8C93A3', { m: 0.3, r: 0.6 }), 0, 0.35, 0)
  k.mesh(ac, k.CY(0.28, 0.28, 0.02, 20), k.lit('#2A2E38'), 0, 0.71, 0)
  k.mesh(ac, k.TO(0.28, 0.02, 4, 20), k.lit('#B5BBC6', { m: 0.5 }), 0, 0.72, 0, Math.PI / 2)
  k.tube(roof, [[-3.0, 0.4, -3.0], [-2.4, 0.15, -2.6], [-1.6, 0.05, -2.0]], 0.05, k.lit('#6B7180', { m: 0.3 }), 10, 8)
  // a rooftop cat
  const cat = k.group(roof, 9.9, 0, -0.25, -0.5)
  const fur = k.lit('#14110F', { r: 0.9 })
  k.mesh(cat, k.SP(0.13, 12, 8), fur, 0, 0.14, 0, 0, 0, 0, [0.9, 1.2, 1])
  k.mesh(cat, k.SP(0.085, 12, 8), fur, 0.02, 0.36, 0.02)
  for (const s of [-1, 1]) k.mesh(cat, k.CO(0.03, 0.07, 6), fur, 0.02 + s * 0.045, 0.45, 0.02)
  k.tube(cat, [[-0.08, 0.04, -0.05], [-0.22, 0.05, -0.1], [-0.28, 0.16, -0.05], [-0.24, 0.26, 0.0]], 0.018, fur, 10, 5)
  // fairy lights from the water tower to the sign
  const fl: [number, number, number][] = []
  for (let i = 0; i <= 16; i++) { const t = i / 16; fl.push([-6.6 + t * 3.5, 2.0 - Math.sin(t * Math.PI) * 0.55 - t * 0.3, -2.4 - t * 0.4]) }
  k.tube(roof, fl, 0.008, k.lit(PAL.ink), 40, 4)
  for (let i = 1; i < 16; i++) { const p = fl[i]; k.mesh(roof, k.SP(0.04, 6, 4), k.glow('#FFD08A', 5), p[0], p[1] - 0.05, p[2]) }
}
