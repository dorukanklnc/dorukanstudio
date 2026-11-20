import type * as THREE from 'three'
import type { Kit } from '../kit'
import type { LightRig, LightSpec } from '../lights'
import type { Rng } from '../random'
import type { Art } from '../textures'

/** Objects animated at runtime (kept out of the static merge). */
export interface DynRegistry {
  arm: THREE.Object3D | null
  rings: THREE.Object3D | null
  cage: { anchor: THREE.Object3D; center: THREE.Vector3; radius: number; room: number } | null
}

/** Everything a room builder needs. Local frame: x ∈ [-w/2, w/2], y ∈ [0, H], z ∈ [-D, 0]. */
export interface RoomCtx {
  kit: Kit
  art: Art
  rig: LightRig
  rng: Rng
  g: THREE.Group
  w: number
  index: number
  dyn: DynRegistry
}

export function light(c: RoomCtx, anchor: THREE.Object3D, spec: LightSpec): void {
  c.rig.add(anchor, c.index, spec)
}

/** The room's main warm ceiling spot (soft baked shadows). Intensities match the concept rig. */
export function roomSpot(
  c: RoomCtx,
  pos: [number, number, number],
  target: [number, number, number],
  intensity: number,
  o: Partial<LightSpec> = {},
): void {
  light(c, c.g, { color: '#FFB766', angle: 1, penumbra: 0.85, ...o, type: 'spot', pos, target, intensity: intensity * 1.35, shadow: true })
}
