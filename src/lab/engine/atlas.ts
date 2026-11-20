/**
 * Canvas texture atlases. Everything painted at runtime ends up in three textures:
 * a shelf-packed decal atlas (lit), a shelf-packed screen atlas (unlit/emissive) and a
 * tile atlas for repeating patterns (wallpaper, planks, brick…) whose slots carry
 * wrapped gutters so the shader can `fract()` inside a slot without visible seams.
 */
import * as THREE from 'three'
import type { Ctx } from './draw'

/** UV rectangle in texture space (v up, matching CanvasTexture.flipY = true). */
export interface UVRect {
  u0: number
  v0: number
  u1: number
  v1: number
}

/** Content area of a tile slot: uv = (u0, v0) + fract(uv) * (du, dv). */
export interface TileRect {
  u0: number
  v0: number
  du: number
  dv: number
}

export type Painter = (g: Ctx, w: number, h: number) => void

function makeCanvas(w: number, h: number): [HTMLCanvasElement, Ctx] {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')
  if (!g) throw new Error('2D canvas unavailable')
  return [c, g]
}

export class ShelfAtlas {
  readonly size: number
  readonly canvas: HTMLCanvasElement
  private readonly g: Ctx
  private readonly pad = 4
  private queue: { w: number; h: number; paint: Painter; out: UVRect }[] = []

  constructor(size: number, background = '#000000') {
    this.size = size
    ;[this.canvas, this.g] = makeCanvas(size, size)
    this.g.fillStyle = background
    this.g.fillRect(0, 0, size, size)
  }

  /** Queues a w×h item; the returned rect is filled in by pack(). */
  add(w: number, h: number, paint: Painter): UVRect {
    const out: UVRect = { u0: 0, v0: 0, u1: 0, v1: 0 }
    this.queue.push({ w: Math.ceil(w), h: Math.ceil(h), paint, out })
    return out
  }

  /** Shelf-packs the queue (tallest first), paints every item and extrudes its edges. */
  pack(): void {
    const items = this.queue.sort((a, b) => b.h - a.h)
    this.queue = []
    const p = this.pad
    const S = this.size
    let x = 0
    let y = 0
    let rowH = 0
    for (const it of items) {
      const { w, h } = it
      if (x + w + p * 2 > S) {
        x = 0
        y += rowH
        rowH = 0
      }
      if (y + h + p * 2 > S) throw new Error('atlas full')
      const [c, g] = makeCanvas(w, h)
      it.paint(g, w, h)
      const ax = x + p
      const ay = y + p
      const G = this.g
      G.drawImage(c, 0, 0, w, 1, ax, ay - p, w, p)
      G.drawImage(c, 0, h - 1, w, 1, ax, ay + h, w, p)
      G.drawImage(c, 0, 0, 1, h, ax - p, ay, p, h)
      G.drawImage(c, w - 1, 0, 1, h, ax + w, ay, p, h)
      G.drawImage(c, ax, ay)
      Object.assign(it.out, { u0: ax / S, u1: (ax + w) / S, v0: 1 - (ay + h) / S, v1: 1 - ay / S })
      x += w + p * 2
      rowH = Math.max(rowH, h + p * 2)
    }
  }
}

export class TileAtlas {
  readonly size: number
  readonly slot: number
  readonly content: number
  readonly canvas: HTMLCanvasElement
  private readonly g: Ctx
  private n = 0

  constructor(size = 2048, slot = 512, gutter = 32) {
    this.size = size
    this.slot = slot
    this.content = slot - gutter * 2
    ;[this.canvas, this.g] = makeCanvas(size, size)
  }

  add(paint: Painter): TileRect {
    const per = this.size / this.slot
    if (this.n >= per * per) throw new Error('tile atlas full')
    const sx = (this.n % per) * this.slot
    const sy = Math.floor(this.n / per) * this.slot
    this.n++
    const C = this.content
    const gut = (this.slot - C) / 2
    const [c, g] = makeCanvas(C, C)
    paint(g, C, C)
    const G = this.g
    G.save()
    G.beginPath()
    G.rect(sx, sy, this.slot, this.slot)
    G.clip()
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) G.drawImage(c, sx + gut + dx * C, sy + gut + dy * C)
    G.restore()
    const S = this.size
    return { u0: (sx + gut) / S, v0: 1 - (sy + gut + C) / S, du: C / S, dv: C / S }
  }
}

export function atlasTexture(canvas: HTMLCanvasElement, anisotropy: number): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(canvas)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = anisotropy
  t.generateMipmaps = true
  t.minFilter = THREE.LinearMipmapLinearFilter
  t.magFilter = THREE.LinearFilter
  return t
}
