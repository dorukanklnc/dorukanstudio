/**
 * Bucket materials. All of them read per-vertex `aRoom` and multiply their output by
 * uRoomGain[aRoom] (hover / focus dimming without extra draw calls).
 *  - 'low':  MeshBasicMaterial · albedo × baked light (zero real-time lights).
 *  - 'high': MeshStandardMaterial · baked light as indirect diffuse + real-time accent
 *            lights, per-vertex roughness/metalness.
 * Tiled surfaces sample a slot of the tile atlas with fract() + textureGrad (no seams).
 */
import * as THREE from 'three'
import type { BucketKind } from './bake'
import { OUTSIDE } from './layout'
import type { Quality } from './types'

export interface Shared {
  uRoomGain: { value: Float32Array }
  uTime: { value: number }
  uBlink: { value: number }
  uAddK: { value: number }
}

export function createShared(): Shared {
  return {
    uRoomGain: { value: new Float32Array(OUTSIDE + 1).fill(1) },
    uTime: { value: 0 },
    uBlink: { value: 1 },
    uAddK: { value: 1 },
  }
}

export interface Atlases {
  tiles: THREE.Texture
  decal: THREE.Texture
  screen: THREE.Texture
}

interface InjectOpts {
  bake: 'none' | 'basic' | 'standard'
  tile?: boolean
  rm?: boolean
  blink?: boolean
  add?: boolean
}

const TILE_MAP = /* glsl */ `
#ifdef USE_MAP
  vec2 tuv = vTile.xy + fract( vMapUv ) * vTile.zw;
  vec2 gx = dFdx( vMapUv ) * vTile.zw;
  vec2 gy = dFdy( vMapUv ) * vTile.zw;
  float gl = max( length( gx ), length( gy ) ) * 2048.0;
  if ( gl > 16.0 ) { gx *= 16.0 / gl; gy *= 16.0 / gl; }
  vec4 sampledDiffuseColor = textureGrad( map, tuv, gx, gy );
  diffuseColor *= sampledDiffuseColor;
#endif
`

export function injectRoomShader(mat: THREE.Material, shared: Shared, o: InjectOpts, key: string): void {
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uRoomGain = shared.uRoomGain
    let vd = 'attribute float aRoom;\nuniform float uRoomGain[9];\nvarying float vGain;\n'
    let vb = 'vGain = uRoomGain[ int( aRoom + 0.5 ) ];\n'
    let fd = 'varying float vGain;\n'
    if (o.bake !== 'none') {
      vd += 'attribute vec3 bake;\nvarying vec3 vBake;\n'
      vb += 'vBake = bake;\n'
      fd += 'varying vec3 vBake;\n'
    }
    if (o.tile) {
      vd += 'attribute vec4 tile;\nvarying vec4 vTile;\n'
      vb += 'vTile = tile;\n'
      fd += 'varying vec4 vTile;\n'
    }
    if (o.rm) {
      vd += 'attribute vec2 aRM;\nvarying vec2 vRM;\n'
      vb += 'vRM = aRM;\n'
      fd += 'varying vec2 vRM;\n'
    }
    if (o.blink) {
      sh.uniforms.uTime = shared.uTime
      sh.uniforms.uBlink = shared.uBlink
      vd += 'attribute float aPhase;\nuniform float uTime;\nuniform float uBlink;\n'
      vb += 'if ( aPhase > 0.0 ) { float on = step( -0.35, sin( uTime * 2.6 + aPhase * 2.1 ) ); vGain *= mix( 1.0, mix( 0.12, 1.0, on ), uBlink ); }\n'
    }
    if (o.add) {
      // in-room glow sprites are toned down when bloom is on; outdoor ones (moon, halos) are not
      sh.uniforms.uAddK = shared.uAddK
      vd += 'uniform float uAddK;\nvarying float vAddK;\n'
      vb += 'vAddK = aRoom > 7.5 ? 1.0 : uAddK;\n'
      fd += 'varying float vAddK;\n'
    }
    sh.vertexShader = sh.vertexShader.replace('#include <common>', `#include <common>\n${vd}`).replace('#include <begin_vertex>', `#include <begin_vertex>\n${vb}`)
    let fs = sh.fragmentShader.replace('#include <common>', `#include <common>\n${fd}`)
    if (o.tile) fs = fs.replace('#include <map_fragment>', TILE_MAP)
    if (o.bake === 'basic') fs = fs.replace('#include <aomap_fragment>', 'reflectedLight.indirectDiffuse *= vBake;')
    if (o.bake === 'standard') fs = fs.replace('#include <aomap_fragment>', 'reflectedLight.indirectDiffuse += vBake * diffuseColor.rgb;')
    if (o.rm) fs = fs.replace('#include <roughnessmap_fragment>', 'float roughnessFactor = vRM.x;').replace('#include <metalnessmap_fragment>', 'float metalnessFactor = vRM.y;')
    fs = fs.replace('#include <opaque_fragment>', `outgoingLight *= vGain${o.add ? ' * vAddK' : ''};\n#include <opaque_fragment>`)
    sh.fragmentShader = fs
  }
  mat.customProgramCacheKey = () => key
}

export function createBucketMaterial(kind: BucketKind, q: Quality, tex: Atlases, shared: Shared): THREE.Material {
  const hq = q === 'high'
  const lit = (map: THREE.Texture | null, side: THREE.Side, tile: boolean): THREE.Material => {
    const m = hq
      ? new THREE.MeshStandardMaterial({ vertexColors: true, map, side, roughness: 1, metalness: 0, dithering: true })
      : new THREE.MeshBasicMaterial({ vertexColors: true, map, side, dithering: true })
    injectRoomShader(m, shared, { bake: hq ? 'standard' : 'basic', tile, rm: hq }, `hq-${hq}-${kind}`)
    return m
  }
  switch (kind) {
    case 'lit':
      return lit(null, THREE.FrontSide, false)
    case 'litDS':
      return lit(null, THREE.DoubleSide, false)
    case 'tile':
      return lit(tex.tiles, THREE.FrontSide, true)
    case 'decal':
      return lit(tex.decal, THREE.FrontSide, false)
    case 'screen': {
      const m = new THREE.MeshBasicMaterial({ vertexColors: true, map: tex.screen })
      injectRoomShader(m, shared, { bake: 'none' }, 'screen')
      return m
    }
    case 'glow': {
      const m = new THREE.MeshBasicMaterial({ vertexColors: true })
      injectRoomShader(m, shared, { bake: 'none', blink: true }, 'glow')
      return m
    }
    case 'add': {
      const m = new THREE.MeshBasicMaterial({ vertexColors: true, map: tex.screen, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide })
      injectRoomShader(m, shared, { bake: 'none', add: true }, 'add')
      return m
    }
  }
}
