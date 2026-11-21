/**
 * Contract between the Experience Lab UI (React, src/lab/*) and the 3D scene
 * engine (plain three.js, src/lab/engine/*). The UI never touches three.js
 * objects directly except through this interface; the engine never renders HTML.
 */

/** The eight rooms of the HQ, left→right, top floor then ground floor in the default layout. */
export type RoomId = 'studio' | 'ai' | 'mobile' | 'about' | 'saas' | 'security' | 'iot' | 'game'

export const ROOM_IDS: RoomId[] = ['studio', 'ai', 'mobile', 'about', 'saas', 'security', 'iot', 'game']

/** 'high' = desktop-class GPU; 'low' = phones / low-power: no post-processing, fewer lights, DPR ≤ 1.5. */
export type Quality = 'high' | 'low'

export type Vec3 = [number, number, number]

/** Everything needed to place the camera. All fields are interpolatable. */
export interface CameraPose {
  position: Vec3
  target: Vec3
  /** Vertical field of view in degrees. */
  fov: number
  /**
   * Lens shift as a fraction of the viewport (camera.setViewOffset): positive x moves the
   * picture left, so the subject can sit beside a side panel without rotating the camera.
   */
  offset: [number, number]
}

/**
 * Part of the viewport, in fractions (0–1, origin top-left), that the subject must fit
 * inside, e.g. { x0: 0, y0: 0.08, x1: 0.62, y1: 0.92 } when a panel covers the right side.
 */
export interface FrameRect {
  x0: number
  y0: number
  x1: number
  y1: number
}

export interface HQOptions {
  canvas: HTMLCanvasElement
  quality: Quality
  /** No idle motion (blinking LEDs, waving mascot) when true. */
  reducedMotion: boolean
  /** 0–1 while building geometry/textures. */
  onProgress?: (p: number) => void
}

export interface HQEngine {
  /** Fitted pose showing the whole building inside `frame`. */
  heroPose(frame: FrameRect): CameraPose
  /** Close-up of one room's open front, fitted inside `frame`. */
  roomPose(id: RoomId, frame: FrameRect): CameraPose
  /** Place the camera immediately (the UI tweens between poses and calls this every frame). */
  setPose(pose: CameraPose): void
  /** Room under a point given in normalized device coordinates (-1..1), or null. */
  pick(ndcX: number, ndcY: number): RoomId | null
  /** Subtle highlight (brighter room light / outline) on hover or keyboard focus. */
  setHover(id: RoomId | null): void
  /** Dim every room except this one (null = all rooms lit normally). */
  setFocus(id: RoomId | null): void
  /** Screen position (CSS px, relative to the canvas) of a room's nameplate, for HTML pins. */
  projectRoom(id: RoomId): { x: number; y: number; visible: boolean }
  /** Call on canvas size changes. */
  resize(width: number, height: number, dpr: number): void
  setQuality(q: Quality): void
  /**
   * Upper limit for the render pixel ratio (on top of the quality's own cap), so a slow
   * GPU can keep the full look at a lower internal resolution. Infinity = no extra limit.
   */
  setMaxPixelRatio(max: number): void
  setReducedMotion(r: boolean): void
  /** Stop the render loop (tab hidden, Quick portfolio open). */
  setPaused(paused: boolean): void
  /** Measured from renderer.info for the last frame, plus the current render settings. */
  stats(): {
    drawCalls: number
    triangles: number
    lights: number
    textures: number
    programs: number
    quality: Quality
    pixelRatio: number
    /** GPU name as the browser reports it ('' if hidden). */
    gpu: string
  }
  dispose(): void
}

export type CreateHQ = (opts: HQOptions) => Promise<HQEngine>
