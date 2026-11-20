/** Web Design Studio: big monitor with a client layout, drawing tablet, swatches, mood board. */
import { D, H } from '../layout'
import { PAL } from '../palette'
import { light, roomSpot, type RoomCtx } from './context'
import { books, chair, desk, glowSprite, monitor, mug, pendant, plant, rug } from './props'

export function buildStudio(c: RoomCtx): void {
  const { kit: k, g, art } = c
  const hw = c.w / 2
  desk(c, -0.3, -3.55, 3.3, 0.85, { top: '#D8C49E' })
  monitor(c, g, -0.55, 0.78, -3.75, 1.5, 0.92, art.s.site, { k: 0.8 })
  monitor(c, g, 0.85, 0.78, -3.7, 0.44, 0.76, art.s.site2, { ry: -0.25, k: 1.2 })
  // drawing tablet (display) angled on the desk
  const tb = k.group(g, -0.55, 0.81, -3.2)
  tb.rotation.x = -1.2
  k.mesh(tb, k.RB(0.66, 0.44, 0.025, 0.02), k.lit('#202128', { r: 0.4 }), 0, 0, 0)
  k.mesh(tb, k.PL(0.58, 0.38), k.screen(art.s.sketch, 0.8), 0, 0, 0.014)
  k.mesh(tb, k.CY(0.007, 0.004, 0.22, 6), k.lit(PAL.orange), 0.22, -0.05, 0.03, 0, 0, 0.8)
  mug(c, g, 0.45, 0.78, -3.2, PAL.lime)
  k.mesh(g, k.CY(0.05, 0.045, 0.12, 12), k.lit(PAL.ink), -1.75, 0.84, -3.35)
  ;[PAL.orange, PAL.turq, PAL.mustard].forEach((col, i) => k.mesh(g, k.CY(0.006, 0.006, 0.18, 4), k.lit(col), -1.75 + (i - 1) * 0.02, 0.95, -3.35, 0, 0, (i - 1) * 0.2))
  const fan = k.group(g, -1.4, 0.79, -3.15, 0.3)
  ;[PAL.pink, PAL.orange, PAL.mustard, PAL.lime, PAL.turq, PAL.sky, PAL.violet].forEach((col, i) => k.mesh(fan, k.BX(0.05, 0.005, 0.26), k.lit(col), 0, 0.003 + i * 0.003, 0, 0, (i - 3) * 0.18, 0))
  chair(c, -0.3, -2.7, -0.15, PAL.lime)
  // palette swatches pinned on the wall
  const sw = [PAL.ink, PAL.cream, PAL.mint, PAL.turq, PAL.mustard, PAL.pink, PAL.violet, PAL.lime, PAL.sky, PAL.orange, PAL.wood, '#141B2D']
  sw.forEach((col, i) => {
    const x = -3.0 + (i % 4) * 0.3, y = 2.7 - Math.floor(i / 4) * 0.36
    k.mesh(g, k.RB(0.24, 0.3, 0.012, 0.01), k.lit('#FBF6E8'), x, y, -D + 0.012)
    k.mesh(g, k.BX(0.2, 0.18, 0.004), k.lit(col, { r: 0.6 }), x, y + 0.035, -D + 0.02)
  })
  // client-demo printouts on a string
  const pts: [number, number, number][] = []
  for (let i = 0; i <= 8; i++) { const t = i / 8; pts.push([0.8 + t * 2.4, 2.75 - Math.sin(t * Math.PI) * 0.12, -D + 0.08]) }
  k.tube(g, pts, 0.005, k.lit(PAL.ink), 24, 4)
  for (let i = 0; i < 4; i++) {
    const t = (i + 0.7) / 4.4, x = 0.8 + t * 2.4, y = 2.75 - Math.sin(t * Math.PI) * 0.12, rz = i % 2 ? 0.05 : -0.04
    k.mesh(g, k.RB(0.42, 0.3, 0.008, 0.01), k.lit('#FBF6E8'), x, y - 0.2, -D + 0.07, 0, 0, rz)
    k.mesh(g, k.BX(0.36, 0.1, 0.004), k.lit([PAL.turq, PAL.orange, PAL.sky, PAL.pink][i]), x, y - 0.14, -D + 0.076, 0, 0, rz)
    k.mesh(g, k.BX(0.03, 0.06, 0.02), k.lit(PAL.wood2), x, y - 0.03, -D + 0.08)
  }
  // mood board on the left wall
  const mb = k.group(g, -hw + 0.01, 1.95, -2.3, Math.PI / 2)
  k.mesh(mb, k.RB(1.5, 1.0, 0.04, 0.02), k.lit('#C29A6B', { r: 0.95 }), 0, 0, 0.02)
  for (let i = 0; i < 7; i++) {
    const col = [PAL.pink, PAL.turq, PAL.cream, PAL.mustard, PAL.sky, PAL.lime, PAL.cream][i]
    k.mesh(mb, k.BX(+c.rng.range(0.22, 0.38).toFixed(2), +c.rng.range(0.2, 0.3).toFixed(2), 0.006), k.lit(col), -0.52 + (i % 4) * 0.34 + c.rng.range(-0.04, 0.04), 0.22 - Math.floor(i / 4) * 0.42 + c.rng.range(-0.04, 0.04), 0.045, 0, 0, c.rng.range(-0.12, 0.12))
  }
  // arc floor lamp
  const al = k.group(g, 2.75, 0, -3.3)
  k.mesh(al, k.CY(0.16, 0.18, 0.05, 16), k.lit(PAL.ink), 0, 0.025, 0)
  k.tube(al, [[0, 0.05, 0], [0, 1.2, 0], [-0.1, 1.85, 0.1], [-0.55, 2.15, 0.35], [-0.95, 1.95, 0.55]], 0.016, k.lit(PAL.ink), 28, 6)
  k.mesh(al, k.CY(0.06, 0.2, 0.18, 16, true), k.lit(PAL.orange, { r: 0.5, ds: true }), -0.97, 1.86, 0.56)
  k.mesh(al, k.SP(0.06, 8, 6), k.glow('#FFE0B0', 7), -0.97, 1.8, 0.56)
  light(c, al, { pos: [-0.97, 1.65, 0.56], color: '#FFC27A', intensity: 4, distance: 3, realtime: true })
  glowSprite(c, al, -0.97, 1.75, 0.7, 0.9, '#FFC27A', 0.4)
  plant(c, -2.9, -3.8, 1.6, { pot: PAL.cream, leaf: '#3F7D55' })
  k.mesh(g, k.RB(0.6, 0.2, 0.42, 0.04), k.lit(PAL.orange), 2.4, 0.1, -1.4, 0, 0.3, 0)
  books(c, g, 2.4, 0.2, -1.4, 0.4, { ry: 0.3, maxH: 0.06 })
  rug(c, -0.3, -2.4, 3.6, 2.0, '#A9B957')
  pendant(c, 1.8, -2.4, { shade: PAL.lime, len: 0.5 })
  roomSpot(c, [-0.4, H - 0.1, -1.4], [-0.4, 0, -3.6], 13)
}
