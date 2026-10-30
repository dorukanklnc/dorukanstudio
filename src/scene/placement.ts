import type { LayoutName, Project } from '../content/types'
import { LAYOUTS } from './config'
import type { Placement } from './director'

export const slotsPerPage = (layout: LayoutName) => LAYOUTS[layout].slots.length

export function pageCount(total: number, layout: LayoutName) {
  return Math.max(1, Math.ceil(total / slotsPerPage(layout)))
}

export function pageOf(projects: Project[], slug: string, layout: LayoutName) {
  const i = projects.findIndex((p) => p.slug === slug)
  return i < 0 ? 0 : Math.floor(i / slotsPerPage(layout))
}

/** Cartridges on one shelf page, with their room positions for the current layout. */
export function computePlacements(projects: Project[], layout: LayoutName, page: number): Placement[] {
  const { slots, order } = LAYOUTS[layout]
  const start = page * slots.length
  const shown = projects.slice(start, start + slots.length)
  const indices = order?.[shown.length] ?? shown.map((_, i) => i)
  return shown.map((p, i) => {
    const slot = slots[indices[i]]
    const custom = p.room?.[layout]
    return { slug: p.slug, x: custom?.x ?? slot.x, y: custom?.y ?? slot.y, shadow: slot.shadow, amp: slot.amp }
  })
}
