/** Game Zone: Tiny Siege Wars arcade cabinet, shelf with a tiny castle + catapult. */
import * as THREE from 'three'
import { D, H } from '../layout'
import { PAL } from '../palette'
import { light, roomSpot, type RoomCtx } from './context'
import { frameOnWall, glowSprite, rug, shelf } from './props'

export function buildGame(c: RoomCtx): void {
  const { kit: k, g, art } = c
  const hw = c.w / 2
  // arcade cabinet: extruded side profile
  const prof = new THREE.Shape()
  const P: [number, number][] = [[0, 0], [0.62, 0], [0.62, 0.92], [0.84, 1.02], [0.84, 1.1], [0.58, 1.16], [0.48, 1.7], [0.68, 1.76], [0.68, 1.98], [0, 1.98]]
  prof.moveTo(P[0][0], P[0][1])
  for (const p of P.slice(1)) prof.lineTo(p[0], p[1])
  const cabG = k.own(new THREE.ExtrudeGeometry(prof, { depth: 0.78, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 1 }), true)
  const cab = k.group(g, -0.45, 0, -3.95, 0.28)
  k.mesh(cab, cabG, k.lit(PAL.pink, { r: 0.55 }), 0.39, 0, 0, 0, -Math.PI / 2, 0)
  const stripe = k.own(new THREE.ExtrudeGeometry(prof, { depth: 0.01, bevelEnabled: false }))
  k.mesh(cab, stripe, k.lit(PAL.ink, { r: 0.5 }), 0.4, 0, 0, 0, -Math.PI / 2, 0, [0.82, 0.82, 1])
  k.mesh(cab, k.PL(0.58, 0.48), k.screen(art.s.arcade, 1.5), 0, 1.432, 0.556, -0.183)
  k.mesh(cab, k.PL(0.72, 0.19), k.screen(art.s.marquee, 1.6), 0, 1.87, 0.702)
  k.mesh(cab, k.BX(0.3, 0.42, 0.01), k.lit(PAL.ink), 0, 0.4, 0.642)
  k.mesh(cab, k.RB(0.12, 0.06, 0.012, 0.01), k.glow(PAL.orange, 1.8), 0, 0.5, 0.65)
  k.mesh(cab, k.CY(0.012, 0.012, 0.1, 6), k.lit(PAL.ink), -0.18, 1.17, 0.74)
  k.mesh(cab, k.SP(0.035, 10, 6), k.lit('#D2453F', { r: 0.4 }), -0.18, 1.23, 0.74)
  ;([[PAL.mustard, 0.02], [PAL.turq, 0.11], [PAL.lime, 0.2]] as [string, number][]).forEach(([col, x]) => k.mesh(cab, k.CY(0.025, 0.025, 0.02, 12), k.lit(col, { r: 0.4 }), x, 1.135, 0.73))
  glowSprite(c, cab, 0, 1.45, 0.75, 1.1, '#BFD8FF', 0.3)
  light(c, g, { pos: [-0.2, 1.6, -2.55], color: '#CFE6FF', intensity: 1.1, distance: 2.4, realtime: true })
  // shelf: tiny castle + catapult
  const sy = 1.6, sz = -D + 0.2
  shelf(c, 0.75, sy, sz, 1.5, 0.36)
  const cs = k.group(g, 0.95, sy + 0.025, sz, -0.25)
  k.mesh(cs, k.RB(0.6, 0.04, 0.3, 0.01), k.lit('#6E9B5F'), 0, 0.02, 0)
  const stone = k.lit('#D8D0BD', { r: 0.85 })
  k.mesh(cs, k.BX(0.4, 0.16, 0.03), stone, 0, 0.12, 0.1)
  k.mesh(cs, k.BX(0.03, 0.16, 0.22), stone, -0.2, 0.12, 0)
  k.mesh(cs, k.BX(0.03, 0.16, 0.22), stone, 0.2, 0.12, 0)
  k.mesh(cs, k.BX(0.4, 0.16, 0.03), stone, 0, 0.12, -0.1)
  for (let i = 0; i < 7; i++) k.mesh(cs, k.BX(0.03, 0.03, 0.03), stone, -0.18 + i * 0.06, 0.215, 0.1)
  for (const [tx, tz] of [[-0.2, 0.1], [0.2, 0.1], [-0.2, -0.1], [0.2, -0.1]]) {
    k.mesh(cs, k.CY(0.05, 0.055, 0.26, 12), stone, tx, 0.17, tz)
    k.mesh(cs, k.CO(0.065, 0.12, 12), k.lit(tx < 0 ? PAL.pink : PAL.violet, { r: 0.6 }), tx, 0.36, tz)
  }
  k.mesh(cs, k.CY(0.035, 0.035, 0.03, 12), k.lit(PAL.ink), 0, 0.08, 0.115, Math.PI / 2)
  k.mesh(cs, k.CY(0.003, 0.003, 0.14, 4), k.lit(PAL.ink), -0.2, 0.48, 0.1)
  k.mesh(cs, k.BX(0.06, 0.035, 0.004), k.lit(PAL.mustard), -0.17, 0.53, 0.1)
  const cp = k.group(g, 0.25, sy + 0.025, sz + 0.02, 0.5)
  const wd = k.lit(PAL.wood, { r: 0.7 })
  k.mesh(cp, k.BX(0.2, 0.02, 0.14), wd, 0, 0.02, 0)
  for (const z2 of [-0.06, 0.06]) {
    k.mesh(cp, k.BX(0.015, 0.12, 0.015), wd, -0.02, 0.09, z2, 0, 0, 0.3)
    k.mesh(cp, k.BX(0.015, 0.12, 0.015), wd, 0.04, 0.09, z2, 0, 0, -0.3)
  }
  k.mesh(cp, k.CY(0.008, 0.008, 0.14, 6), wd, 0.01, 0.13, 0, Math.PI / 2)
  k.mesh(cp, k.BX(0.2, 0.012, 0.015), wd, -0.06, 0.18, 0, 0, 0, 0.75)
  k.mesh(cp, k.SP(0.025, 8, 6), wd, -0.13, 0.25, 0)
  for (const sx of [-0.08, 0.08]) for (const z2 of [-0.075, 0.075]) k.mesh(cp, k.CY(0.022, 0.022, 0.01, 10), k.lit(PAL.wood2), sx, 0.02, z2, Math.PI / 2)
  // second shelf: cartridges + trophy
  shelf(c, 0.75, 2.3, sz, 1.5, 0.3)
  for (let i = 0; i < 6; i++) k.mesh(g, k.RB(0.1, 0.13, 0.03, 0.01), k.lit([PAL.turq, PAL.mustard, PAL.pink, PAL.lime, PAL.sky, PAL.violet][i], { r: 0.6 }), 0.2 + i * 0.12, 2.39, sz + 0.02, 0, 0, i === 5 ? 0.3 : 0)
  const gold = k.lit(PAL.mustard, { m: 0.9, r: 0.25 })
  k.mesh(g, k.CY(0.07, 0.04, 0.12, 12), gold, 1.25, 2.43, sz)
  k.mesh(g, k.CY(0.03, 0.05, 0.06, 10), gold, 1.25, 2.355, sz)
  frameOnWall(c, hw - 0.01, 1.9, -2.3, 0.6, 0.84, art.d.posterGame, { ry: -Math.PI / 2 })
  // bean bag + controller
  k.mesh(g, k.SP(0.42, 18, 12), k.lit(PAL.mustard, { r: 0.85 }), 0.6, 0.27, -1.7, 0, 0, 0, [1.05, 0.62, 1])
  k.mesh(g, k.SP(0.3, 16, 10), k.lit(PAL.mustard, { r: 0.85 }), 0.72, 0.5, -1.9, 0.3, 0, 0, [1.0, 0.85, 0.6])
  const ctl = k.group(g, 0.5, 0.55, -1.55, 0.4)
  k.mesh(ctl, k.RB(0.2, 0.04, 0.1, 0.02), k.lit(PAL.ink), 0, 0, 0)
  k.mesh(ctl, k.SP(0.012, 6, 4), k.glow(PAL.pink, 2), 0.06, 0.025, 0)
  rug(c, 0.2, -2.0, 2.4, 2.4, '#B4505E', true)
  // string lights along the ceiling edge
  const sl: [number, number, number][] = []
  for (let i = 0; i <= 10; i++) { const t = i / 10; sl.push([-hw + 0.15 + t * (c.w - 0.3), H - 0.12 - Math.sin(t * Math.PI) * 0.18, -D + 0.25]) }
  k.tube(g, sl, 0.006, k.lit(PAL.ink), 32, 4)
  for (let i = 1; i < 10; i++) { const p = sl[i]; k.mesh(g, k.SP(0.025, 6, 4), k.glow([PAL.mustard, PAL.pink, PAL.turq, PAL.cream][i % 4], 3), p[0], p[1] - 0.035, p[2]) }
  roomSpot(c, [0.2, H - 0.1, -1.0], [0.1, 0, -3.5], 8.5, { angle: 0.95, color: '#FFC28A' })
}
