/**
 * Every runtime-painted texture of the HQ, packed into three atlases.
 * Content rule: nothing that looks like real data (no times, scores, IDs, counts).
 */
import { ShelfAtlas, TileAtlas, type TileRect, type UVRect } from './atlas'
import {
  consoleGlyph,
  fitSize,
  iconEnvelope,
  iconHandset,
  iconWaves,
  noise,
  rrect,
  scanlines,
  txt,
  type Ctx,
} from './draw'
import { FONT_DISPLAY, FONT_MONO, PAL } from './palette'
import { createRng, type Rng } from './random'
import { ROOMS } from './layout'
import type { RoomId } from './types'

export type TileKey =
  | 'planks'
  | 'wallSchool'
  | 'wallHotel'
  | 'wallSecurity'
  | 'wallIot'
  | 'wallGame'
  | 'wallStudio'
  | 'wallAi'
  | 'wallMobile'
  | 'wallAbout'
  | 'brick'
  | 'peg'
  | 'sidewalk'
  | 'city'

export interface Art {
  decal: ShelfAtlas
  screen: ShelfAtlas
  tiles: TileAtlas
  t: Record<TileKey, TileRect>
  d: {
    whiteboard: UVRect
    chalk: UVRect
    posterGame: UVRect
    posterAi: UVRect
    diploma: UVRect
    portrait: UVRect
    blueprint: UVRect
    plateCampus: UVRect
    platePanel: UVRect
    labelCampus: UVRect
    labelPanel: UVRect
    plateRole: UVRect
    plateAkil: UVRect
    contact: UVRect
    dk: UVRect
    sign: UVRect
    nightSign: UVRect
    icons: UVRect[]
    nameplates: Record<RoomId, UVRect>
  }
  s: {
    face: UVRect
    feeds: Record<FeedKind, UVRect>
    alert: UVRect
    nightMap: UVRect
    log: UVRect
    code: UVRect
    campus: UVRect
    hotel: UVRect
    arcade: UVRect
    marquee: UVRect
    phoneRole: UVRect
    phoneAkil: UVRect
    site: UVRect
    site2: UVRect
    sketch: UVRect
    rfid: UVRect
    soft: UVRect
    moon: UVRect
    halo: UVRect
    spill: UVRect
    streak: UVRect
  }
}

export type FeedKind = 'detect' | 'corridor' | 'lobby' | 'office' | 'stairs' | 'server' | 'parking'

/* ------------------------------------------------------------------ tiles */
function wallPainter(rng: Rng, base: string, kind: string, c2: string, c3: string) {
  return (g: Ctx, w: number, h: number): void => {
    g.fillStyle = base
    g.fillRect(0, 0, w, h)
    g.fillStyle = c2
    g.strokeStyle = c2
    const u = w / 8 // pattern unit (8 per tile, so the pattern wraps)
    if (kind === 'stripes') {
      for (let x = 0; x < w; x += u) g.fillRect(x, 0, u * 0.34, h)
      g.fillStyle = c3
      for (let x = u / 2; x < w; x += u) g.fillRect(x + u * 0.15, 0, 2, h)
    } else if (kind === 'dots') {
      const s = u / 2
      for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) if ((i + j) % 2 === 0) {
        g.beginPath()
        g.arc(i * s + s / 2, j * s + s / 2, s * 0.1, 0, 7)
        g.fill()
      }
    } else if (kind === 'grid') {
      g.lineWidth = 1.5
      for (let i = 0; i <= 16; i++) {
        const x = (i * w) / 16
        g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke()
        g.beginPath(); g.moveTo(0, x); g.lineTo(w, x); g.stroke()
      }
      g.lineWidth = 3
      g.strokeStyle = c3
      for (let i = 0; i <= 4; i++) {
        const x = (i * w) / 4
        g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke()
        g.beginPath(); g.moveTo(0, x); g.lineTo(w, x); g.stroke()
      }
    } else if (kind === 'diamond') {
      g.lineWidth = 2
      for (let j = -1; j <= 8; j++) for (let i = -1; i <= 8; i++) {
        const x = i * u, y = j * u
        g.beginPath(); g.moveTo(x, y - u * 0.38); g.lineTo(x + u * 0.31, y); g.lineTo(x, y + u * 0.38); g.lineTo(x - u * 0.31, y); g.closePath(); g.stroke()
      }
      g.fillStyle = c3
      for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) { g.beginPath(); g.arc(i * u + u / 2, j * u + u / 2, 2.6, 0, 7); g.fill() }
    } else if (kind === 'pixel') {
      for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) if ((i + j) % 2 === 0) g.fillRect(i * u + u * 0.38, j * u + u * 0.38, u * 0.24, u * 0.24)
      g.fillStyle = c3
      for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) if ((i + j) % 2 === 1) g.fillRect(i * u + u * 0.44, j * u + u * 0.44, u * 0.12, u * 0.12)
    } else if (kind === 'sprig') {
      for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) {
        g.save()
        g.translate(i * u + ((j % 2) * u) / 2 + u * 0.25, j * u + u * 0.3)
        g.rotate(0.5)
        g.beginPath(); g.ellipse(0, 0, u * 0.05, u * 0.13, 0, 0, 7); g.fill()
        g.beginPath(); g.ellipse(u * 0.11, u * 0.06, u * 0.05, u * 0.11, 0.8, 0, 7); g.fill()
        g.restore()
      }
    } else if (kind === 'peg') {
      const s = u / 2
      for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) { g.beginPath(); g.arc(i * s + s / 2, j * s + s / 2, s * 0.13, 0, 7); g.fill() }
    } else if (kind === 'brick') {
      const bh = h / 16, bw = w / 6
      g.fillStyle = c2
      g.fillRect(0, 0, w, h)
      for (let r = 0; r < 16; r++) for (let i = -1; i < 7; i++) {
        const x = i * bw + (r % 2) * (bw / 2)
        g.fillStyle = rng.next() < 0.25 ? c3 : base
        g.fillRect(x + 3, r * bh + 3, bw - 6, bh - 6)
      }
    }
    noise(g, rng, w, h, 0.05, 2200)
  }
}

function paintPlanks(rng: Rng) {
  return (g: Ctx, w: number, h: number): void => {
    g.fillStyle = '#4A2E1A'
    g.fillRect(0, 0, w, h)
    const rows = 6, ph = h / rows
    const cols = ['#8E5D35', '#9C6A3E', '#83552F', '#A87542', '#93623A', '#7C4F2C']
    for (let r = 0; r < rows; r++) {
      let x = -rng.next() * w * 0.4
      while (x < w) {
        const L = w * (0.3 + rng.next() * 0.4)
        const c = rng.pick(cols)
        for (const off of [0, -w, w]) {
          g.fillStyle = c
          g.fillRect(x + off + 2, r * ph + 2, L - 4, ph - 4)
          g.globalAlpha = 0.12
          g.strokeStyle = '#3B2414'
          g.lineWidth = 1.2
          for (let k = 0; k < 4; k++) {
            const yy = r * ph + 8 + rng.next() * (ph - 16)
            g.beginPath(); g.moveTo(x + off + 6, yy); g.bezierCurveTo(x + off + L * 0.3, yy + 3, x + off + L * 0.7, yy - 3, x + off + L - 6, yy); g.stroke()
          }
          g.globalAlpha = 1
        }
        x += L
      }
    }
  }
}

function paintSidewalk(rng: Rng) {
  return (g: Ctx, w: number, h: number): void => {
    g.fillStyle = '#7A7E8C'
    g.fillRect(0, 0, w, h)
    g.strokeStyle = 'rgba(30,30,40,0.5)'
    g.lineWidth = 3
    for (let i = 0; i <= 2; i++) { g.beginPath(); g.moveTo((i * w) / 2, 0); g.lineTo((i * w) / 2, h); g.stroke() }
    for (let i = 0; i <= 2; i++) { g.beginPath(); g.moveTo(0, (i * h) / 2); g.lineTo(w, (i * h) / 2); g.stroke() }
    noise(g, rng, w, h, 0.08, 1500)
  }
}

function paintCity(rng: Rng) {
  return (g: Ctx, w: number, h: number): void => {
    g.fillStyle = '#0E1424'
    g.fillRect(0, 0, w, h)
    for (let y = 6; y < h; y += 16) for (let x = 6; x < w; x += 12) {
      const r = rng.next()
      if (r < 0.045) {
        g.fillStyle = `rgba(255,${190 + Math.floor(rng.next() * 40)},${110 + Math.floor(rng.next() * 50)},${0.35 + rng.next() * 0.65})`
        g.fillRect(x, y, 6, 9)
      } else if (r < 0.052) {
        g.fillStyle = `rgba(160,210,230,${0.2 + rng.next() * 0.3})`
        g.fillRect(x, y, 6, 9)
      }
    }
  }
}

/* ------------------------------------------------------------------ screens */
function feedPainter(rng: Rng, kind: FeedKind, label: string) {
  return (g: Ctx, w: number, h: number): void => {
    const bg = g.createLinearGradient(0, 0, 0, h)
    bg.addColorStop(0, '#16403B')
    bg.addColorStop(1, '#0C2724')
    g.fillStyle = bg
    g.fillRect(0, 0, w, h)
    const L = 'rgba(200,245,225,0.55)', F = 'rgba(200,245,225,0.16)'
    g.strokeStyle = L
    g.fillStyle = F
    g.lineWidth = 2
    if (kind === 'corridor') {
      const ix = [w * 0.42, w * 0.62], iy = [h * 0.3, h * 0.64]
      g.beginPath()
      g.moveTo(0, 0); g.lineTo(ix[0], iy[0]); g.moveTo(w, 0); g.lineTo(ix[1], iy[0])
      g.moveTo(0, h); g.lineTo(ix[0], iy[1]); g.moveTo(w, h); g.lineTo(ix[1], iy[1])
      g.stroke()
      g.strokeRect(ix[0], iy[0], ix[1] - ix[0], iy[1] - iy[0])
      g.fillRect(w * 0.48, h * 0.38, w * 0.08, h * 0.26)
      for (let i = 0; i < 4; i++) {
        const t = i / 4
        g.fillStyle = 'rgba(230,255,240,0.55)'
        g.beginPath(); g.ellipse(w * 0.52, h * 0.06 + t * (iy[0] - h * 0.06) * 0.9, 26 * (1 - t * 0.8), 4 * (1 - t * 0.7), 0, 0, 7); g.fill()
      }
    } else if (kind === 'office') {
      g.beginPath(); g.moveTo(0, h * 0.6); g.lineTo(w, h * 0.55); g.stroke()
      for (let i = 0; i < 3; i++) {
        const x = w * (0.12 + i * 0.3)
        g.fillRect(x, h * 0.52, w * 0.2, h * 0.08); g.strokeRect(x, h * 0.52, w * 0.2, h * 0.08)
        g.fillRect(x + w * 0.05, h * 0.36, w * 0.1, h * 0.14); g.strokeRect(x + w * 0.05, h * 0.36, w * 0.1, h * 0.14)
      }
    } else if (kind === 'parking') {
      g.beginPath()
      for (let i = 0; i < 7; i++) { g.moveTo(w * (0.05 + i * 0.15), h * 0.92); g.lineTo(w * (0.2 + i * 0.1), h * 0.55) }
      g.moveTo(0, h * 0.55); g.lineTo(w, h * 0.55)
      g.stroke()
      g.fillRect(w * 0.3, h * 0.58, w * 0.22, h * 0.16)
      g.fillStyle = 'rgba(200,245,225,0.12)'
      g.fillRect(w * 0.7, h * 0.08, w * 0.3, h * 0.47)
    } else if (kind === 'server') {
      for (let i = 0; i < 4; i++) {
        const x = w * (0.08 + i * 0.23)
        g.fillStyle = F
        g.fillRect(x, h * 0.16, w * 0.17, h * 0.72); g.strokeRect(x, h * 0.16, w * 0.17, h * 0.72)
        for (let j = 0; j < 9; j++) {
          g.fillStyle = rng.next() < 0.5 ? 'rgba(220,255,235,0.85)' : 'rgba(200,245,225,0.3)'
          g.fillRect(x + 8, h * 0.2 + j * 17, 6, 4)
          g.fillRect(x + 20, h * 0.2 + j * 17, 30, 3)
        }
      }
    } else if (kind === 'stairs') {
      g.beginPath()
      for (let i = 0; i < 9; i++) { const x = w * 0.15 + i * 26, y = h * 0.86 - i * 18; g.moveTo(x, y); g.lineTo(x + 26, y); g.lineTo(x + 26, y - 18) }
      g.stroke()
      g.fillRect(w * 0.78, h * 0.2, w * 0.14, h * 0.55); g.strokeRect(w * 0.78, h * 0.2, w * 0.14, h * 0.55)
    } else if (kind === 'lobby') {
      g.beginPath(); g.moveTo(0, h * 0.7); g.lineTo(w, h * 0.66); g.stroke()
      rrect(g, w * 0.2, h * 0.48, w * 0.45, h * 0.2, 6); g.fill(); g.stroke()
      g.fillStyle = 'rgba(200,245,225,0.1)'
      g.fillRect(w * 0.72, h * 0.12, w * 0.2, h * 0.56); g.strokeRect(w * 0.72, h * 0.12, w * 0.2, h * 0.56)
    } else {
      // detect: an unfamiliar face caught in a face-detection box
      g.beginPath(); g.moveTo(0, h * 0.8); g.lineTo(w, h * 0.76); g.stroke()
      g.fillStyle = 'rgba(200,245,225,0.08)'
      g.fillRect(w * 0.06, h * 0.12, w * 0.24, h * 0.66); g.strokeRect(w * 0.06, h * 0.12, w * 0.24, h * 0.66)
      const px = w * 0.58, hy = h * 0.4
      const pg = g.createLinearGradient(0, hy - 40, 0, h)
      pg.addColorStop(0, 'rgba(235,255,245,0.95)')
      pg.addColorStop(1, 'rgba(200,245,225,0.55)')
      g.fillStyle = pg
      g.beginPath(); g.ellipse(px, hy, 30, 37, 0, 0, 7); g.fill()
      rrect(g, px - 58, hy + 44, 116, 110, 34); g.fill()
      // face box
      const bx = px - 46, by = hy - 52, bw = 92, bh = 104
      g.strokeStyle = PAL.orange
      g.lineWidth = 3
      g.strokeRect(bx, by, bw, bh)
      g.lineWidth = 7
      const c = 16
      g.beginPath()
      g.moveTo(bx, by + c); g.lineTo(bx, by); g.lineTo(bx + c, by)
      g.moveTo(bx + bw - c, by); g.lineTo(bx + bw, by); g.lineTo(bx + bw, by + c)
      g.moveTo(bx, by + bh - c); g.lineTo(bx, by + bh); g.lineTo(bx + c, by + bh)
      g.moveTo(bx + bw - c, by + bh); g.lineTo(bx + bw, by + bh); g.lineTo(bx + bw, by + bh - c)
      g.stroke()
      g.fillStyle = PAL.orange
      g.fillRect(bx - 1.5, by - 24, 130, 24)
      txt(g, 'UNKNOWN FACE', bx + 6, by - 7, { size: 14, weight: 600, font: FONT_MONO, color: PAL.ink })
    }
    scanlines(g, w, h)
    noise(g, rng, w, h, 0.1, 900)
    const v = g.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, w * 0.68)
    v.addColorStop(0, 'rgba(0,0,0,0)')
    v.addColorStop(1, 'rgba(0,0,0,0.6)')
    g.fillStyle = v
    g.fillRect(0, 0, w, h)
    txt(g, label, 14, 28, { size: 16, weight: 600, font: FONT_MONO, color: 'rgba(223,242,226,0.92)' })
    g.fillStyle = PAL.orange
    g.beginPath(); g.arc(w - 58, 22, 6, 0, 7); g.fill()
    txt(g, 'REC', w - 46, 28, { size: 15, weight: 600, font: FONT_MONO, color: 'rgba(223,242,226,0.92)' })
    if (kind === 'detect') {
      rrect(g, w - 132, h - 36, 118, 24, 6)
      g.fillStyle = 'rgba(232,132,90,0.95)'
      g.fill()
      txt(g, 'NIGHT MODE', w - 122, h - 18, { size: 13, weight: 600, font: FONT_MONO, color: PAL.ink })
    }
  }
}

function paintAlert(g: Ctx, w: number, h: number): void {
  const bg = g.createLinearGradient(0, 0, 0, h)
  bg.addColorStop(0, '#2A1F1B')
  bg.addColorStop(1, '#1A1513')
  g.fillStyle = bg
  g.fillRect(0, 0, w, h)
  g.fillStyle = PAL.orange
  g.fillRect(0, 0, w, 56)
  txt(g, 'ALERT', 16, 26, { size: 21, weight: 700, font: FONT_DISPLAY, color: PAL.ink, ls: 1 })
  txt(g, 'UNFAMILIAR FACE', 16, 47, { size: 13, weight: 600, font: FONT_MONO, color: PAL.ink })
  txt(g, 'CAM 03 · OFFICE', 16, 80, { size: 13, weight: 500, font: FONT_MONO, color: 'rgba(246,238,217,0.7)' })
  const tile = (y: number, label: string, sub: string, icon: (x: number, y: number) => void): void => {
    rrect(g, 14, y, w - 28, 128, 16)
    g.fillStyle = 'rgba(232,132,90,0.12)'
    g.fill()
    g.strokeStyle = PAL.orange
    g.lineWidth = 4
    g.stroke()
    icon(66, y + 64)
    txt(g, label, 122, y + 58, { size: 23, weight: 700, font: FONT_DISPLAY, color: PAL.cream })
    txt(g, sub, 122, y + 86, { size: 13.5, weight: 500, font: FONT_MONO, color: PAL.orange })
  }
  tile(96, 'EMAIL', 'alert sent', (x, y) => iconEnvelope(g, x, y, 62, PAL.orange, 8))
  tile(238, 'CALL', 'calling owner', (x, y) => {
    iconHandset(g, x - 4, y + 6, 46, PAL.orange)
    iconWaves(g, x + 14, y - 12, 44, PAL.orange, 6)
  })
  scanlines(g, w, h, 0.18)
}

function paintNightMap(g: Ctx, w: number, h: number): void {
  g.fillStyle = '#0F1E33'
  g.fillRect(0, 0, w, h)
  g.strokeStyle = 'rgba(134,212,196,0.9)'
  g.lineWidth = 3
  g.strokeRect(20, 34, w - 40, h - 54)
  g.lineWidth = 2
  g.beginPath()
  g.moveTo(130, 34); g.lineTo(130, 110); g.moveTo(20, 110); g.lineTo(200, 110); g.moveTo(200, 70); g.lineTo(200, h - 20)
  g.stroke()
  const cams: [number, number, boolean][] = [[44, 58, false], [170, 60, false], [250, 86, true], [70, 140, false], [240, 160, false]]
  for (const [x, y, on] of cams) {
    g.fillStyle = on ? PAL.orange : PAL.turq
    g.beginPath(); g.arc(x, y, on ? 8 : 6, 0, 7); g.fill()
    if (on) { g.strokeStyle = 'rgba(232,132,90,0.6)'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 16, 0, 7); g.stroke() }
  }
  txt(g, 'NIGHT MODE · ARMED', 20, 24, { size: 14, weight: 600, font: FONT_MONO, color: PAL.mint })
}

function paintLog(g: Ctx, w: number, h: number): void {
  g.fillStyle = '#121A26'
  g.fillRect(0, 0, w, h)
  txt(g, 'events', 16, 26, { size: 14, weight: 600, font: FONT_MONO, color: PAL.turq })
  const rows: [string, string][] = [['cam03 motion', PAL.mint], ['face check', PAL.mustard], ['UNKNOWN FACE', PAL.orange], ['→ email alert', PAL.orange], ['→ phone call', PAL.orange]]
  rows.forEach(([t, c], i) => {
    g.fillStyle = 'rgba(246,238,217,0.35)'
    g.fillRect(16, 50 + i * 28, 8, 8)
    txt(g, t, 34, 58 + i * 28, { size: 14, weight: 600, font: FONT_MONO, color: c })
  })
}

function paintCode(rng: Rng) {
  return (g: Ctx, w: number, h: number): void => {
    g.fillStyle = '#16141F'
    g.fillRect(0, 0, w, h)
    g.fillStyle = '#221F2E'
    g.fillRect(0, 0, w, 20)
    ;[PAL.pink, PAL.mustard, PAL.lime].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(12 + i * 13, 10, 4, 0, 7); g.fill() })
    const cols = [PAL.turq, PAL.mustard, PAL.pink, PAL.cream, PAL.violet, PAL.lime]
    for (let i = 0; i < 12; i++) {
      let x = 16 + (i % 4 === 0 ? 0 : 18 * (1 + (i % 3 === 0 ? 1 : 0)))
      const y = 34 + i * 13.5
      const n = 1 + Math.floor(rng.next() * 4)
      for (let k = 0; k < n; k++) {
        const ww = 14 + rng.next() * 60
        g.fillStyle = rng.pick(cols)
        g.globalAlpha = 0.85
        g.fillRect(x, y, ww, 6)
        x += ww + 7
      }
      g.globalAlpha = 1
    }
  }
}

function paintCampus(g: Ctx, w: number, h: number): void {
  g.fillStyle = '#FBF5E4'
  g.fillRect(0, 0, w, h)
  g.fillStyle = PAL.mustard
  g.fillRect(0, 0, w, 50)
  txt(g, 'Summyra Campus', 18, 34, { size: 24, weight: 800, color: PAL.ink })
  g.fillStyle = '#EFE3C0'
  g.fillRect(0, 50, 84, h - 50)
  for (let i = 0; i < 5; i++) { g.fillStyle = i === 1 ? PAL.mustard : 'rgba(31,26,23,0.25)'; rrect(g, 14, 70 + i * 36, 56, 18, 5); g.fill() }
  const card = (x: number, y: number, label: string, fill: number): void => {
    rrect(g, x, y, 112, 74, 10); g.fillStyle = '#fff'; g.fill(); g.strokeStyle = PAL.ink; g.lineWidth = 3; g.stroke()
    txt(g, label, x + 12, y + 26, { size: 14, weight: 700, color: '#6b5d4f' })
    rrect(g, x + 12, y + 42, 88, 12, 6); g.fillStyle = 'rgba(31,26,23,0.12)'; g.fill()
    rrect(g, x + 12, y + 42, 88 * fill, 12, 6); g.fillStyle = PAL.mustard; g.fill()
  }
  card(100, 66, 'Students', 0.7)
  card(224, 66, 'Attendance', 0.85)
  card(348, 66, 'Classes', 0.55)
  rrect(g, 100, 156, 360, 128, 10); g.fillStyle = '#fff'; g.fill(); g.strokeStyle = PAL.ink; g.lineWidth = 3; g.stroke()
  for (let i = 0; i < 9; i++) { const bh = 30 + Math.abs(Math.sin(i * 1.3)) * 60; g.fillStyle = i === 6 ? PAL.orange : PAL.mustard; rrect(g, 120 + i * 37, 270 - bh, 22, bh, 4); g.fill() }
}

function paintHotel(g: Ctx, w: number, h: number): void {
  g.fillStyle = '#F1F6FB'
  g.fillRect(0, 0, w, h)
  g.fillStyle = PAL.sky
  g.fillRect(0, 0, w, 50)
  txt(g, 'Summyra Panel', 18, 34, { size: 24, weight: 800, color: PAL.ink })
  const days = 8, rows = 6, gx = 60, gy = 84, cw = (w - gx - 16) / days, ch = 33
  for (let d = 0; d < days; d++) txt(g, ['M', 'T', 'W', 'T', 'F', 'S', 'S', 'M'][d], gx + d * cw + cw / 2, 74, { size: 14, weight: 700, color: '#5A6B7E', align: 'center' })
  g.strokeStyle = 'rgba(31,26,23,0.12)'
  g.lineWidth = 1.5
  for (let r = 0; r < rows; r++) {
    rrect(g, 16, gy + r * ch + 11, 30, 10, 5); g.fillStyle = 'rgba(58,70,86,0.35)'; g.fill()
    g.beginPath(); g.moveTo(gx, gy + r * ch); g.lineTo(w - 16, gy + r * ch); g.stroke()
  }
  const bars: [number, number, number, string][] = [[0, 0, 3, PAL.sky], [0, 4, 3, PAL.orange], [1, 1, 4, PAL.lime], [2, 0, 2, PAL.violet], [2, 3, 5, PAL.sky], [3, 2, 3, PAL.mustard], [4, 0, 6, PAL.sky], [5, 1, 2, PAL.pink], [5, 4, 4, PAL.lime]]
  for (const [r, s, l, c] of bars) { rrect(g, gx + s * cw + 3, gy + r * ch + 6, l * cw - 6, ch - 12, 7); g.fillStyle = c; g.fill(); g.strokeStyle = PAL.ink; g.lineWidth = 2.5; g.stroke() }
}

function paintArcade(rng: Rng) {
  return (gg: Ctx, w: number, h: number): void => {
    const lw = 96, lh = 120
    const c0 = document.createElement('canvas')
    c0.width = lw
    c0.height = lh
    const g = c0.getContext('2d')
    if (!g) return
    const sky = g.createLinearGradient(0, 0, 0, lh)
    sky.addColorStop(0, '#141B2D'); sky.addColorStop(1, '#2B3E66')
    g.fillStyle = sky; g.fillRect(0, 0, lw, lh)
    g.fillStyle = '#F6EED9'; for (let i = 0; i < 18; i++) g.fillRect(Math.floor(rng.next() * lw), Math.floor(rng.next() * 60), 1, 1)
    g.fillStyle = '#E0B33F'; g.fillRect(74, 30, 7, 7)
    g.fillStyle = '#5E7F3A'; g.fillRect(0, 96, lw, 24); g.fillStyle = '#B9D35A'; g.fillRect(0, 94, lw, 3)
    g.fillStyle = '#C9C1AE'; g.fillRect(60, 64, 30, 30); g.fillRect(56, 54, 10, 40); g.fillRect(84, 54, 10, 40)
    for (let x = 56; x < 94; x += 4) g.fillRect(x, 50, 2, 4)
    g.fillStyle = '#E26D7A'; g.fillRect(60, 42, 2, 8); g.fillRect(62, 42, 5, 3); g.fillRect(88, 42, 2, 8); g.fillRect(90, 42, 5, 3)
    g.fillStyle = '#1F1A17'; g.fillRect(70, 80, 10, 14)
    g.fillStyle = '#7A4E2B'; g.fillRect(10, 86, 20, 4); g.fillRect(12, 90, 3, 5); g.fillRect(25, 90, 3, 5); g.fillRect(18, 74, 3, 13)
    g.fillStyle = '#B07A47'; for (let i = 0; i < 9; i++) g.fillRect(14 + i, 80 - i, 2, 2)
    g.fillStyle = '#E0B33F'; for (let i = 0; i < 9; i++) { const t = i / 8; g.fillRect(Math.round(26 + t * 30), Math.round(70 - Math.sin(t * Math.PI) * 30), 2, 2) }
    g.fillStyle = '#F6EED9'; g.fillRect(55, 58, 4, 4)
    g.fillStyle = '#E0B33F'; g.font = `700 11px ${FONT_DISPLAY}`; g.textAlign = 'center'
    g.fillText('TINY SIEGE', lw / 2, 15); g.fillText('WARS', lw / 2, 27)
    g.fillStyle = '#F6EED9'; g.font = `500 8px ${FONT_DISPLAY}`; g.fillText('PRESS START', lw / 2, 113)
    gg.imageSmoothingEnabled = false
    gg.drawImage(c0, 0, 0, w, h)
    gg.fillStyle = 'rgba(0,0,0,0.18)'
    for (let y = 0; y < h; y += 4) gg.fillRect(0, y, w, 1.5)
  }
}

function phonePainter(kind: 'role' | 'akil') {
  return (g: Ctx, w: number, h: number): void => {
    if (kind === 'role') {
      const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#231A40'); bg.addColorStop(1, '#5A3E9A'); g.fillStyle = bg; g.fillRect(0, 0, w, h)
      for (let i = 0; i < 3; i++) {
        g.save(); g.translate(w / 2 + (i - 1) * 62, 300 + Math.abs(i - 1) * 16); g.rotate((i - 1) * 0.28)
        rrect(g, -52, -78, 104, 156, 14); g.fillStyle = i === 1 ? PAL.mustard : PAL.cream; g.fill(); g.strokeStyle = PAL.ink; g.lineWidth = 5; g.stroke()
        g.fillStyle = PAL.ink
        if (i === 1) { g.beginPath(); g.ellipse(0, -6, 34, 22, 0, 0, 7); g.fill(); g.fillStyle = PAL.mustard; g.beginPath(); g.ellipse(-14, -8, 9, 6, 0.2, 0, 7); g.ellipse(14, -8, 9, 6, -0.2, 0, 7); g.fill() }
        else txt(g, '?', 0, 8, { size: 64, weight: 700, font: FONT_DISPLAY, color: PAL.violet, align: 'center', base: 'middle' })
        g.restore()
      }
      txt(g, 'RoleBluff', w / 2, 140, { size: 48, weight: 700, font: FONT_DISPLAY, color: PAL.cream, align: 'center' })
      rrect(g, 50, 460, w - 100, 64, 18); g.fillStyle = PAL.mustard; g.fill(); g.strokeStyle = PAL.ink; g.lineWidth = 5; g.stroke()
      txt(g, 'Play', w / 2, 494, { size: 30, weight: 700, font: FONT_DISPLAY, color: PAL.ink, align: 'center', base: 'middle' })
      rrect(g, w / 2 - 34, 548, 68, 30, 15); g.fillStyle = 'rgba(246,238,217,0.18)'; g.fill()
      txt(g, 'iOS', w / 2, 564, { size: 16, weight: 800, color: PAL.cream, align: 'center', base: 'middle' })
    } else {
      const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#CDEBF7'); bg.addColorStop(0.62, '#9ED3EE'); bg.addColorStop(0.62, '#6CA6D9'); bg.addColorStop(1, '#4F8CC4'); g.fillStyle = bg; g.fillRect(0, 0, w, h)
      g.fillStyle = PAL.mustard; g.beginPath(); g.arc(230, 100, 34, 0, 7); g.fill()
      g.fillStyle = '#E9D59A'; g.beginPath(); g.ellipse(w / 2, 390, 140, 40, 0, 0, 7); g.fill()
      g.fillStyle = PAL.lime; g.beginPath(); g.ellipse(w / 2, 372, 116, 62, 0, Math.PI, 0); g.fill(); g.strokeStyle = PAL.ink; g.lineWidth = 4; g.stroke()
      g.strokeStyle = '#7A4E2B'; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.moveTo(170, 330); g.quadraticCurveTo(180, 280, 166, 236); g.stroke()
      g.fillStyle = '#5FA05A'; for (let i = 0; i < 5; i++) { g.save(); g.translate(166, 236); g.rotate(-1.4 + i * 0.7); g.beginPath(); g.ellipse(32, 0, 34, 10, 0, 0, 7); g.fill(); g.restore() }
      rrect(g, 30, 140, w - 60, 66, 18); g.fillStyle = PAL.cream; g.fill(); g.strokeStyle = PAL.ink; g.lineWidth = 5; g.stroke()
      const s = fitSize(g, 'Akıl Adası', w - 90, { size: 38, weight: 900 })
      txt(g, 'Akıl Adası', w / 2, 175, { size: s, weight: 900, color: PAL.ink, align: 'center', base: 'middle' })
      rrect(g, 60, 470, w - 120, 64, 32); g.fillStyle = PAL.lime; g.fill(); g.strokeStyle = PAL.ink; g.lineWidth = 5; g.stroke()
      g.fillStyle = PAL.ink; g.beginPath(); g.moveTo(w / 2 - 10, 486); g.lineTo(w / 2 + 16, 502); g.lineTo(w / 2 - 10, 518); g.fill()
      rrect(g, w / 2 - 50, 552, 100, 30, 15); g.fillStyle = 'rgba(31,26,23,0.2)'; g.fill()
      txt(g, 'Android', w / 2, 568, { size: 16, weight: 800, color: PAL.cream, align: 'center', base: 'middle' })
    }
  }
}

function paintSite(g: Ctx, w: number, h: number): void {
  g.fillStyle = PAL.cream
  g.fillRect(0, 0, w, h)
  const box = (x: number, y: number, bw: number, bh: number, c: string, r = 12, sh = 6): void => {
    rrect(g, x + sh, y + sh, bw, bh, r); g.fillStyle = PAL.ink; g.fill()
    rrect(g, x, y, bw, bh, r); g.fillStyle = c; g.fill(); g.strokeStyle = PAL.ink; g.lineWidth = 4; g.stroke()
  }
  box(20, 16, w - 46, 44, '#FFF8E8', 12, 4)
  g.fillStyle = PAL.turq; g.beginPath(); g.arc(46, 38, 11, 0, 7); g.fill(); g.strokeStyle = PAL.ink; g.lineWidth = 3; g.stroke()
  for (let i = 0; i < 4; i++) { g.fillStyle = 'rgba(31,26,23,0.55)'; rrect(g, 340 + i * 66, 33, 48, 10, 5); g.fill() }
  g.fillStyle = PAL.ink; rrect(g, 30, 96, 300, 34, 6); g.fill(); rrect(g, 30, 140, 230, 34, 6); g.fill()
  g.fillStyle = 'rgba(31,26,23,0.35)'; for (let i = 0; i < 3; i++) { rrect(g, 30, 190 + i * 16, 250 - i * 40, 8, 4); g.fill() }
  box(30, 250, 120, 40, PAL.orange, 12, 4)
  box(380, 86, 220, 190, PAL.turq, 18, 7)
  g.fillStyle = PAL.mint; rrect(g, 420, 116, 140, 92, 10); g.fill(); g.strokeStyle = PAL.ink; g.lineWidth = 4; g.stroke()
  g.fillStyle = PAL.ink; g.beginPath(); g.arc(468, 156, 7, 0, 7); g.arc(512, 156, 7, 0, 7); g.fill()
  box(30, 316, 170, 70, PAL.mustard); box(230, 316, 170, 70, PAL.pink); box(430, 316, 170, 70, PAL.sky)
}

function paintSite2(g: Ctx, w: number, h: number): void {
  g.fillStyle = PAL.ink
  g.fillRect(0, 0, w, h)
  g.fillStyle = PAL.orange; rrect(g, 14, 14, w - 28, 170, 14); g.fill()
  g.fillStyle = PAL.cream; g.beginPath(); g.arc(w / 2, 96, 46, 0, 7); g.fill(); g.fillStyle = PAL.ink; g.beginPath(); g.arc(w / 2, 96, 20, 0, 7); g.fill()
  txt(g, 'client demo', 18, 222, { size: 26, weight: 800, color: PAL.cream })
  g.fillStyle = 'rgba(246,238,217,0.4)'; for (let i = 0; i < 3; i++) { rrect(g, 18, 240 + i * 16, 190 - i * 40, 8, 4); g.fill() }
  g.fillStyle = PAL.lime; rrect(g, 18, 312, 110, 36, 10); g.fill()
  for (let i = 0; i < 2; i++) { g.fillStyle = [PAL.sky, PAL.mustard][i]; rrect(g, 18 + i * 106, 364, 96, 46, 10); g.fill() }
}

function paintSketch(g: Ctx, w: number, h: number): void {
  g.fillStyle = '#FBF8EE'
  g.fillRect(0, 0, w, h)
  g.strokeStyle = 'rgba(31,26,23,0.85)'
  g.lineWidth = 3
  g.lineJoin = 'round'
  rrect(g, 120, 30, 80, 108, 16); g.fillStyle = 'rgba(134,212,196,0.8)'; g.fill(); g.stroke()
  rrect(g, 132, 42, 56, 40, 6); g.fillStyle = PAL.mint; g.fill(); g.stroke()
  g.fillStyle = PAL.ink; g.beginPath(); g.arc(150, 60, 3.5, 0, 7); g.arc(170, 60, 3.5, 0, 7); g.fill()
  g.beginPath(); g.arc(160, 66, 6, 0.2 * Math.PI, 0.8 * Math.PI); g.stroke()
  g.beginPath(); g.moveTo(120, 80); g.quadraticCurveTo(96, 96, 92, 126); g.moveTo(200, 80); g.quadraticCurveTo(226, 70, 232, 46); g.moveTo(140, 138); g.lineTo(136, 186); g.moveTo(180, 138); g.lineTo(184, 186); g.stroke()
  g.strokeStyle = 'rgba(31,26,23,0.25)'; g.lineWidth = 1.5; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(30, 40 + i * 30); g.lineTo(90, 36 + i * 30); g.stroke() }
}

function paintRfid(g: Ctx, w: number, h: number): void {
  g.fillStyle = PAL.mint
  g.fillRect(0, 0, w, h)
  txt(g, 'ATTENDANCE', 14, 30, { size: 17, weight: 600, font: FONT_MONO, color: PAL.ink })
  txt(g, 'CARD OK ✓', 14, 64, { size: 22, weight: 600, font: FONT_MONO, color: '#2E8C78' })
  txt(g, 'tap your card', 14, 94, { size: 15, weight: 500, font: FONT_MONO, color: 'rgba(31,26,23,0.7)' })
}

function paintFace(g: Ctx, w: number, h: number): void {
  const bg = g.createLinearGradient(0, 0, 0, h)
  bg.addColorStop(0, '#E9F8EC')
  bg.addColorStop(1, '#D3EEDB')
  g.fillStyle = bg
  g.fillRect(0, 0, w, h)
  g.fillStyle = PAL.ink
  for (const ex of [0.33, 0.67]) { g.beginPath(); g.ellipse(w * ex, h * 0.42, 21, 25, 0, 0, Math.PI * 2); g.fill() }
  g.fillStyle = '#fff'
  for (const ex of [0.33, 0.67]) { g.beginPath(); g.arc(w * ex + 7, h * 0.42 - 9, 6.5, 0, 7); g.fill() }
  g.strokeStyle = PAL.ink
  g.lineWidth = 11
  g.lineCap = 'round'
  g.beginPath(); g.arc(w / 2, h * 0.55, 27, 0.18 * Math.PI, 0.82 * Math.PI); g.stroke()
  g.fillStyle = 'rgba(226,109,122,0.5)'
  for (const ex of [0.17, 0.83]) { g.beginPath(); g.ellipse(w * ex, h * 0.63, 17, 9, 0, 0, 7); g.fill() }
  g.fillStyle = 'rgba(255,255,255,0.12)'
  g.beginPath(); g.moveTo(0, 0); g.lineTo(w * 0.3, 0); g.lineTo(w * 0.08, h); g.lineTo(0, h); g.fill()
}

function radial(stops: [number, string][]) {
  return (g: Ctx, w: number, h: number): void => {
    const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2)
    for (const [o, c] of stops) gr.addColorStop(o, c)
    g.fillStyle = '#000'
    g.fillRect(0, 0, w, h)
    g.fillStyle = gr
    g.fillRect(0, 0, w, h)
  }
}

function paintMoon(g: Ctx, w: number, h: number): void {
  g.fillStyle = '#000'
  g.fillRect(0, 0, w, h)
  const gr = g.createRadialGradient(w * 0.43, h * 0.39, 10, w / 2, h / 2, w * 0.48)
  gr.addColorStop(0, '#FFF9E8')
  gr.addColorStop(1, '#EADFC0')
  g.fillStyle = gr
  g.beginPath(); g.arc(w / 2, h / 2, w * 0.48, 0, 7); g.fill()
  g.fillStyle = 'rgba(180,160,120,0.25)'
  for (const [x, y, r] of [[90, 90, 26], [160, 140, 34], [120, 180, 18], [180, 80, 14], [70, 150, 12]]) { g.beginPath(); g.arc((x * w) / 256, (y * h) / 256, (r * w) / 256, 0, 7); g.fill() }
}

function paintSpill(g: Ctx, w: number, h: number): void {
  g.fillStyle = '#000'
  g.fillRect(0, 0, w, h)
  for (let x = 0; x < w; x++) {
    const ex = Math.min(1, Math.min(x, w - 1 - x) / (w * 0.18))
    const gr = g.createLinearGradient(0, 0, 0, h)
    gr.addColorStop(0, `rgba(255,255,255,${ex})`)
    gr.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = gr
    g.fillRect(x, 0, 1, h)
  }
}

function paintStreak(rng: Rng) {
  return (g: Ctx, w: number, h: number): void => {
    g.fillStyle = '#000'
    g.fillRect(0, 0, w, h)
    for (let y = 0; y < h; y++) {
      const v = 1 - y / h
      const a = Math.pow(v, 1.6) * (0.55 + 0.45 * Math.abs(Math.sin(y * 0.33) * Math.sin(y * 0.071)))
      const gr = g.createLinearGradient(0, 0, w, 0)
      gr.addColorStop(0, 'rgba(255,255,255,0)')
      gr.addColorStop(0.3 + rng.next() * 0.1, `rgba(255,255,255,${a})`)
      gr.addColorStop(0.62 + rng.next() * 0.1, `rgba(255,255,255,${a})`)
      gr.addColorStop(1, 'rgba(255,255,255,0)')
      g.fillStyle = gr
      g.fillRect(0, y, w, 1)
    }
  }
}

/* ------------------------------------------------------------------ decals */
function paintWhiteboard(rng: Rng) {
  return (g: Ctx, w: number, h: number): void => {
    g.fillStyle = '#F2F2EA'
    g.fillRect(0, 0, w, h)
    g.fillStyle = 'rgba(120,130,150,0.06)'
    for (let i = 0; i < 14; i++) { g.beginPath(); g.ellipse(rng.next() * w, rng.next() * h, 60 + rng.next() * 90, 14 + rng.next() * 20, rng.next(), 0, 7); g.fill() }
    // multi-agent flow: user → orchestrator → agents → MCP tools → SQL
    const node = (x: number, y: number, label: string, fill: string, rw = 128): void => {
      rrect(g, x - rw / 2, y - 26, rw, 52, 14); g.fillStyle = fill; g.fill(); g.strokeStyle = PAL.ink; g.lineWidth = 4.5; g.stroke()
      txt(g, label, x, y + 2, { size: 20, weight: 600, font: FONT_MONO, color: PAL.ink, align: 'center', base: 'middle' })
    }
    const arrow = (x1: number, y1: number, x2: number, y2: number, c: string): void => {
      g.strokeStyle = c; g.fillStyle = c; g.lineWidth = 3.5
      g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke()
      const a = Math.atan2(y2 - y1, x2 - x1)
      g.beginPath(); g.moveTo(x2, y2); g.lineTo(x2 - 14 * Math.cos(a - 0.4), y2 - 14 * Math.sin(a - 0.4)); g.lineTo(x2 - 14 * Math.cos(a + 0.4), y2 - 14 * Math.sin(a + 0.4)); g.fill()
    }
    const T = 'rgba(46,140,120,0.9)', O = 'rgba(232,132,90,0.95)'
    arrow(170, 210, 232, 210, T)
    arrow(360, 200, 430, 128, T); arrow(360, 210, 430, 210, T); arrow(360, 220, 430, 292, T)
    arrow(560, 128, 610, 190, O); arrow(560, 210, 606, 210, O); arrow(560, 292, 610, 230, O)
    node(104, 210, 'user', PAL.cream, 110)
    node(296, 210, 'orchestr.', PAL.turq)
    node(496, 128, 'agent', PAL.mustard)
    node(496, 210, 'agent', PAL.mustard)
    node(496, 292, 'agent', PAL.mustard)
    node(672, 210, 'MCP', PAL.violet, 110)
    g.strokeStyle = PAL.ink; g.lineWidth = 4
    g.beginPath(); g.ellipse(672, 330, 40, 12, 0, 0, 7); g.stroke()
    g.beginPath(); g.moveTo(632, 330); g.lineTo(632, 370); g.moveTo(712, 330); g.lineTo(712, 370); g.stroke()
    g.beginPath(); g.ellipse(672, 370, 40, 12, 0, 0, Math.PI); g.stroke()
    txt(g, 'SQL', 672, 357, { size: 18, weight: 600, font: FONT_MONO, color: PAL.ink, align: 'center', base: 'middle' })
    arrow(672, 238, 672, 312, T)
    txt(g, 'multi-agent flow', 36, 56, { size: 30, weight: 800, color: '#5A3FA0' })
    txt(g, 'LLM · C# / .NET 8 · tools', 36, 392, { size: 22, weight: 600, font: FONT_MONO, color: '#3A3A44' })
  }
}

function paintChalk(rng: Rng) {
  return (g: Ctx, w: number, h: number): void => {
    const bg = g.createLinearGradient(0, 0, w, h); bg.addColorStop(0, '#2F4B40'); bg.addColorStop(1, '#253D34'); g.fillStyle = bg; g.fillRect(0, 0, w, h)
    g.fillStyle = 'rgba(255,255,255,0.05)'
    for (let i = 0; i < 18; i++) { g.beginPath(); g.ellipse(rng.next() * w, rng.next() * h, 50 + rng.next() * 70, 10 + rng.next() * 16, rng.next(), 0, 7); g.fill() }
    const C = 'rgba(244,240,226,0.88)'
    txt(g, 'Timetable', 26, 48, { size: 32, weight: 700, color: C, font: FONT_DISPLAY })
    g.strokeStyle = 'rgba(244,240,226,0.6)'; g.lineWidth = 2.5
    for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(26, 70 + i * 40); g.lineTo(300, 70 + i * 40); g.stroke() }
    for (let i = 0; i <= 3; i++) { g.beginPath(); g.moveTo(26 + i * 91, 70); g.lineTo(26 + i * 91, 230); g.stroke() }
    const cells = [PAL.mustard, PAL.sky, PAL.pink, PAL.lime]
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) if (rng.next() < 0.7) { g.fillStyle = cells[(r + c) % 4]; g.globalAlpha = 0.7; g.fillRect(32 + c * 91, 76 + r * 40, 50 + rng.next() * 25, 26); g.globalAlpha = 1 }
    txt(g, '1 + 2 = 3', 340, 112, { size: 38, weight: 700, color: C, font: FONT_DISPLAY })
    txt(g, 'A+', 360, 210, { size: 70, weight: 700, color: '#F2C94C', font: FONT_DISPLAY })
    g.strokeStyle = C; g.lineWidth = 3; g.beginPath(); g.arc(476, 186, 26, 0, 7); g.stroke(); g.beginPath(); g.moveTo(476, 160); g.lineTo(482, 144); g.stroke()
    txt(g, 'abc · xyz', 26, 286, { size: 24, weight: 500, color: C, font: FONT_MONO })
  }
}

function paintPosterGame(g: Ctx, w: number, h: number): void {
  g.fillStyle = PAL.pink
  g.fillRect(0, 0, w, h)
  g.fillStyle = PAL.mustard; g.beginPath(); g.arc(w * 0.7, h * 0.28, 50, 0, 7); g.fill()
  g.fillStyle = PAL.ink; g.fillRect(40, 250, 220, 120); for (let x = 40; x < 260; x += 30) g.fillRect(x, 230, 18, 22); g.fillRect(70, 190, 46, 70); g.fillRect(190, 190, 46, 70)
  g.fillStyle = PAL.pink; g.beginPath(); g.arc(150, 330, 28, Math.PI, 0); g.fill(); g.fillRect(122, 330, 56, 40)
  txt(g, 'TINY', 24, 72, { size: 58, weight: 700, color: PAL.cream, font: FONT_DISPLAY })
  txt(g, 'SIEGE WARS', 24, 122, { size: 40, weight: 700, color: PAL.ink, font: FONT_DISPLAY })
  g.strokeStyle = PAL.ink; g.lineWidth = 12; g.strokeRect(6, 6, w - 12, h - 12)
}

function paintPosterAi(g: Ctx, w: number, h: number): void {
  g.fillStyle = '#1E2A44'
  g.fillRect(0, 0, w, h)
  const pts: [number, number][] = [[130, 70], [60, 170], [200, 170], [130, 250]]
  g.strokeStyle = PAL.turq; g.lineWidth = 4
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) { g.beginPath(); g.moveTo(...pts[i]); g.lineTo(...pts[j]); g.stroke() }
  pts.forEach(([x, y], i) => { g.fillStyle = [PAL.mustard, PAL.turq, PAL.pink, PAL.mint][i]; g.beginPath(); g.arc(x, y, 18, 0, 7); g.fill(); g.strokeStyle = PAL.ink; g.lineWidth = 4; g.stroke() })
  txt(g, 'AGENTS', 22, 316, { size: 42, weight: 700, color: PAL.cream, font: FONT_DISPLAY })
  txt(g, 'that use tools', 22, 344, { size: 20, weight: 600, color: PAL.turq, font: FONT_MONO })
}

function paintDiploma(g: Ctx, w: number, h: number): void {
  g.fillStyle = '#FBF6E7'
  g.fillRect(0, 0, w, h)
  g.strokeStyle = PAL.mustard; g.lineWidth = 8; g.strokeRect(14, 14, w - 28, h - 28)
  g.strokeStyle = PAL.ink; g.lineWidth = 2; g.strokeRect(26, 26, w - 52, h - 52)
  txt(g, 'DIPLOMA', w / 2, 78, { size: 34, weight: 700, color: PAL.ink, align: 'center', font: FONT_DISPLAY, ls: 4 })
  txt(g, 'Computer Engineering', w / 2, 122, { size: 24, weight: 700, color: '#3B3029', align: 'center' })
  txt(g, 'Dorukan Kılınç', w / 2, 164, { size: 26, weight: 800, color: PAL.ink, align: 'center' })
  g.fillStyle = PAL.mustard; g.beginPath(); g.arc(w - 74, h - 64, 24, 0, 7); g.fill(); g.strokeStyle = '#9C7A20'; g.lineWidth = 3; g.stroke()
  g.strokeStyle = PAL.ink; g.lineWidth = 2; g.beginPath(); g.moveTo(60, h - 56); g.bezierCurveTo(90, h - 80, 110, h - 40, 140, h - 60); g.stroke()
}

function paintPortrait(g: Ctx, w: number, h: number): void {
  g.fillStyle = PAL.mustard
  g.fillRect(0, 0, w, h)
  consoleGlyph(g, 50, 30, 100, 6)
}

function paintBlueprint(g: Ctx, w: number, h: number): void {
  g.fillStyle = '#2B4C7E'
  g.fillRect(0, 0, w, h)
  g.strokeStyle = 'rgba(255,255,255,0.12)'; g.lineWidth = 1
  for (let x = 0; x < w; x += 16) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke() }
  for (let y = 0; y < h; y += 16) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke() }
  g.strokeStyle = 'rgba(240,248,255,0.9)'; g.lineWidth = 4; g.strokeRect(30, 40, w - 60, h - 70)
  g.lineWidth = 2.5; g.beginPath(); g.moveTo(150, 40); g.lineTo(150, 130); g.moveTo(30, 130); g.lineTo(230, 130); g.moveTo(230, 90); g.lineTo(230, h - 30); g.stroke()
  for (const [x, y, a] of [[40, 50, 0.6], [140, 50, 2.3], [300, 120, 3.4], [44, 200, 5.5]]) {
    g.fillStyle = PAL.mustard; g.beginPath(); g.moveTo(x, y); g.arc(x, y, 34, a - 0.4, a + 0.4); g.closePath(); g.globalAlpha = 0.45; g.fill(); g.globalAlpha = 1; g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill()
  }
  txt(g, 'OFFICE · CAMERA PLAN', 30, 28, { size: 15, weight: 600, font: FONT_MONO, color: '#EAF2FF' })
}

function platePainter(text: string, bg: string, fg: string) {
  return (g: Ctx, w: number, h: number): void => {
    g.fillStyle = PAL.ink
    g.fillRect(0, 0, w, h)
    rrect(g, 4, 4, w - 8, h - 8, 22); g.fillStyle = bg; g.fill(); g.strokeStyle = PAL.ink; g.lineWidth = 8; g.stroke()
    const s = fitSize(g, text, w - 50, { size: h * 0.5, weight: 700, font: FONT_DISPLAY, ls: 2 })
    txt(g, text, w / 2, h / 2 + 2, { size: s, weight: 700, color: fg, align: 'center', base: 'middle', font: FONT_DISPLAY, ls: 2 })
  }
}

function nameplatePainter(label: string) {
  return (g: Ctx, w: number, h: number): void => {
    g.fillStyle = PAL.ink
    g.fillRect(0, 0, w, h)
    const bg = g.createLinearGradient(0, 0, 0, h)
    bg.addColorStop(0, '#E9C978'); bg.addColorStop(0.5, '#CFA552'); bg.addColorStop(1, '#B98C3E')
    rrect(g, 3, 3, w - 6, h - 6, 20); g.fillStyle = bg; g.fill(); g.strokeStyle = PAL.ink; g.lineWidth = 6; g.stroke()
    rrect(g, 13, 13, w - 26, h - 26, 13); g.strokeStyle = 'rgba(31,26,23,0.35)'; g.lineWidth = 2; g.stroke()
    for (const x of [30, w - 30]) { g.fillStyle = 'rgba(31,26,23,0.5)'; g.beginPath(); g.arc(x, h / 2, 7, 0, 7); g.fill() }
    const s = fitSize(g, label, w - 120, { size: 58, weight: 700, font: FONT_DISPLAY, ls: 4 })
    txt(g, label, w / 2, h / 2 + 3, { size: s, weight: 700, color: PAL.ink, align: 'center', base: 'middle', font: FONT_DISPLAY, ls: 4 })
  }
}

function paintSign(g: Ctx, w: number, h: number): void {
  g.fillStyle = PAL.ink
  g.fillRect(0, 0, w, h)
  rrect(g, 6, 6, w - 12, h - 12, 34); g.fillStyle = PAL.cream; g.fill(); g.strokeStyle = PAL.ink; g.lineWidth = 12; g.stroke()
  consoleGlyph(g, 48, 40, 100, 8)
  const label = 'DORUKAN STUDIO'
  const s = fitSize(g, label, 980, { size: 118, weight: 700, font: FONT_DISPLAY, ls: 6 })
  txt(g, label, 184, h / 2 + 6, { size: s, weight: 700, color: PAL.ink, base: 'middle', font: FONT_DISPLAY, ls: 6 })
  const tw = g.measureText(label).width
  const hx = 184 + tw + 34
  rrect(g, hx, 58, w - 40 - hx, 104, 22); g.fillStyle = PAL.orange; g.fill(); g.strokeStyle = PAL.ink; g.lineWidth = 8; g.stroke()
  txt(g, 'HQ', hx + (w - 40 - hx) / 2, h / 2 + 6, { size: 70, weight: 700, color: PAL.ink, base: 'middle', align: 'center', font: FONT_DISPLAY, ls: 3 })
}

function paintIcon(c: string, glyph: string) {
  return (g: Ctx, w: number, h: number): void => {
    g.fillStyle = PAL.ink
    g.fillRect(0, 0, w, h)
    rrect(g, 4, 4, w - 8, h - 8, 30); g.fillStyle = c; g.fill(); g.strokeStyle = PAL.ink; g.lineWidth = 8; g.stroke()
    txt(g, glyph, w / 2, h / 2 + 4, { size: 64, weight: 700, color: PAL.ink, align: 'center', base: 'middle', font: FONT_DISPLAY })
  }
}

/* ------------------------------------------------------------------ build */
export function paintArt(): Art {
  const rng = createRng(20261119)
  const decal = new ShelfAtlas(2048, PAL.ink)
  const screen = new ShelfAtlas(2048, '#000000')
  const tiles = new TileAtlas(2048, 512, 32)

  const t: Record<TileKey, TileRect> = {
    planks: tiles.add(paintPlanks(rng)),
    wallSchool: tiles.add(wallPainter(rng, '#D9C08A', 'sprig', '#C9AA63', '#000')),
    wallHotel: tiles.add(wallPainter(rng, '#9DBCDD', 'diamond', '#86A9D0', '#F6EED9')),
    wallSecurity: tiles.add(wallPainter(rng, '#3E6466', 'stripes', '#456E70', '#355A5C')),
    wallIot: tiles.add(wallPainter(rng, '#8E6446', 'brick', '#6E4A33', '#9A6E4E')),
    wallGame: tiles.add(wallPainter(rng, '#6E3C48', 'pixel', '#7E4654', '#E26D7A')),
    wallStudio: tiles.add(wallPainter(rng, '#DDE3C2', 'grid', '#CDD6A8', '#BFC98F')),
    wallAi: tiles.add(wallPainter(rng, '#3E4370', 'dots', '#50578A', '#000')),
    wallMobile: tiles.add(wallPainter(rng, '#5A4A86', 'dots', '#6B5A9A', '#000')),
    wallAbout: tiles.add(wallPainter(rng, '#E6D7B5', 'sprig', '#D3BE92', '#000')),
    brick: tiles.add(wallPainter(rng, '#27324E', 'brick', '#1A2136', '#2E3A5A')),
    peg: tiles.add(wallPainter(rng, '#C9884F', 'peg', 'rgba(60,30,10,0.55)', '#000')),
    sidewalk: tiles.add(paintSidewalk(rng)),
    city: tiles.add(paintCity(rng)),
  }

  const nameplates = {} as Record<RoomId, UVRect>
  for (const r of ROOMS) nameplates[r.id] = decal.add(768, 112, nameplatePainter(r.plate))
  const icons: [string, string][] = [[PAL.violet, '?'], [PAL.lime, '✿'], [PAL.mustard, '★'], [PAL.sky, '♪'], [PAL.pink, '♥'], [PAL.turq, '◆']]
  const d: Art['d'] = {
    whiteboard: decal.add(768, 420, paintWhiteboard(rng)),
    chalk: decal.add(560, 320, paintChalk(rng)),
    posterGame: decal.add(300, 420, paintPosterGame),
    posterAi: decal.add(260, 360, paintPosterAi),
    diploma: decal.add(360, 260, paintDiploma),
    portrait: decal.add(200, 240, paintPortrait),
    blueprint: decal.add(360, 256, paintBlueprint),
    plateCampus: decal.add(640, 110, platePainter('SUMMYRA CAMPUS', PAL.mustard, PAL.ink)),
    platePanel: decal.add(640, 110, platePainter('SUMMYRA PANEL', PAL.sky, PAL.ink)),
    labelCampus: decal.add(640, 110, platePainter('SUMMYRA CAMPUS', PAL.cream, PAL.ink)),
    labelPanel: decal.add(640, 110, platePainter('SUMMYRA PANEL', PAL.cream, PAL.ink)),
    plateRole: decal.add(512, 96, platePainter('ROLEBLUFF · iOS', PAL.violet, PAL.ink)),
    plateAkil: decal.add(512, 96, platePainter('AKIL ADASI · ANDROID', PAL.lime, PAL.ink)),
    contact: decal.add(256, 64, (g, w, h) => { g.fillStyle = PAL.pink; g.fillRect(0, 0, w, h); txt(g, 'CONTACT', w / 2, h / 2 + 3, { size: 36, weight: 700, color: PAL.cream, align: 'center', base: 'middle', font: FONT_DISPLAY, ls: 3 }) }),
    dk: decal.add(128, 96, (g, w, h) => { g.fillStyle = PAL.turq; g.fillRect(0, 0, w, h); txt(g, 'DK', w / 2, h / 2 + 4, { size: 62, weight: 700, align: 'center', base: 'middle', color: PAL.ink, font: FONT_DISPLAY }) }),
    sign: decal.add(1400, 220, paintSign),
    nightSign: decal.add(320, 96, platePainter('NIGHT MODE', PAL.ink, PAL.turq)),
    icons: icons.map(([c, s]) => decal.add(128, 128, paintIcon(c, s))),
    nameplates,
  }

  const feedLabels: Record<FeedKind, string> = { detect: 'CAM 03 · OFFICE', corridor: 'CAM 01 · HALL', lobby: 'CAM 02 · LOBBY', office: 'CAM 04 · DESKS', stairs: 'CAM 05 · STAIRS', server: 'CAM 06 · SERVER', parking: 'CAM 07 · GATE' }
  const feeds = {} as Record<FeedKind, UVRect>
  for (const k of Object.keys(feedLabels) as FeedKind[]) feeds[k] = screen.add(384, 240, feedPainter(rng, k, feedLabels[k]))
  const s: Art['s'] = {
    face: screen.add(256, 200, paintFace),
    feeds,
    alert: screen.add(300, 392, paintAlert),
    nightMap: screen.add(320, 200, paintNightMap),
    log: screen.add(320, 200, paintLog),
    code: screen.add(320, 200, paintCode(rng)),
    campus: screen.add(480, 300, paintCampus),
    hotel: screen.add(480, 300, paintHotel),
    arcade: screen.add(384, 480, paintArcade(rng)),
    marquee: screen.add(512, 140, (g, w, h) => {
      const bg = g.createLinearGradient(0, 0, w, 0); bg.addColorStop(0, PAL.mustard); bg.addColorStop(1, PAL.orange); g.fillStyle = bg; g.fillRect(0, 0, w, h)
      txt(g, 'TINY SIEGE WARS', w / 2, h / 2 + 4, { size: 58, weight: 700, color: PAL.ink, align: 'center', base: 'middle', font: FONT_DISPLAY, ls: 2 })
    }),
    phoneRole: screen.add(300, 620, phonePainter('role')),
    phoneAkil: screen.add(300, 620, phonePainter('akil')),
    site: screen.add(640, 400, paintSite),
    site2: screen.add(240, 420, paintSite2),
    sketch: screen.add(320, 220, paintSketch),
    rfid: screen.add(200, 110, paintRfid),
    soft: screen.add(128, 128, radial([[0, 'rgba(255,255,255,1)'], [0.4, 'rgba(255,255,255,0.35)'], [1, 'rgba(255,255,255,0)']])),
    moon: screen.add(256, 256, paintMoon),
    halo: screen.add(256, 256, radial([[0, 'rgba(255,240,210,1)'], [0.18, 'rgba(255,236,200,0.5)'], [0.45, 'rgba(170,190,230,0.12)'], [1, 'rgba(120,140,200,0)']])),
    spill: screen.add(128, 128, paintSpill),
    streak: screen.add(64, 256, paintStreak(rng)),
  }
  decal.pack()
  screen.pack()
  return { decal, screen, tiles, t, d, s }
}

