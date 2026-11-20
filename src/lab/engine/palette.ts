/** Brand palette (same hex values as src/styles/base.css) plus the night-scene darks. */
export const PAL = {
  ink: '#1F1A17',
  cream: '#F6EED9',
  mint: '#DFF2E2',
  turq: '#86D4C4',
  turq2: '#5FB3A3',
  mustard: '#E0B33F',
  pink: '#E26D7A',
  violet: '#8E6CCF',
  lime: '#B9D35A',
  sky: '#6CA6D9',
  orange: '#E8845A',
  wood: '#B07A47',
  wood2: '#7A4E2B',
  navy: '#141B2D',
  navy2: '#1E2A44',
  amber: '#FFB766',
} as const

/** Self-hosted site fonts (loaded by the page through @fontsource). */
export const FONT_DISPLAY = '"Pixelify Sans", ui-monospace, monospace'
export const FONT_BODY = '"Nunito Variable", "Nunito", system-ui, sans-serif'
export const FONT_MONO = '"IBM Plex Mono", ui-monospace, monospace'

const FONT_FACES = [
  `500 32px ${FONT_DISPLAY}`,
  `700 32px ${FONT_DISPLAY}`,
  `500 32px ${FONT_MONO}`,
  `600 32px ${FONT_MONO}`,
  `600 32px ${FONT_BODY}`,
  `800 32px ${FONT_BODY}`,
  `900 32px ${FONT_BODY}`,
]

/** Waits (bounded) for the faces used on canvas textures, including Turkish glyphs. */
export async function loadFonts(timeoutMs = 2500): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return
  const sample = 'DORUKAN Kılınç Akıl Adası 0123'
  const all = Promise.all(FONT_FACES.map((f) => document.fonts.load(f, sample).catch(() => [])))
  await Promise.race([all, new Promise((r) => setTimeout(r, timeoutMs))])
}
