/** AI Lab: multi-agent whiteboard, server racks with blinking LEDs, glowing orb sculpture. */
import * as THREE from 'three'
import { D, H } from '../layout'
import { PAL } from '../palette'
import { light, roomSpot, type RoomCtx } from './context'
import { chair, desk, frameOnWall, glowSprite, monitor, mug, pendant, plant, rug } from './props'

export function buildAI(c: RoomCtx): void {
  const { kit: k, g, art } = c
  const hw = c.w / 2
  // whiteboard
  const wb = k.group(g, -1.2, 1.95, -D + 0.03)
  const alu = k.lit('#C9CED3', { r: 0.35, m: 0.5 })
  k.mesh(wb, k.RB(2.7, 1.5, 0.05, 0.02), alu, 0, 0, 0)
  k.mesh(wb, k.PL(2.6, 1.42), k.decal(art.d.whiteboard, { r: 0.35, lift: 0.08 }), 0, 0, 0.03)
  k.mesh(wb, k.RB(1.2, 0.04, 0.09, 0.01), alu, 0.4, -0.75, 0.05)
  ;[PAL.turq, PAL.pink, PAL.ink].forEach((col, i) => k.mesh(wb, k.CY(0.012, 0.012, 0.12, 6), k.lit(col), 0.1 + i * 0.16, -0.72, 0.06, 0, 0, Math.PI / 2))
  // desk + laptop + monitor
  desk(c, -1.2, -3.55, 2.3, 0.75)
  const lap = k.group(g, -1.6, 0.78, -3.45, 0.15)
  const alu2 = k.lit('#B8BCC6', { m: 0.6, r: 0.35 })
  k.mesh(lap, k.RB(0.5, 0.025, 0.34, 0.01), alu2, 0, 0.012, 0)
  const lid = k.group(lap, 0, 0.02, -0.16)
  lid.rotation.x = -0.32
  k.mesh(lid, k.RB(0.5, 0.34, 0.02, 0.01), alu2, 0, 0.17, 0)
  k.mesh(lid, k.PL(0.45, 0.29), k.screen(art.s.code, 1.3), 0, 0.17, 0.012)
  monitor(c, g, -0.65, 0.78, -3.75, 0.72, 0.44, art.s.code, { ry: -0.12 })
  mug(c, g, -2.1, 0.78, -3.3, PAL.violet)
  chair(c, -1.25, -2.75, 0.25, '#2E3550')
  // server racks with LEDs (blink phases 1–3)
  const rackBody = k.lit('#1C2130', { r: 0.5, m: 0.3 })
  const rackFace = k.lit('#0D1018', { r: 0.4 })
  const unit = k.lit('#262C3C', { r: 0.4, m: 0.4 })
  const dark = k.lit('#3A4256')
  for (const rx of [2.05, 2.85]) {
    const r = k.group(g, rx, 0, -3.95)
    k.mesh(r, k.RB(0.74, 2.35, 0.82, 0.03), rackBody, 0, 1.175, 0)
    k.mesh(r, k.BX(0.62, 2.15, 0.01), rackFace, 0, 1.17, 0.415)
    for (let u = 0; u < 10; u++) {
      const y = 0.25 + u * 0.205
      k.mesh(r, k.BX(0.58, 0.17, 0.012), unit, 0, y, 0.42)
      for (let i = 0; i < 6; i++) {
        const on = c.rng.next(), ph = 1 + Math.floor(c.rng.next() * 3)
        const s = on < 0.45 ? k.glow(PAL.turq, 2.6, ph) : on < 0.65 ? k.glow(PAL.lime, 2.4, ph) : on < 0.75 ? k.glow(PAL.mustard, 2.6, ph) : dark
        k.mesh(r, k.BX(0.025, 0.018, 0.01), s, -0.24 + i * 0.035, y + 0.03, 0.43)
      }
      k.mesh(r, k.BX(0.22, 0.012, 0.006), k.lit('#4A5370'), 0.14, y - 0.03, 0.43)
    }
  }
  light(c, g, { pos: [2.45, 1.4, -3.2], color: '#86D4C4', intensity: 1.6, distance: 2.6 })
  k.tube(g, [[2.0, 2.35, -4.1], [1.8, 2.9, -4.2], [0.8, 3.1, -4.25], [-0.6, 3.12, -4.28]], 0.025, k.lit(PAL.pink, { r: 0.6 }), 20, 6)
  k.tube(g, [[2.9, 2.35, -4.0], [2.6, 3.0, -4.15], [1.2, 3.14, -4.2]], 0.025, k.lit(PAL.mustard, { r: 0.6 }), 20, 6)
  // the orb
  const ox = 0.7, oz = -2.55
  k.mesh(g, k.CY(0.3, 0.36, 0.86, 24), k.lit(PAL.cream, { r: 0.6 }), ox, 0.43, oz)
  k.mesh(g, k.CY(0.33, 0.33, 0.04, 24), k.lit(PAL.ink), ox, 0.88, oz)
  k.mesh(g, k.SP(0.26, 24, 16), k.glow('#9BF0DD', 1.55), ox, 1.32, oz)
  const rings = k.group(g, ox, 1.32, oz)
  rings.userData.dynamic = 'rings'
  k.mesh(rings, k.TO(0.55, 0.012, 6, 56), k.glow(PAL.turq, 1.8), 0, 0, 0, 1.2, 0.3, 0)
  k.mesh(rings, k.TO(0.62, 0.008, 6, 56), k.glow(PAL.mustard, 1.6), 0, 0, 0, 1.9, -0.6, 0.4)
  c.dyn.rings = rings
  c.dyn.cage = { anchor: g, center: new THREE.Vector3(ox, 1.32, oz), radius: 0.42, room: c.index }
  light(c, g, { pos: [ox, 1.35, oz + 0.2], color: '#7FE6D0', intensity: 7, distance: 4.2, realtime: true })
  glowSprite(c, g, ox, 1.32, oz + 0.45, 1.7, '#86D4C4', 0.3)
  // poster, plant, rug, lamp
  frameOnWall(c, -hw + 0.01, 1.95, -1.9, 0.62, 0.86, art.d.posterAi, { ry: Math.PI / 2 })
  plant(c, -2.9, -1.15, 1.35, { pot: PAL.ink })
  rug(c, 0.2, -2.5, 3.4, 2.2, '#4B3F72')
  pendant(c, -1.2, -2.8, { shade: PAL.violet })
  roomSpot(c, [-0.8, H - 0.1, -1.4], [-0.6, 0, -3.6], 15)
}
