/**
 * Camera poses. The view direction stays fixed (long lens, slightly above and to the
 * right); distance is solved so the subject fits the requested FrameRect and the lens
 * shift (setViewOffset) centres it there, so a side panel never forces a rotation.
 */
import * as THREE from 'three'
import { COL_X, H, ROOMS, TOP_Y, TOTAL_W, roomOpening, type RoomDef } from './layout'
import type { CameraPose, FrameRect } from './types'

export const HERO_DIR = new THREE.Vector3(-7.3, -4.65, -40).normalize()
export const ROOM_DIR = new THREE.Vector3(-0.17, -0.14, -1).normalize()
export const HERO_FOV = 26
export const ROOM_FOV = 30

const _cam = new THREE.PerspectiveCamera()
const _p = new THREE.Vector3()

function ndcBounds(pts: THREE.Vector3[]): [number, number, number, number] {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity
  for (const p of pts) {
    _p.copy(p).project(_cam)
    x0 = Math.min(x0, _p.x); x1 = Math.max(x1, _p.x)
    y0 = Math.min(y0, _p.y); y1 = Math.max(y1, _p.y)
  }
  return [x0, x1, y0, y1]
}

export function fitPose(pts: THREE.Vector3[], dir: THREE.Vector3, fov: number, frame: FrameRect, aspect: number, margin = 0.03): CameraPose {
  const box = new THREE.Box3().setFromPoints(pts)
  const center = box.getCenter(new THREE.Vector3())
  const radius = box.getSize(new THREE.Vector3()).length() / 2
  _cam.fov = fov
  _cam.aspect = aspect
  _cam.near = 0.1
  _cam.far = 3000
  _cam.clearViewOffset()
  _cam.updateProjectionMatrix()
  const fw0 = Math.max(0.05, frame.x1 - frame.x0), fh0 = Math.max(0.05, frame.y1 - frame.y0)
  const fx0 = frame.x0 + margin * fw0, fx1 = frame.x1 - margin * fw0
  const fy0 = frame.y0 + margin * fh0, fy1 = frame.y1 - margin * fh0
  const fw = 2 * (fx1 - fx0), fh = 2 * (fy1 - fy0)
  let dist = radius / Math.tan((fov * Math.PI) / 360) + 1
  let b: [number, number, number, number] = [0, 0, 0, 0]
  for (let i = 0; i < 8; i++) {
    _cam.position.copy(center).addScaledVector(dir, -dist)
    _cam.lookAt(center)
    _cam.updateMatrixWorld()
    b = ndcBounds(pts)
    const s = Math.max((b[1] - b[0]) / fw, (b[3] - b[2]) / fh)
    if (Math.abs(s - 1) < 0.002) break
    dist *= s
    if (i === 7) {
      _cam.position.copy(center).addScaledVector(dir, -dist)
      _cam.lookAt(center)
      _cam.updateMatrixWorld()
      b = ndcBounds(pts)
    }
  }
  const cx = (b[0] + b[1]) / 2, cy = (b[2] + b[3]) / 2
  const tx = fx0 + fx1 - 1, ty = 1 - (fy0 + fy1)
  return {
    position: [_cam.position.x, _cam.position.y, _cam.position.z],
    target: [center.x, center.y, center.z],
    fov,
    offset: [-(tx - cx) / 2, (ty - cy) / 2],
  }
}

const V = (x: number, y: number, z: number): THREE.Vector3 => new THREE.Vector3(x, y, z)

/** Whole building incl. rooftop sign and a strip of sidewalk. */
export function heroPoints(): THREE.Vector3[] {
  const hw = TOTAL_W / 2 + 0.36
  return [
    V(-hw, 0, 0.6), V(hw, 0, 0.6), V(-hw, TOP_Y + 0.25, 0.6), V(hw, TOP_Y + 0.25, 0.6),
    V(-hw, 0, 2.6), V(hw, 0, 2.6),
    V(COL_X[1] - 3.3, TOP_Y + 2.45, -2.9), V(COL_X[1] + 3.3, TOP_Y + 2.45, -2.9),
    V(-7.4, TOP_Y + 3.25, -2.6),
  ]
}

/** Tighter subject for portrait frames: the eight room openings and the sign. */
export function heroCorePoints(): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  for (const r of ROOMS) {
    const o = roomOpening(r)
    pts.push(V(o.x0, o.y0, 0.35), V(o.x1, o.y1, 0.35))
  }
  pts.push(V(COL_X[1] - 3.3, TOP_Y + 2.45, -2.9), V(COL_X[1] + 3.3, TOP_Y + 2.45, -2.9))
  return pts
}

/** The room's open front plus a hint of the back wall so the interior is framed. */
export function roomPoints(r: RoomDef): THREE.Vector3[] {
  const o = roomOpening(r)
  return [V(o.x0, o.y0, 0.35), V(o.x1, o.y0, 0.35), V(o.x0, o.y1, 0.35), V(o.x1, o.y1, 0.35), V((o.x0 + o.x1) / 2, o.y0 + H * 0.5, -1)]
}
