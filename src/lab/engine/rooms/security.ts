/** Smart Office Security control room — the "start here" room with the DK mascot. */
import { D, H } from '../layout'
import { makeMascot } from '../mascot'
import { PAL } from '../palette'
import type { FeedKind } from '../textures'
import { light, roomSpot, type RoomCtx } from './context'
import { books, chair, deskLamp, frameOnWall, glowSprite, monitor, mug, plant, rug } from './props'

export function buildSecurity(c: RoomCtx): void {
  const { kit: k, g, art } = c
  const hw = c.w / 2
  // video wall
  k.mesh(g, k.RB(6.0, 1.56, 0.1, 0.04), k.lit('#121722', { r: 0.5 }), 0, 2.12, -D + 0.06)
  const bezel = k.lit('#0B0E14', { r: 0.4 })
  const scr = (kind: FeedKind | 'alert', x: number, y: number, sw: number, sh: number, kk = 1.3): void => {
    k.mesh(g, k.RB(sw + 0.06, sh + 0.06, 0.06, 0.02), bezel, x, y, -D + 0.13)
    k.mesh(g, k.PL(sw, sh), k.screen(kind === 'alert' ? art.s.alert : art.s.feeds[kind], kk), x, y, -D + 0.165)
  }
  scr('detect', 0, 2.12, 1.72, 1.1, 1.45)
  scr('corridor', -1.4, 2.44, 0.94, 0.56)
  scr('lobby', -1.4, 1.8, 0.94, 0.56)
  scr('office', -2.42, 2.44, 0.94, 0.56)
  scr('stairs', -2.42, 1.8, 0.94, 0.56)
  scr('alert', 1.4, 2.12, 0.94, 1.22, 1.4)
  scr('server', 2.42, 2.44, 0.94, 0.56)
  scr('parking', 2.42, 1.8, 0.94, 0.56)
  k.mesh(g, k.RB(1.04, 1.32, 0.03, 0.02), k.glow(PAL.orange, 1.6), 1.4, 2.12, -D + 0.1)
  glowSprite(c, g, 0, 2.12, -D + 0.3, 3.4, '#7FE0CC', 0.12)
  // the video wall's glow, approximated by three soft teal lights
  for (const x of [-1.9, 0, 1.9]) light(c, g, { pos: [x, 2.0, -D + 0.45], color: '#9FE8D6', intensity: 2.4, distance: 4.6 })
  // console desk
  const dz = -3.42, dw = 4.6
  k.mesh(g, k.RB(dw, 0.07, 0.9, 0.03), k.lit(PAL.wood, { r: 0.5 }), 0, 0.8, dz)
  k.mesh(g, k.RB(dw - 0.12, 0.74, 0.8, 0.03), k.lit('#27304A', { r: 0.7 }), 0, 0.39, dz - 0.03)
  k.mesh(g, k.BX(dw - 0.3, 0.025, 0.01), k.glow(PAL.turq, 1.3), 0, 0.7, dz + 0.375)
  k.mesh(g, k.RB(dw - 0.6, 0.14, 0.22, 0.03), k.lit('#1B2234', { r: 0.6 }), 0, 0.9, dz - 0.3, -0.25)
  for (let i = 0; i < 14; i++) {
    const s = i % 5 === 2 ? k.glow(PAL.orange, 2, 1 + (i % 3)) : i % 3 ? k.lit('#3C4660') : k.glow(PAL.turq, 1.5, 1 + (i % 4))
    k.mesh(g, k.RB(0.07, 0.02, 0.05, 0.008), s, -1.7 + i * 0.26, 0.97, dz - 0.25, -0.25)
  }
  k.mesh(g, k.RB(0.52, 0.03, 0.17, 0.012), k.lit('#1A1C22', { r: 0.5 }), -0.15, 0.85, dz + 0.12)
  k.mesh(g, k.RB(0.07, 0.03, 0.11, 0.02), k.lit('#1A1C22'), 0.25, 0.85, dz + 0.14)
  monitor(c, g, -1.45, 0.83, dz - 0.05, 0.7, 0.43, art.s.nightMap, { ry: 0.22, k: 1.25, stand: 0.1 })
  monitor(c, g, 1.45, 0.83, dz - 0.05, 0.7, 0.43, art.s.log, { ry: -0.22, k: 1.25, stand: 0.1 })
  mug(c, g, 0.62, 0.83, dz + 0.18, PAL.cream)
  k.mesh(g, k.CY(0.046, 0.046, 0.02, 12), k.lit(PAL.pink), 0.62, 0.9, dz + 0.18)
  deskLamp(c, g, -2.05, 0.83, dz - 0.05, 0.2, PAL.mustard, { intensity: 3, realtime: true })
  // alert beacon
  k.mesh(g, k.CY(0.09, 0.1, 0.06, 16), k.lit(PAL.ink), 2.05, 0.86, dz + 0.1)
  k.mesh(g, k.SP(0.085, 14, 10), k.glow(PAL.orange, 3.5), 2.05, 0.92, dz + 0.1, 0, 0, 0, [1, 1.1, 1])
  light(c, g, { pos: [2.05, 1.05, dz + 0.25], color: PAL.orange, intensity: 3.5, distance: 2.6, realtime: true })
  glowSprite(c, g, 2.05, 0.95, dz + 0.2, 0.75, PAL.orange, 0.6)
  // chair + mascot, swivelled toward the street
  const cx = 0.35, cz = -2.4, cry = -0.52, MS = 1.17
  chair(c, cx, cz, cry, '#33405E')
  const dk = makeMascot(c, g)
  dk.position.set(cx + Math.sin(cry) * 0.06, 0.545 + 0.4 * MS, cz + Math.cos(cry) * 0.06)
  dk.rotation.y = cry
  dk.scale.setScalar(MS)
  // filing cabinet, plant, rug
  const fc = k.group(g, -3.0, 0, -3.95)
  k.mesh(fc, k.RB(0.5, 1.1, 0.55, 0.03), k.lit('#5B6A84', { r: 0.5, m: 0.2 }), 0, 0.55, 0)
  for (let i = 0; i < 3; i++) {
    k.mesh(fc, k.BX(0.44, 0.01, 0.01), k.lit(PAL.ink), 0, 0.37 + i * 0.35, 0.28)
    k.mesh(fc, k.RB(0.14, 0.03, 0.03, 0.01), k.lit('#C9C2B0', { m: 0.6, r: 0.3 }), 0, 0.27 + i * 0.35, 0.285)
  }
  books(c, g, -3.0, 1.1, -3.95, 0.4, { maxH: 0.26 })
  plant(c, 3.0, -3.85, 1.25, { pot: PAL.cream })
  rug(c, 0.2, -2.3, 4.0, 2.4, '#2C5652')
  // walls: camera plan + night-mode sign
  frameOnWall(c, -hw + 0.01, 2.05, -1.95, 1.2, 0.86, art.d.blueprint, { ry: Math.PI / 2, border: PAL.cream })
  frameOnWall(c, -hw + 0.01, 2.55, -3.45, 0.7, 0.21, art.d.nightSign, { ry: Math.PI / 2, border: PAL.ink, lift: 0.5 })
  // ceiling strip lamp
  k.mesh(g, k.RB(1.6, 0.06, 0.18, 0.02), k.lit('#2A2622'), 0, H - 0.05, -2.2)
  k.mesh(g, k.BX(1.5, 0.01, 0.1), k.glow('#FFE6C0', 3), 0, H - 0.085, -2.2)
  roomSpot(c, [0, H - 0.1, -1.4], [0, 0, -3.5], 16, { angle: 1.05, color: '#FFC98A', realtime: true, castShadow: true })
  light(c, g, { pos: [-1.6, 1.2, -2.6], color: '#7FDCCB', intensity: 1.6, distance: 3.2 })
}
