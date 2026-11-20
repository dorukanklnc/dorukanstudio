/** Street, lamps, trees, mid-ground silhouettes, distant city, moon and clouds. */
import * as THREE from 'three'
import { scaleUV, type Kit } from './kit'
import { COL_X, COLS, OUTSIDE, ROOMS } from './layout'
import type { LightRig } from './lights'
import { PAL } from './palette'
import type { Rng } from './random'
import type { Art } from './textures'

/** Fixed direction the moon is seen in from the default hero camera. */
export const MOON_POS = (() => {
  const cam = new THREE.Vector3(8, 9.6, 38)
  const dir = new THREE.Vector3(0.7, 4.95, -2).sub(cam).normalize()
  dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), -0.31)
  dir.y += 0.17
  return cam.clone().add(dir.normalize().multiplyScalar(520))
})()
export const HERO_EYE = new THREE.Vector3(8, 9.6, 38)

export function buildEnvironment(k: Kit, art: Art, root: THREE.Group, rig: LightRig, rng: Rng): void {
  const ground = k.group(root)
  // sidewalk + curb + street (subdivided so baked lamp pools have vertices to land on)
  k.mesh(ground, k.BX(140, 0.2, 5.0), k.lit('#5B5F6E', { r: 0.95 }), 0, -0.1, 2.3)
  const sw = k.own(new THREE.PlaneGeometry(80, 4.6, 160, 8))
  scaleUV(sw, 80 / 4, 4.6 / 4)
  k.mesh(ground, sw, k.tile(art.t.sidewalk, { r: 0.92 }), 0, 0.003, 2.3, -Math.PI / 2)
  k.mesh(ground, k.BX(140, 0.22, 0.3), k.lit('#8D909C', { r: 0.9 }), 0, -0.09, 4.75)
  const street = k.own(new THREE.PlaneGeometry(80, 16, 120, 20))
  k.mesh(ground, street, k.lit('#151A27', { r: 0.42, m: 0.15 }), 0, -0.2, 12.9, -Math.PI / 2)
  for (const sx of [-1, 1]) k.mesh(ground, k.BX(80, 0.1, 16), k.lit('#151A27', { r: 0.42, m: 0.15 }), sx * 80, -0.25, 12.9)
  for (let i = -18; i < 18; i++) k.mesh(ground, k.BX(2.2, 0.012, 0.14), k.lit('#B9A774', { r: 0.8 }), i * 4.4, -0.19, 10.2)
  k.mesh(ground, k.BX(160, 0.4, 40), k.lit('#121624', { r: 1 }), 0, -0.2, -26)
  k.mesh(ground, k.PL(1400, 700), k.lit('#0C111E', { bake: 1 }), 0, -0.35, -390, -Math.PI / 2)
  // foreground beyond the street (long-lens portrait framings look far down the road)
  k.mesh(ground, k.PL(1400, 600), k.lit('#10141F', { bake: 1 }), 0, -0.3, 320.9, -Math.PI / 2)
  k.mesh(ground, k.BX(160, 0.2, 1.2), k.lit('#5B5F6E', { r: 0.95 }), 0, -0.15, 21.4)
  // street lamps
  for (const sx of [-13, 13]) {
    const lp = k.group(ground, sx, 0, 3.9)
    const pole = k.lit('#1F2433', { m: 0.4, r: 0.5 })
    const hx = -0.82 * Math.sign(sx)
    k.mesh(lp, k.CY(0.12, 0.16, 0.3, 12), pole, 0, 0.15, 0)
    k.mesh(lp, k.CY(0.05, 0.065, 4.4, 10), pole, 0, 2.3, 0)
    k.tube(lp, [[0, 4.4, 0], [0, 4.75, 0], [-0.25 * Math.sign(sx), 4.95, 0], [hx * 0.92, 4.85, 0]], 0.04, pole, 14, 6)
    k.mesh(lp, k.CY(0.12, 0.3, 0.26, 16), pole, hx, 4.72, 0)
    k.mesh(lp, k.CY(0.24, 0.24, 0.02, 16), k.glow('#FFD39A', 5), hx, 4.58, 0)
    k.mesh(lp, k.PL(0.9, 0.9), k.add(art.s.soft, '#FFC88A', 0.22), hx, 4.52, 0.05)
    rig.add(lp, OUTSIDE, { type: 'spot', pos: [hx, 4.5, 0], target: [hx, 0, 0.3], color: '#FFC88A', intensity: 74, angle: 0.62, penumbra: 1 })
    k.mesh(ground, k.PL(0.9, 4.0), k.add(art.s.streak, '#FFC88A', 0.12), sx + hx, -0.185, 4.95 + 2.0, -Math.PI / 2)
  }
  // trees
  const tree = (x: number, z: number, s: number, hue: number): void => {
    const t = k.group(ground, x, 0, z)
    k.mesh(t, k.CY(0.1 * s, 0.16 * s, 1.8 * s, 8), k.lit('#3A2A20'), 0, 0.9 * s, 0)
    const cols = ['#2B4A44', '#335850', '#24413C']
    const crowns: [number, number, number, number][] = [[0, 2.5, 0, 1.25], [-0.6, 2.0, 0.2, 0.85], [0.65, 2.1, -0.1, 0.9], [0.1, 3.2, 0.1, 0.85]]
    crowns.forEach(([cx, cy, cz, r], i) => k.mesh(t, flatIco(k, +(r * s).toFixed(3)), k.lit(cols[(i + hue) % 3], { r: 0.85 }), cx * s, cy * s, cz * s))
    k.mesh(t, k.RB(1.1 * s, 0.12, 1.1 * s, 0.03), k.lit('#3B3F4E'), 0, 0.06, 0)
  }
  tree(-16.4, 2.0, 1.15, 0)
  tree(16.8, 1.8, 1.25, 1)
  tree(-22, 1.2, 0.95, 2)
  tree(23, 1.0, 1.0, 0)
  // bench, hydrant, planters
  const b = k.group(ground, -14.6, 0, 2.6)
  k.mesh(b, k.RB(1.6, 0.06, 0.42, 0.02), k.lit(PAL.wood, { r: 0.7 }), 0, 0.46, 0)
  k.mesh(b, k.RB(1.6, 0.36, 0.06, 0.02), k.lit(PAL.wood, { r: 0.7 }), 0, 0.72, -0.2, -0.15)
  for (const s of [-0.7, 0.7]) k.mesh(b, k.BX(0.06, 0.46, 0.4), k.lit('#1F2433'), s, 0.23, 0)
  const hy = k.group(ground, 14.2, 0, 3.4)
  const yel = k.lit(PAL.mustard, { r: 0.6 })
  k.mesh(hy, k.CY(0.12, 0.14, 0.6, 12), yel, 0, 0.3, 0)
  k.mesh(hy, k.SP(0.13, 12, 6), yel, 0, 0.62, 0)
  k.mesh(hy, k.CY(0.05, 0.05, 0.36, 8), yel, 0, 0.42, 0, 0, 0, Math.PI / 2)
  for (const sx of [-11.6, 11.6]) {
    const p = k.group(ground, sx, 0, 1.0)
    k.mesh(p, k.RB(0.7, 0.5, 0.7, 0.05), k.lit('#3B3F4E', { r: 0.9 }), 0, 0.25, 0)
    k.mesh(p, flatIco(k, 0.42), k.lit('#2F5049', { r: 0.9 }), 0, 0.72, 0)
  }
  // warm light spilling from the ground-floor rooms onto the sidewalk + wet-street streaks
  const tint: Record<string, string> = { saas: '#FFC27A', security: '#8FE0CF', iot: '#FFB870', game: '#FF9AA6' }
  for (const r of ROOMS.filter((x) => x.floor === 0)) {
    const w = COLS[r.col]
    k.mesh(ground, k.own(new THREE.PlaneGeometry(w * 1.05, 2.6)), k.add(art.s.spill, tint[r.id], 0.16), COL_X[r.col], 0.012, 1.75, -Math.PI / 2)
    k.mesh(ground, k.own(new THREE.PlaneGeometry(w * 0.5, 3.6)), k.add(art.s.streak, tint[r.id], 0.075), COL_X[r.col], -0.188, 4.95 + 1.8, -Math.PI / 2)
  }
  buildBackdrop(k, art, root, rng)
}

function flatIco(k: Kit, r: number): THREE.BufferGeometry {
  const g = k.own(new THREE.IcosahedronGeometry(r, 1), true)
  g.deleteAttribute('normal')
  g.computeVertexNormals()
  return g
}

function buildBackdrop(k: Kit, art: Art, root: THREE.Group, rng: Rng): void {
  // mid-ground: low houses and a tree line behind the HQ
  const mid = k.group(root)
  const sil = k.lit('#141A2B', { r: 1 })
  const win = k.glow('#FFC27A', 0.8)
  for (let i = 0; i < 26; i++) {
    const x = -90 + i * 7 + rng.range(-2, 2)
    if (Math.abs(x) < 13) continue
    const w = +rng.range(4, 7).toFixed(2), h = +rng.range(3, 7.5).toFixed(2), d = +rng.range(5, 8).toFixed(2), z = rng.range(-22, -34)
    k.mesh(mid, k.BX(w, h, d), sil, x, h / 2, z)
    if (rng.next() < 0.6) {
      const roof = k.own(new THREE.CylinderGeometry(0.001, w * 0.62, rng.range(1.4, 2.4), 4, 1))
      k.mesh(mid, roof, sil, x, h + 0.7, z, 0, Math.PI / 4, 0, [1, 1, d / w])
    }
    for (let j = 0; j < 3; j++) if (rng.next() < 0.45) k.mesh(mid, k.PL(0.4, 0.55), win, x - w / 2 + 0.9 + (j * (w - 1.8)) / 2, rng.range(1.2, Math.max(1.3, h - 1)), z + d / 2 + 0.02)
  }
  for (let i = 0; i < 40; i++) {
    const x = rng.range(-80, 80)
    if (Math.abs(x) < 12) continue
    const r = +rng.range(1.4, 2.6).toFixed(2)
    k.mesh(mid, flatIco(k, r), sil, x, r * 1.1 + rng.range(0, 1.2), rng.range(-14, -20), 0, 0, 0, [1, rng.range(1.1, 1.5), 1])
  }
  // distant city (unlit lit-window texture, fogged)
  const city = k.tile(art.t.city, { bake: 0.78 })
  const addB = (x: number, z: number, w: number, h: number, d: number): void => {
    const b = k.own(new THREE.BoxGeometry(w, h, d))
    const uv = b.getAttribute('uv') as THREE.BufferAttribute
    const dims: [number, number][] = [[d, h], [d, h], [0, 0], [0, 0], [w, h], [w, h]]
    for (let f = 0; f < 6; f++) for (let q = 0; q < 4; q++) { const i = f * 4 + q; uv.setXY(i, (uv.getX(i) * dims[f][0]) / 9, (uv.getY(i) * dims[f][1]) / 18) }
    k.mesh(mid, b, city, x, h / 2 - 0.3, z)
  }
  for (let i = 0; i < 60; i++) addB(rng.range(-220, 220), rng.range(-120, -170), rng.range(7, 16), rng.range(4, 9), rng.range(6, 12))
  for (let i = 0; i < 60; i++) { const x = rng.range(-340, 340); addB(x, rng.range(-210, -300), rng.range(9, 20), rng.range(7, 15) + (Math.abs(x) > 90 ? rng.range(0, 9) : 0), rng.range(8, 14)) }
  // moon + halo + a thin moonlit cloud band (additive, unfogged)
  const sky = k.group(root)
  const face = (o: THREE.Object3D): void => { o.lookAt(HERO_EYE) }
  const moon = k.group(sky, MOON_POS.x, MOON_POS.y, MOON_POS.z)
  face(moon)
  k.mesh(moon, k.PL(21, 21), k.add(art.s.moon, '#FFF6E2', 0.46), 0, 0, 0)
  k.mesh(moon, k.PL(190, 190), k.add(art.s.halo, '#B8C6F0', 0.2), 0, 0, -3)
  const right = new THREE.Vector3(), up = new THREE.Vector3()
  const m = new THREE.Matrix4().lookAt(HERO_EYE, MOON_POS, new THREE.Vector3(0, 1, 0))
  right.setFromMatrixColumn(m, 0)
  up.setFromMatrixColumn(m, 1)
  const bands: [number, number, number][] = [[-70, -40, 1.0], [-230, -10, 0.8], [90, -80, 0.7]]
  for (const [dx, dy, s] of bands) {
    const c = k.group(sky)
    c.position.copy(MOON_POS).addScaledVector(right, dx).addScaledVector(up, dy)
    face(c)
    for (let i = 0; i < 9; i++) {
      const pw = +(rng.range(26, 38) * s).toFixed(1), ph = +(rng.range(4, 7) * s).toFixed(1)
      k.mesh(c, k.PL(pw, ph), k.add(art.s.soft, '#2F3E66', 0.2), (i - 4) * 8 * s + rng.range(-3, 3), rng.range(-1.5, 1.8) * s, -i * 0.05)
    }
  }
}
