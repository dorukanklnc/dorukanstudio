/** Furniture and small props shared by several rooms (ported from the concept). */
import * as THREE from 'three'
import type { UVRect } from '../atlas'
import { H } from '../layout'
import { PAL } from '../palette'
import { light, type RoomCtx } from './context'

const INK = PAL.ink
const WOOD = PAL.wood

export function desk(c: RoomCtx, x: number, z: number, w: number, d: number, o: { h?: number; top?: string; leg?: string } = {}): void {
  const k = c.kit
  const h = o.h ?? 0.78
  k.mesh(c.g, k.RB(w, 0.06, d, 0.025), k.lit(o.top ?? WOOD, { r: 0.55 }), x, h - 0.03, z)
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) k.mesh(c.g, k.BX(0.05, h - 0.06, 0.05), k.lit(o.leg ?? '#2A2522', { r: 0.5, m: 0.3 }), x + sx * (w / 2 - 0.08), (h - 0.06) / 2, z + sz * (d / 2 - 0.08))
}

export function monitor(
  c: RoomCtx,
  p: THREE.Object3D,
  x: number, y: number, z: number, w: number, h: number,
  rect: UVRect,
  o: { ry?: number; k?: number; stand?: number; bezel?: string } = {},
): THREE.Group {
  const k = c.kit
  const stand = o.stand ?? 0.14
  const bz = k.lit(o.bezel ?? '#14161C', { r: 0.45 })
  const m = k.group(p, x, y, z, o.ry ?? 0)
  k.mesh(m, k.RB(w + 0.06, h + 0.06, 0.05, 0.02), bz, 0, stand + h / 2 + 0.03, 0)
  k.mesh(m, k.PL(w, h), k.screen(rect, o.k ?? 1.25), 0, stand + h / 2 + 0.03, 0.027)
  if (stand > 0) {
    k.mesh(m, k.BX(0.05, stand + 0.05, 0.04), bz, 0, (stand + 0.05) / 2, -0.04)
    k.mesh(m, k.RB(Math.min(0.32, w * 0.5), 0.02, 0.18, 0.01), bz, 0, 0.01, -0.02)
  }
  return m
}

export function chair(c: RoomCtx, x: number, z: number, ry: number, col = '#3A4258'): THREE.Group {
  const k = c.kit
  const g = k.group(c.g, x, 0, z, ry)
  const metal = k.lit('#1C1C22', { r: 0.4, m: 0.4 })
  k.mesh(g, k.RB(0.54, 0.09, 0.5, 0.04), k.lit(col), 0, 0.5, 0)
  k.mesh(g, k.RB(0.5, 0.58, 0.08, 0.04), k.lit(col), 0, 0.88, -0.25, -0.12)
  k.mesh(g, k.CY(0.025, 0.025, 0.42, 8), metal, 0, 0.27, 0)
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2
    k.mesh(g, k.BX(0.28, 0.03, 0.04), metal, Math.cos(a) * 0.14, 0.07, Math.sin(a) * 0.14, 0, -a, 0)
    k.mesh(g, k.SP(0.03, 6, 4), k.lit('#111111'), Math.cos(a) * 0.28, 0.03, Math.sin(a) * 0.28)
  }
  return g
}

export function plant(c: RoomCtx, x: number, z: number, s = 1, o: { pot?: string; leaf?: string; y?: number; parent?: THREE.Object3D } = {}): void {
  const k = c.kit
  const g = k.group(o.parent ?? c.g, x, o.y ?? 0, z)
  k.mesh(g, k.CY(0.16 * s, 0.12 * s, 0.3 * s, 14), k.lit(o.pot ?? '#C9734F', { r: 0.8 }), 0, 0.15 * s, 0)
  k.mesh(g, k.CY(0.15 * s, 0.15 * s, 0.02, 14), k.lit('#3A2A1E'), 0, 0.3 * s, 0)
  const n = 7
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + c.rng.range(0, 0.5)
    const l = (0.36 + c.rng.range(0, 0.2)) * s
    const tilt = 0.55 + c.rng.range(0, 0.4)
    const leaf = k.mesh(g, k.SP(0.5, 8, 6), k.lit(i % 2 ? o.leaf ?? '#4F8A5B' : '#6FA463', { r: 0.7 }), Math.cos(a) * 0.12 * s, 0.32 * s + l * 0.45, Math.sin(a) * 0.12 * s, 0, 0, 0, [0.09 * s, l, 0.035 * s])
    leaf.rotation.set(Math.sin(a) * tilt, 0, -Math.cos(a) * tilt)
    ;(leaf.userData.piece as { occ: boolean }).occ = false
  }
}

export function books(
  c: RoomCtx, p: THREE.Object3D, x: number, y: number, z: number, width: number,
  o: { ry?: number; maxH?: number; cols?: string[] } = {},
): void {
  const k = c.kit
  const cols = o.cols ?? [PAL.mustard, PAL.pink, PAL.sky, PAL.turq, PAL.violet, PAL.cream, PAL.orange, PAL.lime, '#7A4E2B']
  const maxH = o.maxH ?? 0.3
  const g = k.group(p, x, y, z, o.ry ?? 0)
  let cx = -width / 2
  while (cx < width / 2 - 0.04) {
    const bw = c.rng.range(0.035, 0.07), bh = c.rng.range(maxH * 0.65, maxH), bd = c.rng.range(0.16, 0.22)
    const lean = c.rng.next() < 0.1 ? 0.18 : 0
    k.mesh(g, k.BX(+bw.toFixed(3), +bh.toFixed(3), +bd.toFixed(3)), k.lit(c.rng.pick(cols), { r: 0.85 }), cx + bw / 2, bh / 2, 0, 0, 0, lean)
    cx += bw + 0.004
  }
}

export function deskLamp(
  c: RoomCtx, p: THREE.Object3D, x: number, y: number, z: number, ry: number, col: string,
  o: { intensity?: number; realtime?: boolean } = {},
): void {
  const k = c.kit
  const g = k.group(p, x, y, z, ry)
  const m = k.lit(col, { r: 0.5 })
  k.mesh(g, k.CY(0.09, 0.1, 0.03, 14), m, 0, 0.015, 0)
  k.mesh(g, k.CY(0.012, 0.012, 0.42, 6), m, 0.04, 0.22, 0, 0, 0, -0.2)
  k.mesh(g, k.CY(0.012, 0.012, 0.32, 6), m, 0.15, 0.48, 0, 0, 0, 1.0)
  k.mesh(g, k.CY(0.04, 0.11, 0.14, 14, true), k.lit(col, { r: 0.5, ds: true }), 0.28, 0.52, 0, 0, 0, 0.5)
  k.mesh(g, k.SP(0.04, 8, 6), k.glow('#FFE2B0', 6), 0.3, 0.48, 0)
  light(c, g, { pos: [0.32, 0.42, 0.05], color: '#FFC27A', intensity: o.intensity ?? 2.2, distance: 2.4, realtime: o.realtime ?? false })
  glowSprite(c, g, 0.3, 0.46, 0.06, 0.55, '#FFC27A', 0.5)
}

export function pendant(c: RoomCtx, x: number, z: number, o: { len?: number; shade?: string; glow?: number } = {}): void {
  const k = c.kit
  const len = o.len ?? 0.55
  k.mesh(c.g, k.CY(0.006, 0.006, len, 4), k.lit('#111111'), x, H - len / 2, z)
  k.mesh(c.g, k.CY(0.06, 0.26, 0.2, 18, true), k.lit(o.shade ?? INK, { r: 0.5, ds: true }), x, H - len - 0.08, z)
  k.mesh(c.g, k.SP(0.06, 10, 6), k.glow('#FFE0B0', o.glow ?? 8), x, H - len - 0.15, z)
  glowSprite(c, c.g, x, H - len - 0.2, z + 0.05, 0.8, '#FFD9A0', 0.35)
}

export function frameOnWall(
  c: RoomCtx, x: number, y: number, z: number, w: number, h: number, rect: UVRect,
  o: { ry?: number; border?: string; lift?: number } = {},
): void {
  const k = c.kit
  const g = k.group(c.g, x, y, z, o.ry ?? 0)
  k.mesh(g, k.RB(w + 0.08, h + 0.08, 0.04, 0.015), k.lit(o.border ?? INK, { r: 0.6 }), 0, 0, 0.02)
  k.mesh(g, k.PL(w, h), k.decal(rect, { r: 0.8, lift: o.lift }), 0, 0, 0.045)
}

export function mug(c: RoomCtx, p: THREE.Object3D, x: number, y: number, z: number, col: string = PAL.cream): void {
  const k = c.kit
  k.mesh(p, k.CY(0.045, 0.04, 0.1, 12), k.lit(col, { r: 0.5 }), x, y + 0.05, z)
  k.mesh(p, k.TO(0.03, 0.009, 4, 10), k.lit(col, { r: 0.5 }), x + 0.05, y + 0.05, z)
}

export function rug(c: RoomCtx, x: number, z: number, w: number, d: number, col: string, round = false): void {
  const k = c.kit
  const m = round
    ? k.mesh(c.g, k.CY(w / 2, w / 2, 0.02, 36), k.lit(col, { r: 0.95 }), x, 0.01, z, 0, 0, 0, [1, 1, d / w])
    : k.mesh(c.g, k.RB(w, 0.02, d, 0.008), k.lit(col, { r: 0.95 }), x, 0.01, z)
  ;(m.userData.piece as { occ: boolean }).occ = false
}

export function shelf(c: RoomCtx, x: number, y: number, z: number, w: number, d = 0.3, col: string = WOOD): void {
  const k = c.kit
  k.mesh(c.g, k.RB(w, 0.045, d, 0.01), k.lit(col, { r: 0.6 }), x, y, z)
  for (const sx of [-1, 1]) k.mesh(c.g, k.BX(0.03, 0.12, d * 0.7), k.lit(INK), x + sx * (w / 2 - 0.12), y - 0.08, z - d * 0.1)
}

/** Static additive glow quad facing the street (fakes bloom in 'low' quality). */
export function glowSprite(c: RoomCtx, p: THREE.Object3D, x: number, y: number, z: number, size: number, color: string, k = 0.5): void {
  c.kit.mesh(p, c.kit.PL(size, size), c.kit.add(c.art.s.soft, color, k), x, y, z)
}

