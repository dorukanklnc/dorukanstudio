/** 2D canvas helpers shared by the texture painters. */
import { FONT_BODY, PAL } from './palette'
import type { Rng } from './random'

export type Ctx = CanvasRenderingContext2D

export function rrect(g: Ctx, x: number, y: number, w: number, h: number, r: number): void {
  g.beginPath()
  g.roundRect(x, y, w, h, r)
}

export interface TextOpts {
  size?: number
  weight?: number
  color?: string
  font?: string
  align?: CanvasTextAlign
  base?: CanvasTextBaseline
  ls?: number
}

export function setFont(g: Ctx, o: TextOpts): void {
  g.font = `${o.weight ?? 700} ${o.size ?? 20}px ${o.font ?? FONT_BODY}`
  g.letterSpacing = `${o.ls ?? 0}px`
}

export function txt(g: Ctx, s: string, x: number, y: number, o: TextOpts = {}): void {
  setFont(g, o)
  g.fillStyle = o.color ?? PAL.ink
  g.textAlign = o.align ?? 'left'
  g.textBaseline = o.base ?? 'alphabetic'
  g.fillText(s, x, y)
}

/** Largest font size ≤ `size` at which `s` fits in `maxW`. */
export function fitSize(g: Ctx, s: string, maxW: number, o: TextOpts): number {
  let size = o.size ?? 20
  setFont(g, { ...o, size })
  while (g.measureText(s).width > maxW && size > 8) {
    size -= 1
    setFont(g, { ...o, size })
  }
  return size
}

export function noise(g: Ctx, rng: Rng, w: number, h: number, a = 0.05, n = 4000): void {
  for (let i = 0; i < n; i++) {
    g.fillStyle = `rgba(${rng.next() < 0.5 ? '0,0,0' : '255,255,255'},${rng.next() * a})`
    g.fillRect(rng.next() * w, rng.next() * h, 1 + rng.next() * 2, 1 + rng.next() * 2)
  }
}

export function scanlines(g: Ctx, w: number, h: number, a = 0.16, step = 3): void {
  g.fillStyle = `rgba(0,0,0,${a})`
  for (let y = 0; y < h; y += step) g.fillRect(0, y, w, 1)
}

export function iconEnvelope(g: Ctx, cx: number, cy: number, s: number, col: string, lw: number): void {
  g.save()
  g.strokeStyle = col
  g.lineWidth = lw
  g.lineJoin = 'round'
  g.lineCap = 'round'
  rrect(g, cx - s * 0.62, cy - s * 0.42, s * 1.24, s * 0.84, s * 0.12)
  g.stroke()
  g.beginPath()
  g.moveTo(cx - s * 0.56, cy - s * 0.32)
  g.lineTo(cx, cy + s * 0.1)
  g.lineTo(cx + s * 0.56, cy - s * 0.32)
  g.stroke()
  g.restore()
}

export function iconHandset(g: Ctx, cx: number, cy: number, s: number, col: string): void {
  g.save()
  g.translate(cx, cy)
  g.rotate(-Math.PI / 4)
  g.fillStyle = col
  g.strokeStyle = col
  g.lineCap = 'round'
  g.lineWidth = s * 0.22
  g.beginPath()
  g.moveTo(-s * 0.04, -s * 0.44)
  g.quadraticCurveTo(-s * 0.44, 0, -s * 0.04, s * 0.44)
  g.stroke()
  rrect(g, -s * 0.16, -s * 0.62, s * 0.42, s * 0.28, s * 0.11)
  g.fill()
  rrect(g, -s * 0.16, s * 0.34, s * 0.42, s * 0.28, s * 0.11)
  g.fill()
  g.restore()
}

export function iconWaves(g: Ctx, cx: number, cy: number, s: number, col: string, lw: number): void {
  g.save()
  g.strokeStyle = col
  g.lineWidth = lw
  g.lineCap = 'round'
  for (let i = 1; i <= 2; i++) {
    g.beginPath()
    g.arc(cx, cy, s * 0.28 * i, -Math.PI * 0.42, Math.PI * 0.08)
    g.stroke()
  }
  g.restore()
}

/** The DK console glyph (used on the rooftop sign and a framed portrait). */
export function consoleGlyph(g: Ctx, x: number, y: number, s: number, lw: number): void {
  rrect(g, x, y, s, s * 1.4, s * 0.2)
  g.fillStyle = PAL.turq
  g.fill()
  g.strokeStyle = PAL.ink
  g.lineWidth = lw
  g.stroke()
  rrect(g, x + s * 0.16, y + s * 0.16, s * 0.68, s * 0.52, s * 0.09)
  g.fillStyle = PAL.mint
  g.fill()
  g.lineWidth = lw * 0.75
  g.stroke()
  g.fillStyle = PAL.ink
  g.beginPath()
  g.arc(x + s * 0.38, y + s * 0.4, s * 0.055, 0, 7)
  g.arc(x + s * 0.62, y + s * 0.4, s * 0.055, 0, 7)
  g.fill()
  g.lineWidth = lw * 0.6
  g.beginPath()
  g.arc(x + s * 0.5, y + s * 0.46, s * 0.09, 0.2 * Math.PI, 0.8 * Math.PI)
  g.stroke()
  g.strokeStyle = PAL.mustard
  g.lineWidth = lw
  g.lineCap = 'round'
  g.beginPath()
  g.moveTo(x + s * 0.18, y + s * 1.06)
  g.lineTo(x + s * 0.4, y + s * 1.06)
  g.moveTo(x + s * 0.29, y + s * 0.95)
  g.lineTo(x + s * 0.29, y + s * 1.17)
  g.stroke()
  g.fillStyle = PAL.pink
  g.beginPath()
  g.arc(x + s * 0.66, y + s * 1.0, s * 0.075, 0, 7)
  g.fill()
  g.fillStyle = PAL.lime
  g.beginPath()
  g.arc(x + s * 0.8, y + s * 1.14, s * 0.075, 0, 7)
  g.fill()
}
