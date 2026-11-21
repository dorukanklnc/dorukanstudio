/**
 * Night Shift HQ — 3D scene engine for the Experience Lab (implements ./types.ts).
 *
 * Build pipeline: fonts → canvas atlases → placeholder world → light bake (vertex
 * attributes) → ~7 merged bucket meshes → materials for the current quality.
 * Rendering is on demand: a requestAnimationFrame loop only runs while idle motion is on
 * (and not paused) or while a hover/focus fade is in progress.
 */
import * as THREE from 'three'
import { atlasTexture } from './atlas'
import { bakeScene, type BakedMesh, type BucketKind } from './bake'
import { fitPose, heroCorePoints, heroPoints, HERO_DIR, HERO_FOV, roomPoints, ROOM_DIR, ROOM_FOV } from './camera'
import { nameplateCenter, OUTSIDE, roomDef, roomOpening, ROOMS, D } from './layout'
import { createBucketMaterial, createShared, injectRoomShader, type Atlases, type Shared } from './materials'
import { loadFonts } from './palette'
import { Post } from './post'
import { createSky, createStars } from './sky'
import { paintArt } from './textures'
import type { CameraPose, CreateHQ, FrameRect, HQEngine, HQOptions, Quality, RoomId } from './types'
import { buildWorld } from './world'
import { yieldToMain } from './yield'

export type { CameraPose, FrameRect, HQEngine, HQOptions, Quality, RoomId } from './types'

const DPR_CAP: Record<Quality, number> = { high: 2, low: 1.5 }
/** Rendered pixels the HQ aims for at the start (about a 2560×1440 screen). */
const PIXEL_BUDGET = 3.7e6
const loseExt = new WeakMap<HTMLCanvasElement, WEBGL_lose_context>()
/** Resolves once the 'webglcontextlost' event of a deliberate dispose() has been handled. */
const lostEvent = new WeakMap<HTMLCanvasElement, Promise<void>>()

const waitFor = (p: Promise<unknown>, ms: number): Promise<unknown> => Promise.race([p, new Promise((r) => setTimeout(r, ms))])

/** Gets a WebGL2 context, restoring one this module deliberately lost on a previous dispose(). */
async function acquireContext(canvas: HTMLCanvasElement): Promise<WebGL2RenderingContext> {
  const gl = canvas.getContext('webgl2', { alpha: false, antialias: true, depth: true, stencil: false, premultipliedAlpha: true, preserveDrawingBuffer: false, powerPreference: 'high-performance' })
  if (!gl) throw new Error('WebGL2 is not available')
  if (gl.isContextLost()) {
    const ext = loseExt.get(canvas)
    if (ext) {
      // Chrome dispatches the synthetic 'lost' event asynchronously; restoring before it ran is refused
      await waitFor(lostEvent.get(canvas) ?? Promise.resolve(), 1000)
      // …and only marks it restorable after the listeners returned, so leave that task first
      await new Promise((r) => setTimeout(r, 30))
      await new Promise<void>((resolve) => {
        const done = (): void => {
          canvas.removeEventListener('webglcontextrestored', done)
          resolve()
        }
        canvas.addEventListener('webglcontextrestored', done)
        ext.restoreContext()
        setTimeout(done, 3000)
      })
    }
    if (gl.isContextLost()) throw new Error('WebGL context is lost')
  }
  const ext = gl.getExtension('WEBGL_lose_context')
  if (ext) loseExt.set(canvas, ext)
  return gl
}

interface Bucket {
  kind: BucketKind
  mesh: THREE.Mesh
  low: THREE.BufferAttribute | null
  high: THREE.BufferAttribute | null
}

export const createHQ: CreateHQ = async (opts: HQOptions): Promise<HQEngine> => {
  const { canvas } = opts
  let quality: Quality = opts.quality
  let reduced = opts.reducedMotion
  const progress = (p: number): void => opts.onProgress?.(Math.min(1, Math.max(0, p)))
  progress(0.01)
  await loadFonts()
  progress(0.05)

  const gl = await acquireContext(canvas)
  const renderer = new THREE.WebGLRenderer({ canvas, context: gl, antialias: true, powerPreference: 'high-performance' })
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.NeutralToneMapping
  renderer.toneMappingExposure = 1.15
  renderer.setClearColor('#0B1020', 1)
  renderer.shadowMap.type = THREE.PCFShadowMap
  renderer.shadowMap.autoUpdate = false
  renderer.info.autoReset = false
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy())

  // ------------------------------------------------------------ build + bake
  const art = paintArt()
  progress(0.18)
  await yieldToMain()
  const world = buildWorld(art)
  progress(0.26)
  await yieldToMain()
  const baked: BakedMesh[] = await bakeScene(world.root, world.rig.lights, (p) => progress(0.26 + p * 0.6))
  const { group: rtLights, shadowLight } = world.rig.createRealtime()
  const cage = world.dyn.cage
  world.kit.dispose()

  const atlases: Atlases = {
    tiles: atlasTexture(art.tiles.canvas, aniso),
    decal: atlasTexture(art.decal.canvas, aniso),
    screen: atlasTexture(art.screen.canvas, aniso),
  }
  const shared: Shared = createShared()
  const scene = new THREE.Scene()
  scene.fog = new THREE.Fog('#18213A', 60, 420)
  const camera = new THREE.PerspectiveCamera(HERO_FOV, 1, 0.3, 900)

  const materials = new Map<string, THREE.Material>()
  const matFor = (kind: BucketKind, q: Quality): THREE.Material => {
    const shareable = kind === 'screen' || kind === 'glow' || kind === 'add'
    const key = shareable ? kind : `${kind}|${q}`
    let m = materials.get(key)
    if (!m) {
      m = createBucketMaterial(kind, q, atlases, shared)
      materials.set(key, m)
    }
    return m
  }

  const buckets: Bucket[] = []
  let arm: THREE.Object3D | null = null
  let rings: THREE.Object3D | null = null
  const ORDER: Record<BucketKind, number> = { lit: 0, litDS: 0, tile: 0, decal: 1, screen: 1, glow: 1, add: 10 }
  for (const b of baked) {
    const mesh = new THREE.Mesh(b.geometry, matFor(b.kind, quality))
    const lit = b.kind === 'lit' || b.kind === 'litDS' || b.kind === 'tile'
    mesh.castShadow = lit
    mesh.receiveShadow = lit || b.kind === 'decal'
    mesh.renderOrder = ORDER[b.kind]
    mesh.frustumCulled = b.dynamic !== null
    const low = b.bakeLow ? new THREE.Float32BufferAttribute(b.bakeLow, 3) : null
    const high = b.bakeHigh ? new THREE.Float32BufferAttribute(b.bakeHigh, 3) : null
    if (low && high) b.geometry.setAttribute('bake', quality === 'high' ? high : low)
    buckets.push({ kind: b.kind, mesh, low, high })
    if (b.dynamic) {
      // pivot carries the authored world transform; the child animates in local space
      let pivot: THREE.Object3D | null = b.dynamic === 'arm' ? arm : rings
      if (!pivot) {
        const holder = new THREE.Object3D()
        holder.matrixAutoUpdate = false
        holder.matrix.copy(b.matrix)
        pivot = new THREE.Object3D()
        holder.add(pivot)
        scene.add(holder)
        if (b.dynamic === 'arm') arm = pivot
        else rings = pivot
      }
      pivot.add(mesh)
    } else {
      mesh.matrixAutoUpdate = false
      scene.add(mesh)
    }
  }
  // orb cage (thin lines)
  let cageLines: THREE.LineSegments | null = null
  if (cage) {
    const eg = new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(cage.radius, 1))
    eg.setAttribute('aRoom', new THREE.Float32BufferAttribute(new Float32Array(eg.getAttribute('position').count).fill(cage.room), 1))
    const lm = new THREE.LineBasicMaterial({ color: new THREE.Color(0xdff2e2).multiplyScalar(1.4), transparent: true, opacity: 0.8 })
    injectRoomShader(lm, shared, { bake: 'none' }, 'cage')
    cageLines = new THREE.LineSegments(eg, lm)
    cageLines.position.copy(cage.center)
    scene.add(cageLines)
  }
  const sky = createSky(shared)
  const stars = createStars(shared, 1)
  scene.add(sky, stars, rtLights)
  progress(0.9)

  // ------------------------------------------------------------ state
  let width = Math.max(1, canvas.clientWidth || canvas.width)
  let height = Math.max(1, canvas.clientHeight || canvas.height)
  let dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
  let post: Post | null = null
  let pose: CameraPose = { position: [0, 5, 40], target: [0, 4, 0], fov: HERO_FOV, offset: [0, 0] }
  let hover: RoomId | null = null
  let focus: RoomId | null = null
  const target = new Float32Array(OUTSIDE + 1).fill(1)
  let paused = false
  let disposed = false
  let raf = 0
  let last = 0
  let time = 1.2
  const lastStats = { drawCalls: 0, triangles: 0, lights: 0, textures: 0, programs: 0 }
  /** Extra pixel-ratio limit set by the host when the GPU is slow (see setMaxPixelRatio). */
  let maxPR = Infinity
  // Big high-DPI screens start below their full ratio (a 2× laptop panel is ~6 MP),
  // but the budget never pushes a screen below 1×.
  const pixelRatio = (): number =>
    Math.min(dpr, DPR_CAP[quality], maxPR, Math.max(1, Math.sqrt(PIXEL_BUDGET / Math.max(1, width * height))))
  let gpuName: string | null = null
  const gpu = (): string => {
    if (gpuName === null) {
      try {
        const ext = gl.getExtension('WEBGL_debug_renderer_info')
        gpuName = String(gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER) ?? '')
      } catch {
        gpuName = ''
      }
    }
    return gpuName
  }
  let rtLightCount = 0
  for (const c of rtLights.children) if ((c as THREE.Light).isLight) rtLightCount++
  const raycaster = new THREE.Raycaster()
  const ndc = new THREE.Vector2()
  const hit = new THREE.Vector3()
  const tmp = new THREE.Vector3()
  const boxes = ROOMS.map((r) => {
    const o = roomOpening(r)
    return new THREE.Box3(new THREE.Vector3(o.x0, o.y0, -D), new THREE.Vector3(o.x1, o.y1, 0.4))
  })

  const applySize = (): void => {
    const pr = pixelRatio()
    renderer.setPixelRatio(pr)
    renderer.setSize(width, height, false)
    post?.setSize(width, height, pr)
    ;(stars.material as THREE.ShaderMaterial).uniforms.uPR.value = pr
  }

  const applyCamera = (): void => {
    camera.fov = pose.fov
    camera.aspect = width / height
    camera.position.set(pose.position[0], pose.position[1], pose.position[2])
    camera.lookAt(pose.target[0], pose.target[1], pose.target[2])
    camera.setViewOffset(width, height, pose.offset[0] * width, pose.offset[1] * height, width, height)
    camera.updateProjectionMatrix()
    camera.updateMatrixWorld()
  }

  const applyQuality = (): void => {
    const hq = quality === 'high'
    for (const b of buckets) {
      b.mesh.material = matFor(b.kind, quality)
      if (b.low && b.high) b.mesh.geometry.setAttribute('bake', hq ? b.high : b.low)
    }
    rtLights.visible = hq
    if (!hq && shadowLight?.shadow.map) {
      shadowLight.shadow.map.dispose()
      shadowLight.shadow.map = null
    }
    renderer.shadowMap.enabled = hq && shadowLight !== null
    renderer.shadowMap.needsUpdate = true
    shared.uAddK.value = hq ? 0.7 : 1
    if (hq && !post) post = new Post(renderer, scene, camera, width, height, pixelRatio())
    if (!hq && post) {
      post.dispose()
      post = null
    }
    applySize()
  }

  const gainTarget = (i: number): number => {
    let g = 1
    const fi = focus ? roomDef(focus).index : -1
    if (fi >= 0) g = i === fi ? 1.08 : i === OUTSIDE ? 0.45 : 0.16
    if (hover && i === roomDef(hover).index) g *= 1.25
    return g
  }
  const retarget = (): void => {
    for (let i = 0; i <= OUTSIDE; i++) target[i] = gainTarget(i)
  }

  /** Advances fades and idle motion; returns true while a fade is still running. */
  const step = (dt: number): boolean => {
    const g = shared.uRoomGain.value
    let fading = false
    const k = 1 - Math.exp(-dt * 10)
    for (let i = 0; i <= OUTSIDE; i++) {
      const d = target[i] - g[i]
      if (Math.abs(d) < 0.002) g[i] = target[i]
      else {
        g[i] += d * k
        fading = true
      }
    }
    if (!reduced) {
      time += dt
      shared.uTime.value = time
      if (arm) {
        const cyc = time % 7
        const env = cyc < 2.2 ? Math.sin((cyc / 2.2) * Math.PI) : 0
        arm.rotation.z = Math.sin(time * 9) * 0.3 * env
      }
      if (rings) rings.rotation.y = time * 0.4
    }
    return fading
  }

  const renderFrame = (): void => {
    renderer.info.reset()
    if (post) post.render(reduced ? 0 : time)
    else renderer.render(scene, camera)
    // no allocations here: the stats object is reused
    lastStats.drawCalls = renderer.info.render.calls
    lastStats.triangles = renderer.info.render.triangles
    lastStats.lights = rtLights.visible ? rtLightCount : 0
    lastStats.textures = renderer.info.memory.textures
    lastStats.programs = renderer.info.programs?.length ?? 0
  }

  const loop = (now: number): void => {
    raf = 0
    if (disposed || paused) return
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 1 / 60
    last = now
    const fading = step(dt)
    renderFrame()
    if (!reduced || fading) raf = requestAnimationFrame(loop)
    else last = 0
  }
  const requestRender = (): void => {
    if (disposed || paused || raf) return
    raf = requestAnimationFrame(loop)
  }

  const applyReduced = (): void => {
    shared.uBlink.value = reduced ? 0 : 1
    if (reduced && arm) arm.rotation.z = 0
  }

  // ------------------------------------------------------------ engine API
  const engine: HQEngine = {
    heroPose(frame: FrameRect): CameraPose {
      const fpx = ((frame.x1 - frame.x0) * width) / Math.max(1, (frame.y1 - frame.y0) * height)
      return fitPose(fpx < 1.1 ? heroCorePoints() : heroPoints(), HERO_DIR, HERO_FOV, frame, width / height)
    },
    roomPose(id: RoomId, frame: FrameRect): CameraPose {
      return fitPose(roomPoints(roomDef(id)), ROOM_DIR, ROOM_FOV, frame, width / height, 0.02)
    },
    setPose(p: CameraPose): void {
      pose = { position: [...p.position], target: [...p.target], fov: p.fov, offset: [p.offset[0], p.offset[1]] }
      applyCamera()
      requestRender()
    },
    pick(x: number, y: number): RoomId | null {
      ndc.set(x, y)
      raycaster.setFromCamera(ndc, camera)
      let best: RoomId | null = null
      let bestD = Infinity
      for (let i = 0; i < boxes.length; i++) {
        if (!raycaster.ray.intersectBox(boxes[i], hit)) continue
        const d = hit.distanceToSquared(raycaster.ray.origin)
        if (d < bestD) {
          bestD = d
          best = ROOMS[i].id
        }
      }
      return best
    },
    setHover(id: RoomId | null): void {
      if (hover === id) return
      hover = id
      retarget()
      requestRender()
    },
    setFocus(id: RoomId | null): void {
      if (focus === id) return
      focus = id
      retarget()
      requestRender()
    },
    projectRoom(id: RoomId): { x: number; y: number; visible: boolean } {
      const c = nameplateCenter(roomDef(id))
      tmp.set(c[0], c[1], c[2]).project(camera)
      const x = ((tmp.x + 1) / 2) * width, y = ((1 - tmp.y) / 2) * height
      const visible = tmp.z < 1 && tmp.x >= -1.02 && tmp.x <= 1.02 && tmp.y >= -1.02 && tmp.y <= 1.02
      return { x, y, visible }
    },
    resize(w: number, h: number, ratio: number): void {
      width = Math.max(1, w)
      height = Math.max(1, h)
      dpr = ratio || 1
      applySize()
      applyCamera()
      requestRender()
    },
    setQuality(q: Quality): void {
      if (q === quality) return
      quality = q
      applyQuality()
      requestRender()
    },
    setMaxPixelRatio(max: number): void {
      const next = max > 0 ? max : Infinity
      if (next === maxPR) return
      maxPR = next
      applySize()
      requestRender()
    },
    setReducedMotion(r: boolean): void {
      reduced = r
      applyReduced()
      requestRender()
    },
    setPaused(p: boolean): void {
      paused = p
      if (p) {
        if (raf) cancelAnimationFrame(raf)
        raf = 0
        last = 0
      } else requestRender()
    },
    stats() {
      return { ...lastStats, quality, pixelRatio: renderer.getPixelRatio(), gpu: gpu() }
    },
    dispose(): void {
      if (disposed) return
      disposed = true
      if (raf) cancelAnimationFrame(raf)
      raf = 0
      post?.dispose()
      post = null
      const geos = new Set<THREE.BufferGeometry>()
      scene.traverse((o) => {
        const m = o as THREE.Mesh
        if (m.geometry) geos.add(m.geometry)
        if ((o as THREE.Light).isLight) (o as THREE.Light).dispose()
        const mat = (o as THREE.Mesh).material
        if (mat && !Array.isArray(mat)) mat.dispose()
      })
      for (const g of geos) g.dispose()
      for (const m of materials.values()) m.dispose()
      materials.clear()
      atlases.tiles.dispose()
      atlases.decal.dispose()
      atlases.screen.dispose()
      renderer.dispose()
      // free the GL context too; acquireContext() restores it if this canvas is reused
      const ext = loseExt.get(canvas)
      if (ext && !gl.isContextLost()) {
        lostEvent.set(canvas, new Promise<void>((resolve) => {
          canvas.addEventListener('webglcontextlost', (e) => {
            e.preventDefault() // keeps the context restorable for a remount on the same canvas
            resolve()
          }, { once: true })
        }))
        ext.loseContext()
      }
    },
  }

  // ------------------------------------------------------------ first frame
  applyQuality()
  applyReduced()
  engine.setPose(engine.heroPose({ x0: 0.04, y0: 0.12, x1: 0.96, y1: 0.9 }))
  if (raf) cancelAnimationFrame(raf)
  raf = 0
  if (renderer.extensions.has('KHR_parallel_shader_compile')) {
    try {
      await renderer.compileAsync(scene, camera)
    } catch {
      /* compileAsync is an optimisation only */
    }
  } else renderer.compile(scene, camera)
  progress(0.97)
  renderFrame()
  progress(1)
  requestRender()
  return engine
}

export default createHQ
