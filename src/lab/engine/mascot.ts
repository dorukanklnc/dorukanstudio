/**
 * The DK console mascot, built from primitives: rounded turquoise body, mint screen face,
 * cartridge slot, yellow D-pad, pink + green buttons, "DK" on its left side and thin
 * pale-blue tube limbs. Seated pose; the raised left arm is a separate pivot so it can wave.
 */
import type * as THREE from 'three'
import { PAL } from './palette'
import type { RoomCtx } from './rooms/context'

export function makeMascot(c: RoomCtx, parent: THREE.Object3D): THREE.Group {
  const k = c.kit
  const m = k.group(parent)
  const bw = 0.62, bh = 0.8, bd = 0.27, F = bd / 2
  const limb = k.lit('#A9CCEB', { r: 0.45 })
  const cream = k.lit(PAL.cream, { r: 0.6 })
  k.mesh(m, k.RB(bw, bh, bd, 0.1, 3), k.lit(PAL.turq, { r: 0.42 }), 0, 0, 0)
  k.mesh(m, k.RB(0.52, 0.42, 0.03, 0.06, 2), k.lit(PAL.turq2, { r: 0.5 }), 0, 0.15, F - 0.004)
  k.mesh(m, k.PL(0.45, 0.35), k.screen(c.art.s.face, 0.92), 0, 0.15, F + 0.013)
  k.mesh(m, k.RB(0.32, 0.036, 0.02, 0.012), k.lit(PAL.ink), 0, -0.1, F + 0.004)
  const yel = k.lit(PAL.mustard, { r: 0.45 })
  k.mesh(m, k.RB(0.14, 0.045, 0.034, 0.014), yel, -0.15, -0.245, F + 0.01)
  k.mesh(m, k.RB(0.045, 0.14, 0.034, 0.014), yel, -0.15, -0.245, F + 0.01)
  k.mesh(m, k.CY(0.04, 0.04, 0.034, 18), k.lit(PAL.pink, { r: 0.4 }), 0.12, -0.2, F + 0.008, Math.PI / 2)
  k.mesh(m, k.CY(0.04, 0.04, 0.034, 18), k.lit('#7FC25A', { r: 0.4 }), 0.215, -0.275, F + 0.008, Math.PI / 2)
  // "DK" on the mascot's left side (+x)
  k.mesh(m, k.PL(0.2, 0.15), k.decal(c.art.d.dk, { r: 0.42 }), bw / 2 + 0.003, 0.2, 0, 0, Math.PI / 2, 0)
  const r = 0.03
  for (const sx of [-1, 1]) {
    k.tube(m, [[sx * 0.15, -0.36, 0.02], [sx * 0.17, -0.42, 0.2], [sx * 0.18, -0.44, 0.38], [sx * 0.19, -0.66, 0.42], [sx * 0.2, -0.86, 0.44]], r, limb, 16, 6)
    k.mesh(m, k.SP(0.075, 12, 8), cream, sx * 0.2, -0.88, 0.48, 0, 0, 0, [1, 0.6, 1.45])
  }
  // resting right arm, hand on the knee
  k.tube(m, [[-0.3, 0.0, 0], [-0.42, -0.14, 0.08], [-0.4, -0.26, 0.24], [-0.33, -0.3, 0.34]], r, limb, 12, 6)
  k.mesh(m, k.SP(0.06, 12, 8), cream, -0.32, -0.3, 0.37)
  // waving left arm on its own pivot at the shoulder
  const arm = k.group(m, 0.3, 0.02, 0)
  arm.userData.dynamic = 'arm'
  k.tube(arm, [[0, 0, 0], [0.12, 0.08, 0.04], [0.2, 0.26, 0.08], [0.23, 0.44, 0.1]], r, limb, 12, 6)
  k.mesh(arm, k.SP(0.06, 12, 8), cream, 0.235, 0.48, 0.1)
  c.dyn.arm = arm
  return m
}
