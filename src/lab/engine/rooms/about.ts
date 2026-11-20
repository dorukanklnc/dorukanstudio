/** About / CV: armchair, bookshelf, diploma, floor lamp and a CONTACT mailbox. */
import { D, H } from '../layout'
import { PAL } from '../palette'
import { light, roomSpot, type RoomCtx } from './context'
import { books, frameOnWall, glowSprite, mug, rug } from './props'

export function buildAbout(c: RoomCtx): void {
  const { kit: k, g, art } = c
  const hw = c.w / 2
  // wainscot
  k.mesh(g, k.BX(c.w, 1.0, 0.03), k.lit(PAL.wood2, { r: 0.7 }), 0, 0.5, -D + 0.015)
  k.mesh(g, k.BX(c.w, 0.05, 0.05), k.lit(PAL.wood, { r: 0.6 }), 0, 1.02, -D + 0.025)
  for (const s of [-1, 1]) k.mesh(g, k.BX(0.03, 1.0, D), k.lit(PAL.wood2, { r: 0.7 }), s * (hw - 0.015), 0.5, -D / 2)
  // bookshelf (open front)
  const bs = k.group(g, -1.0, 0, -D + 0.28)
  const cw = k.lit('#6A4225', { r: 0.7 })
  for (const sx of [-1, 1]) k.mesh(bs, k.RB(0.05, 2.35, 0.46, 0.012), cw, sx * 0.475, 1.175, 0)
  k.mesh(bs, k.RB(1.0, 0.06, 0.48, 0.015), cw, 0, 2.33, 0)
  k.mesh(bs, k.BX(0.92, 2.28, 0.02), k.lit('#3E2716'), 0, 1.15, -0.21)
  for (let i = 0; i < 5; i++) {
    const y = 0.1 + i * 0.45
    k.mesh(bs, k.BX(0.9, 0.04, 0.42), k.lit('#8A5A34'), 0, y, 0)
    if (i < 4) books(c, bs, 0, y + 0.02, 0.02, 0.84, { maxH: 0.36 })
  }
  // armchair
  const ac = k.group(g, 0.35, 0, -2.55, -0.45)
  const up = k.lit(PAL.orange, { r: 0.9 })
  k.mesh(ac, k.RB(0.84, 0.3, 0.78, 0.1, 2), up, 0, 0.3, 0)
  k.mesh(ac, k.RB(0.84, 0.78, 0.22, 0.1, 2), up, 0, 0.75, -0.32, -0.1)
  for (const s of [-1, 1]) k.mesh(ac, k.RB(0.18, 0.42, 0.78, 0.08, 2), up, s * 0.39, 0.5, 0)
  k.mesh(ac, k.RB(0.56, 0.12, 0.56, 0.06, 2), k.lit('#F09A70', { r: 0.9 }), 0, 0.5, 0.06)
  for (const s of [-1, 1]) for (const t of [-1, 1]) k.mesh(ac, k.CY(0.025, 0.018, 0.16, 6), k.lit(PAL.ink), s * 0.34, 0.08, t * 0.3)
  // floor lamp
  const fl = k.group(g, 1.15, 0, -3.5)
  k.mesh(fl, k.CY(0.15, 0.17, 0.04, 16), k.lit(PAL.ink), 0, 0.02, 0)
  k.mesh(fl, k.CY(0.014, 0.014, 1.55, 6), k.lit(PAL.ink), 0, 0.8, 0)
  k.mesh(fl, k.CY(0.17, 0.24, 0.32, 20, true), k.lit('#F2E3C2', { r: 0.8, ds: true, lift: '#E8A35A' }), 0, 1.66, 0)
  k.mesh(fl, k.SP(0.06, 8, 6), k.glow('#FFE0B0', 7), 0, 1.6, 0)
  light(c, fl, { pos: [0, 1.5, 0.1], color: '#FFB766', intensity: 5, distance: 3.2, realtime: true })
  glowSprite(c, fl, 0, 1.62, 0.3, 1.1, '#FFC27A', 0.45)
  // side table, mug, book
  k.mesh(g, k.CY(0.2, 0.2, 0.03, 20), k.lit(PAL.wood, { r: 0.5 }), 1.05, 0.55, -2.25)
  k.mesh(g, k.CY(0.025, 0.025, 0.54, 6), k.lit(PAL.ink), 1.05, 0.27, -2.25)
  k.mesh(g, k.CY(0.14, 0.16, 0.02, 16), k.lit(PAL.ink), 1.05, 0.01, -2.25)
  mug(c, g, 1.0, 0.565, -2.2, PAL.turq)
  k.mesh(g, k.RB(0.2, 0.04, 0.14, 0.01), k.lit(PAL.violet), 1.12, 0.585, -2.32, 0, 0.4, 0)
  // diploma + DK portrait
  frameOnWall(c, 0.62, 2.05, -D + 0.01, 0.62, 0.45, art.d.diploma, { border: PAL.wood2 })
  frameOnWall(c, 0.55, 1.45, -D + 0.04, 0.26, 0.31, art.d.portrait, { border: PAL.ink })
  // mailbox
  const mx = k.group(g, 1.18, 0, -1.05, -0.5)
  k.mesh(mx, k.BX(0.08, 0.86, 0.08), k.lit(PAL.wood2), 0, 0.43, 0)
  const pink = k.lit(PAL.pink, { r: 0.5 })
  k.mesh(mx, k.RB(0.28, 0.22, 0.5, 0.03), pink, 0, 0.97, 0)
  k.mesh(mx, k.CY(0.14, 0.14, 0.5, 16), pink, 0, 1.08, 0, Math.PI / 2)
  k.mesh(mx, k.BX(0.02, 0.22, 0.04), k.lit(PAL.mustard), 0.15, 1.18, -0.1)
  k.mesh(mx, k.BX(0.02, 0.06, 0.12), k.lit(PAL.mustard), 0.15, 1.27, -0.06)
  k.mesh(mx, k.RB(0.2, 0.02, 0.14, 0.004), k.lit(PAL.cream), 0, 1.15, 0.27, -0.6, 0, 0.1)
  k.mesh(mx, k.PL(0.24, 0.06), k.decal(art.d.contact, { r: 0.6 }), 0.142, 1.0, 0.05, 0, Math.PI / 2, 0)
  rug(c, 0.4, -2.3, 2.4, 2.2, '#C46A44', true)
  roomSpot(c, [0, H - 0.1, -1.0], [0.2, 0, -3.4], 8, { angle: 0.95 })
}
