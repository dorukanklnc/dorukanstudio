/** IoT workshop: pegboard, workbench with the RFID attendance reader, a little turnstile. */
import * as THREE from 'three'
import { D, H } from '../layout'
import { scaleUV } from '../kit'
import { PAL } from '../palette'
import { light, roomSpot, type RoomCtx } from './context'
import { deskLamp, glowSprite, pendant, rug } from './props'

export function buildIoT(c: RoomCtx): void {
  const { kit: k, g, art } = c
  const peg = k.own(new THREE.PlaneGeometry(2.7, 1.25, 12, 6))
  scaleUV(peg, 2.7 / 1.2, 1.25 / 1.2)
  k.mesh(g, peg, k.tile(art.t.peg, { r: 0.9 }), -0.1, 1.85, -D + 0.02)
  k.mesh(g, k.BX(2.76, 1.3, 0.015), k.lit(PAL.wood2), -0.1, 1.85, -D + 0.008)
  const tool = k.lit('#B9BEC8', { m: 0.7, r: 0.35 })
  k.mesh(g, k.RB(0.05, 0.42, 0.02, 0.01), tool, -1.0, 1.95, -D + 0.05, 0, 0, 0.1)
  k.mesh(g, k.TO(0.06, 0.018, 4, 14), tool, -1.02, 2.18, -D + 0.05)
  k.mesh(g, k.RB(0.04, 0.3, 0.02, 0.01), k.lit(PAL.orange), -0.7, 2.0, -D + 0.05)
  k.mesh(g, k.CY(0.008, 0.008, 0.2, 4), tool, -0.7, 1.75, -D + 0.05)
  k.mesh(g, k.RB(0.04, 0.3, 0.02, 0.01), k.lit(PAL.mustard), -0.5, 2.0, -D + 0.05)
  k.mesh(g, k.CY(0.008, 0.008, 0.2, 4), tool, -0.5, 1.75, -D + 0.05)
  k.mesh(g, k.TO(0.16, 0.025, 6, 24), k.lit(PAL.pink, { r: 0.6 }), 0.05, 2.0, -D + 0.07)
  k.mesh(g, k.TO(0.12, 0.022, 6, 24), k.lit(PAL.sky, { r: 0.6 }), 0.45, 1.98, -D + 0.07)
  k.mesh(g, k.RB(0.3, 0.2, 0.06, 0.02), k.lit(PAL.mustard), 0.85, 2.15, -D + 0.06)
  k.mesh(g, k.CY(0.05, 0.05, 0.02, 12), k.lit(PAL.ink), 0.85, 2.17, -D + 0.1, Math.PI / 2)
  for (let i = 0; i < 4; i++) k.mesh(g, k.RB(0.16, 0.1, 0.12, 0.02), k.lit([PAL.turq, PAL.orange, PAL.lime, PAL.sky][i], { r: 0.7 }), -0.95 + i * 0.22, 1.42, -D + 0.08)
  // workbench
  const bz = -3.6, bx = -0.35, bw = 2.3
  k.mesh(g, k.RB(bw, 0.09, 0.85, 0.02), k.lit('#C08A55', { r: 0.6 }), bx, 0.86, bz)
  const leg = k.lit('#3A3E48', { m: 0.5, r: 0.4 })
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) k.mesh(g, k.BX(0.06, 0.82, 0.06), leg, bx + sx * (bw / 2 - 0.08), 0.41, bz + sz * 0.34)
  k.mesh(g, k.RB(bw - 0.1, 0.04, 0.75, 0.01), k.lit('#8C6440'), bx, 0.22, bz)
  for (let i = 0; i < 4; i++) k.mesh(g, k.RB(0.38, 0.22, 0.42, 0.03), k.lit([PAL.sky, PAL.mustard, PAL.pink, PAL.turq][i], { r: 0.7 }), bx - 0.8 + i * 0.52, 0.36, bz + 0.04)
  // RFID reader + card
  const rf = k.group(g, bx + 0.45, 0.905, bz + 0.12, -0.25)
  k.mesh(rf, k.RB(0.42, 0.07, 0.3, 0.03), k.lit('#22262F', { r: 0.4 }), 0, 0.035, 0)
  k.mesh(rf, k.PL(0.18, 0.1), k.screen(art.s.rfid, 1.0), -0.09, 0.072, -0.04, -Math.PI / 2)
  k.mesh(rf, k.CY(0.075, 0.075, 0.01, 24), k.glow(PAL.turq, 1.25), 0.11, 0.073, 0)
  k.mesh(rf, k.TO(0.085, 0.007, 4, 28), k.lit(PAL.mint), 0.11, 0.074, 0, Math.PI / 2)
  k.mesh(rf, k.SP(0.014, 6, 4), k.glow('#7CFF9A', 4), -0.17, 0.075, 0.1)
  const card = k.group(rf, 0.12, 0.2, 0.02)
  card.rotation.set(-0.5, 0.3, 0.12)
  k.mesh(card, k.RB(0.17, 0.11, 0.008, 0.012), k.lit(PAL.cream, { r: 0.5 }), 0, 0, 0)
  k.mesh(card, k.BX(0.17, 0.025, 0.002), k.lit(PAL.turq2), 0, 0.03, 0.005)
  light(c, g, { pos: [bx + 0.55, 1.15, bz + 0.2], color: '#7FE6D0', intensity: 1.2, distance: 1.6, realtime: true })
  glowSprite(c, g, bx + 0.5, 1.0, bz + 0.3, 0.6, '#7FE6D0', 0.45)
  // microcontroller, breadboard, wires
  k.mesh(g, k.RB(0.3, 0.02, 0.2, 0.005), k.lit('#2F7A4E', { r: 0.5 }), bx - 0.35, 0.92, bz + 0.1)
  for (let i = 0; i < 3; i++) k.mesh(g, k.BX(0.05, 0.02, 0.05), k.lit('#15171C'), bx - 0.45 + i * 0.09, 0.94, bz + 0.1)
  k.mesh(g, k.RB(0.34, 0.03, 0.14, 0.005), k.lit('#F2EEE2'), bx - 0.75, 0.92, bz + 0.15)
  ;([[PAL.pink, 0], [PAL.mustard, 0.04], [PAL.sky, 0.08], [PAL.lime, 0.12]] as [string, number][]).forEach(([col, o]) =>
    k.tube(g, [[bx - 0.62, 0.94, bz + 0.12 + o * 0.3], [bx - 0.4, 1.05 + o, bz + 0.25], [bx, 1.0 + o * 0.5, bz + 0.2], [bx + 0.27, 0.94, bz + 0.08 + o * 0.4]], 0.007, k.lit(col, { r: 0.5 }), 16, 4))
  k.mesh(g, k.CY(0.05, 0.06, 0.03, 12), k.lit(PAL.ink), bx - 0.95, 0.92, bz - 0.2)
  k.tube(g, [[bx - 0.95, 0.93, bz - 0.2], [bx - 0.95, 1.05, bz - 0.15], [bx - 0.9, 1.14, bz - 0.08]], 0.03, k.lit('#E8D9C0'), 6, 6)
  k.mesh(g, k.RB(0.16, 0.05, 0.26, 0.02), k.lit(PAL.mustard, { r: 0.6 }), bx - 1.0, 0.93, bz + 0.2, 0, 0.2, 0)
  deskLamp(c, g, bx + 0.95, 0.905, bz - 0.15, Math.PI - 0.3, PAL.orange, { intensity: 2.5 })
  // turnstile
  const ts = k.group(g, 0.95, 0, -1.55)
  k.mesh(ts, k.RB(0.34, 0.98, 0.62, 0.04), k.lit('#AEB4BE', { m: 0.6, r: 0.3 }), 0, 0.49, 0)
  k.mesh(ts, k.RB(0.36, 0.04, 0.64, 0.015), k.lit(PAL.ink), 0, 0.99, 0)
  k.mesh(ts, k.RB(0.2, 0.012, 0.12, 0.01), k.glow('#7CFF9A', 2.2), 0, 1.017, 0.16)
  k.mesh(ts, k.RB(0.16, 0.012, 0.12, 0.02), k.glow(PAL.turq, 1.1), 0, 1.017, -0.12)
  const hub = k.group(ts, -0.19, 0.82, 0)
  const chrome = k.lit('#D9DDE3', { m: 0.85, r: 0.2 })
  k.mesh(hub, k.CY(0.07, 0.07, 0.08, 14), k.lit('#C9CED6', { m: 0.8, r: 0.25 }), -0.04, 0, 0, 0, 0, Math.PI / 2)
  for (let i = 0; i < 3; i++) {
    const arm = k.group(hub, -0.06, 0, 0)
    arm.rotation.x = (i / 3) * Math.PI * 2 + 0.5
    arm.rotation.z = -0.62
    k.mesh(arm, k.CY(0.022, 0.022, 0.52, 10), chrome, 0, 0.27, 0)
  }
  k.mesh(g, k.BX(0.05, 0.004, 1.2), k.lit(PAL.mustard), 0.4, 0.004, -1.55)
  // stool, rug, lamps
  k.mesh(g, k.CY(0.18, 0.18, 0.05, 16), k.lit(PAL.orange), bx + 0.1, 0.62, bz + 0.85)
  k.mesh(g, k.CY(0.025, 0.04, 0.6, 8), k.lit('#3A3E48', { m: 0.5 }), bx + 0.1, 0.3, bz + 0.85)
  k.mesh(g, k.TO(0.14, 0.012, 4, 20), k.lit('#3A3E48', { m: 0.5 }), bx + 0.1, 0.18, bz + 0.85, Math.PI / 2)
  rug(c, -0.2, -2.3, 2.6, 1.8, '#4E5D60')
  pendant(c, -0.35, -3.2, { shade: PAL.orange, len: 0.8 })
  roomSpot(c, [0, H - 0.1, -1.0], [-0.3, 0, -3.6], 10, { angle: 0.95 })
}

