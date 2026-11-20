/**
 * Building dimensions (metres). Rooms are open towards +z (the cut-away front);
 * each room's local frame has x ∈ [-w/2, w/2], y ∈ [0, H], z ∈ [-D, 0].
 */
import { ROOM_IDS, type RoomId } from './types'

export const T = 0.3 // interior wall
export const TE = 0.45 // exterior wall
export const D = 4.4 // room depth
export const H = 3.2 // clear height
export const SLAB = 0.38
export const BASE_Y = 0.55
export const COLS = [6.9, 6.8, 3.3, 3.3] as const
export const TOTAL_W = TE * 2 + T * 3 + COLS.reduce((a, b) => a + b, 0)
export const X0 = -TOTAL_W / 2
export const COL_X: number[] = (() => {
  const out: number[] = []
  let x = X0 + TE
  for (const w of COLS) {
    out.push(x + w / 2)
    x += w + T
  }
  return out
})()
export const FLOOR_Y = [BASE_Y, BASE_Y + H + SLAB] as const
export const CEIL_TOP = FLOOR_Y[1] + H
export const TOP_Y = CEIL_TOP + 0.5

/** Index used for everything that is not inside a room (frame, street, sky…). */
export const OUTSIDE = 8

export interface RoomDef {
  id: RoomId
  index: number
  col: number
  floor: 0 | 1
  plate: string
}

const PLATES: Record<RoomId, string> = {
  studio: 'WEB DESIGN STUDIO',
  ai: 'AI LAB',
  mobile: 'MOBILE APPS',
  about: 'ABOUT · CV',
  saas: 'SAAS · SUMMYRA',
  security: 'SECURITY CONTROL',
  iot: 'IOT WORKSHOP',
  game: 'GAME ZONE',
}

/** ROOM_IDS order is top floor L→R, then ground floor L→R. */
export const ROOMS: RoomDef[] = ROOM_IDS.map((id, index) => ({
  id,
  index,
  col: index % 4,
  floor: index < 4 ? 1 : 0,
  plate: PLATES[id],
}))

export function roomDef(id: RoomId): RoomDef {
  const r = ROOMS.find((x) => x.id === id)
  if (!r) throw new Error(`unknown room ${id}`)
  return r
}

export function roomWidth(r: RoomDef): number {
  return COLS[r.col]
}

/** Opening rectangle of a room in world space (front plane z = 0). */
export function roomOpening(r: RoomDef): { x0: number; x1: number; y0: number; y1: number } {
  const w = COLS[r.col]
  const cx = COL_X[r.col]
  const y0 = FLOOR_Y[r.floor]
  return { x0: cx - w / 2, x1: cx + w / 2, y0, y1: y0 + H }
}

/** Centre of a room's brass nameplate on the cut frame. */
export function nameplateCenter(r: RoomDef): [number, number, number] {
  const yTop = FLOOR_Y[r.floor] + H
  const band = r.floor === 0 ? SLAB : TOP_Y - CEIL_TOP
  return [COL_X[r.col], yTop + band / 2 + 0.01, 0.35]
}
