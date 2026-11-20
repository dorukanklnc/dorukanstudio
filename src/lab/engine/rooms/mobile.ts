/** Mobile apps: RoleBluff (iOS, violet) and Akıl Adası (Android, lime) as giant phones. */
import type { UVRect } from '../atlas'
import { D, H } from '../layout'
import { PAL } from '../palette'
import { roomSpot, type RoomCtx } from './context'
import { glowSprite, plant, rug } from './props'

export function buildMobile(c: RoomCtx): void {
  const { kit: k, g, art } = c
  // plinth
  k.mesh(g, k.RB(2.3, 0.42, 0.95, 0.04), k.lit(PAL.cream, { r: 0.7 }), 0, 0.21, -2.95)
  k.mesh(g, k.BX(2.32, 0.04, 0.97), k.lit(PAL.ink), 0, 0.4, -2.95)
  const phone = (x: number, ry: number, body: string, screen: UVRect, plate: UVRect, bright: number): void => {
    const p = k.group(g, x, 0.42, -3.0, ry)
    k.mesh(p, k.RB(0.6, 0.06, 0.3, 0.02), k.lit(PAL.ink, { r: 0.5 }), 0, 0.03, 0)
    k.mesh(p, k.RB(0.5, 0.5, 0.05, 0.02), k.lit(PAL.ink, { r: 0.5 }), 0, 0.3, -0.12, -0.25)
    const ph = k.group(p, 0, 0.83, -0.02)
    ph.rotation.x = -0.12
    k.mesh(ph, k.RB(0.74, 1.5, 0.08, 0.1, 3), k.lit(body, { r: 0.35 }), 0, 0, 0)
    k.mesh(ph, k.PL(0.64, 1.36), k.screen(screen, bright), 0, 0, 0.042)
    k.mesh(ph, k.RB(0.16, 0.04, 0.01, 0.02), k.lit(PAL.ink), 0, 0.62, 0.046)
    k.mesh(ph, k.RB(0.012, 0.16, 0.04, 0.005), k.lit(body), 0.375, 0.3, 0)
    glowSprite(c, ph, 0, 0, 0.1, 1.6, body, 0.14)
    k.mesh(g, k.PL(0.86, 0.16), k.decal(plate, { r: 0.6, lift: 0.12 }), x, 0.2, -2.95 + 0.492)
  }
  phone(-0.55, 0.18, PAL.violet, art.s.phoneRole, art.d.plateRole, 1.2)
  phone(0.55, -0.18, PAL.lime, art.s.phoneAkil, art.d.plateAkil, 0.92)
  // app-icon wall
  art.d.icons.forEach((rect, i) => k.mesh(g, k.PL(0.3, 0.3), k.decal(rect, { r: 0.6, lift: 0.06 }), -0.85 + (i % 3) * 0.4 + (i > 2 ? 0.2 : 0), 2.5 - Math.floor(i / 3) * 0.38, -D + 0.02))
  k.mesh(g, k.RB(0.6, 0.04, 0.2, 0.01), k.lit(PAL.wood), 0.95, 2.25, -D + 0.1)
  plant(c, 1.0, -4.0, 0.8, { pot: PAL.violet, leaf: '#5E9F5A' })
  k.mesh(g, k.CY(0.17, 0.15, 0.45, 16), k.lit(PAL.violet, { r: 0.7 }), -1.15, 0.225, -1.4)
  k.mesh(g, k.TO(0.12, 0.012, 4, 24), k.lit(PAL.cream), -0.6, 0.012, -1.6, Math.PI / 2)
  rug(c, 0, -2.1, 2.6, 2.4, '#9DB54A')
  // track spots
  k.mesh(g, k.BX(2.2, 0.04, 0.06), k.lit(PAL.ink), 0, H - 0.03, -1.6)
  for (const x of [-0.55, 0.55]) {
    k.mesh(g, k.CY(0.05, 0.07, 0.16, 12), k.lit(PAL.ink), x, H - 0.13, -1.6, 0.6)
    k.mesh(g, k.CY(0.05, 0.05, 0.01, 12), k.glow('#FFE6C0', 4), x, H - 0.2, -1.55, 0.6)
  }
  roomSpot(c, [0, H - 0.15, -1.4], [0, 0.9, -3.0], 11, { angle: 0.8, color: '#FFD7A8' })
}
