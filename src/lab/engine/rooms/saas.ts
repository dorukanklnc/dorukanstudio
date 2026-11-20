/** SaaS room split in two products: Summyra Campus (school) | Summyra Panel (hotel). */
import { D } from '../layout'
import { PAL } from '../palette'
import { H } from '../layout'
import { roomSpot, type RoomCtx } from './context'
import { books, chair, desk, monitor, pendant, plant, rug } from './props'

export function buildSaaS(c: RoomCtx): void {
  const { kit: k, g, art } = c
  const hw = c.w / 2, qx = hw / 2
  // divider between the two products
  k.mesh(g, k.RB(0.12, 1.5, 3.0, 0.02), k.lit(PAL.cream, { r: 0.8 }), 0, 0.75, -D + 1.5)
  k.mesh(g, k.RB(0.18, 0.06, 3.05, 0.02), k.lit(PAL.wood, { r: 0.5 }), 0, 1.53, -D + 1.5)
  // ---------- school side
  k.mesh(g, k.RB(2.04, 1.16, 0.06, 0.02), k.lit(PAL.wood, { r: 0.55 }), -qx, 1.98, -D + 0.04)
  k.mesh(g, k.PL(1.92, 1.06), k.decal(art.d.chalk, { r: 0.9, lift: 0.05 }), -qx, 1.98, -D + 0.075)
  k.mesh(g, k.BX(1.9, 0.03, 0.08), k.lit(PAL.wood), -qx, 1.41, -D + 0.08)
  k.mesh(g, k.PL(1.6, 0.27), k.decal(art.d.plateCampus, { r: 0.6, lift: 0.12 }), -qx, 2.82, -D + 0.02)
  desk(c, -qx, -3.35, 1.8, 0.75)
  k.mesh(g, k.RB(1.62, 0.5, 0.04, 0.02), k.lit(PAL.mustard, { r: 0.7 }), -qx, 0.47, -3.02)
  k.mesh(g, k.PL(1.3, 0.22), k.decal(art.d.labelCampus, { r: 0.6, lift: 0.14 }), -qx, 0.5, -2.995)
  monitor(c, g, -qx + 0.3, 0.78, -3.55, 0.72, 0.45, art.s.campus, { ry: -0.08, k: 0.85 })
  books(c, g, -qx - 0.6, 0.78, -3.4, 0.36, { maxH: 0.24, cols: [PAL.mustard, PAL.orange, '#B88A12', PAL.cream] })
  k.mesh(g, k.SP(0.06, 12, 8), k.lit('#D2453F', { r: 0.4 }), -qx - 0.22, 0.84, -3.15)
  k.mesh(g, k.CY(0.006, 0.006, 0.05, 4), k.lit(PAL.wood2), -qx - 0.22, 0.91, -3.15)
  const globe = k.group(g, -qx + 0.85, 0.78, -3.4)
  k.mesh(globe, k.CY(0.07, 0.08, 0.03, 14), k.lit(PAL.ink), 0, 0.015, 0)
  k.mesh(globe, k.CY(0.01, 0.01, 0.14, 6), k.lit(PAL.ink), 0, 0.09, 0)
  k.mesh(globe, k.SP(0.12, 18, 12), k.lit(PAL.sky, { r: 0.5 }), 0, 0.26, 0)
  k.mesh(globe, k.TO(0.135, 0.008, 4, 24, Math.PI), k.lit(PAL.mustard, { m: 0.5, r: 0.4 }), 0, 0.26, 0, 0, 0, 0.4)
  chair(c, -qx + 0.62, -2.75, -0.35, PAL.mustard)
  const pts: [number, number, number][] = []
  for (let i = 0; i <= 8; i++) { const t = i / 8; pts.push([-hw + 0.1 + t * (hw - 0.3), 3.0 - Math.sin(t * Math.PI) * 0.22, -D + 0.12]) }
  k.tube(g, pts, 0.006, k.lit(PAL.ink), 24, 4)
  for (let i = 1; i < 8; i++) {
    const p = pts[i]
    const tri = k.mesh(g, k.CO(0.08, 0.18, 3), k.lit([PAL.mustard, PAL.pink, PAL.sky, PAL.lime][i % 4], { r: 0.8 }), p[0], p[1] - 0.1, p[2], Math.PI, 0, 0, [1, 1, 0.15])
    ;(tri.userData.piece as { occ: boolean }).occ = false
  }
  k.mesh(g, k.RB(0.34, 0.4, 0.18, 0.08), k.lit(PAL.orange, { r: 0.8 }), -hw + 0.45, 0.2, -1.4, 0, 0.5, 0)
  rug(c, -qx, -2.4, 2.6, 1.8, '#C99B2E')
  // ---------- hotel side
  const kr = k.group(g, qx, 1.98, -D + 0.03)
  k.mesh(kr, k.RB(1.5, 0.9, 0.05, 0.02), k.lit(PAL.wood2, { r: 0.6 }), 0, 0, 0)
  const brass = k.lit('#D9B865', { m: 0.7, r: 0.3 })
  for (let r = 0; r < 3; r++) for (let col = 0; col < 5; col++) {
    const x = -0.56 + col * 0.28, y = 0.26 - r * 0.28
    k.mesh(kr, k.CY(0.01, 0.01, 0.06, 6), brass, x, y, 0.05, Math.PI / 2)
    if ((r * 5 + col) % 4 !== 3) {
      k.mesh(kr, k.RB(0.035, 0.1, 0.012, 0.005), brass, x, y - 0.07, 0.065)
      k.mesh(kr, k.RB(0.07, 0.09, 0.012, 0.01), k.lit([PAL.sky, PAL.orange, PAL.cream][(r + col) % 3], { r: 0.7 }), x, y - 0.17, 0.065)
    }
  }
  k.mesh(g, k.PL(1.6, 0.27), k.decal(art.d.platePanel, { r: 0.6, lift: 0.12 }), qx, 2.82, -D + 0.02)
  const rc = k.group(g, qx + 0.05, 0, -2.75)
  k.mesh(rc, k.RB(2.1, 1.02, 0.62, 0.04), k.lit(PAL.sky, { r: 0.55 }), 0, 0.51, 0)
  k.mesh(rc, k.RB(2.2, 0.06, 0.72, 0.02), k.lit(PAL.cream, { r: 0.5 }), 0, 1.04, 0)
  for (const i of [0, 4]) k.mesh(rc, k.BX(0.02, 0.8, 0.01), k.lit('#5B8CC0'), -0.8 + i * 0.4, 0.5, 0.315)
  k.mesh(rc, k.PL(1.3, 0.22), k.decal(art.d.labelPanel, { r: 0.6, lift: 0.14 }), 0, 0.62, 0.322)
  k.mesh(rc, k.CY(0.08, 0.09, 0.025, 16), k.lit(PAL.ink), -0.65, 1.085, 0.12)
  k.mesh(rc, k.SP(0.075, 16, 8), k.lit('#E0B33F', { m: 0.85, r: 0.25 }), -0.65, 1.1, 0.12, 0, 0, 0, [1, 0.8, 1])
  k.mesh(rc, k.SP(0.016, 6, 4), k.lit('#E0B33F', { m: 0.85, r: 0.25 }), -0.65, 1.17, 0.12)
  monitor(c, g, qx + 0.25, 1.07, -2.85, 0.7, 0.44, art.s.hotel, { ry: -0.05, k: 0.85 })
  k.mesh(rc, k.RB(0.32, 0.12, 0.04, 0.01), k.lit(PAL.cream), 0.75, 1.13, 0.2, -0.3)
  plant(c, hw - 0.35, -3.9, 1.1, { pot: PAL.sky })
  const lug = k.group(g, hw - 0.5, 0, -1.35, -0.4)
  k.mesh(lug, k.RB(0.42, 0.62, 0.24, 0.06), k.lit(PAL.orange, { r: 0.6 }), 0, 0.37, 0)
  for (const sx of [-1, 1]) k.mesh(lug, k.BX(0.015, 0.62, 0.25), k.lit('#B9603C'), sx * 0.12, 0.37, 0)
  const steel = k.lit('#888888', { m: 0.8, r: 0.3 })
  k.mesh(lug, k.CY(0.01, 0.01, 0.3, 6), steel, -0.08, 0.82, 0)
  k.mesh(lug, k.CY(0.01, 0.01, 0.3, 6), steel, 0.08, 0.82, 0)
  k.mesh(lug, k.RB(0.2, 0.03, 0.03, 0.01), k.lit(PAL.ink), 0, 0.97, 0)
  for (const sx of [-1, 1]) k.mesh(lug, k.SP(0.03, 6, 4), k.lit(PAL.ink), sx * 0.15, 0.035, 0)
  rug(c, qx, -2.2, 2.6, 2.0, '#4F7DB0')
  pendant(c, -qx, -2.7, { shade: PAL.mustard })
  pendant(c, qx, -2.2, { shade: PAL.sky })
  roomSpot(c, [-qx, H - 0.1, -1.3], [-qx, 0, -3.6], 11, { angle: 0.95 })
  roomSpot(c, [qx, H - 0.1, -1.3], [qx, 0, -3.6], 11, { angle: 0.95, color: '#FFD2A0' })
}
