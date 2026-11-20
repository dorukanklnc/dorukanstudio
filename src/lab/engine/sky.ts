/** Gradient night sky dome and a star field (both dim with the "outside" room gain). */
import * as THREE from 'three'
import type { Shared } from './materials'
import { createRng } from './random'

export function createSky(shared: Shared): THREE.Mesh {
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      top: { value: new THREE.Color('#060A16') },
      mid: { value: new THREE.Color('#131C36') },
      hor: { value: new THREE.Color('#2E3C61') },
      warm: { value: new THREE.Color('#6A5244') },
      uRoomGain: shared.uRoomGain,
    },
    side: THREE.BackSide,
    depthWrite: false,
    vertexShader: /* glsl */ `varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 top, mid, hor, warm; uniform float uRoomGain[9]; varying vec3 vD;
      void main(){
        float h = vD.y;
        vec3 c = mix(hor, mid, smoothstep(-0.02, 0.16, h));
        c = mix(c, top, smoothstep(0.16, 0.6, h));
        c += warm * exp(-abs(h) * 22.0) * 0.55;
        gl_FragColor = vec4(c * uRoomGain[8], 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  })
  const sky = new THREE.Mesh(new THREE.SphereGeometry(700, 32, 16), mat)
  sky.renderOrder = -10
  sky.frustumCulled = false
  return sky
}

export function createStars(shared: Shared, dpr: number): THREE.Points {
  const rng = createRng(77)
  const N = 900
  const pos = new Float32Array(N * 3), size = new Float32Array(N), col = new Float32Array(N * 3)
  for (let i = 0; i < N; i++) {
    const th = rng.next() * Math.PI * 2, y = Math.pow(rng.range(0.06, 1), 0.7), r = Math.sqrt(1 - y * y)
    pos.set([Math.cos(th) * r * 600, y * 600, Math.sin(th) * r * 600], i * 3)
    size[i] = rng.next() < 0.06 ? rng.range(2.6, 3.6) : rng.range(0.9, 2.0)
    col.set(rng.next() < 0.3 ? [1.0, 0.86, 0.68] : [0.85, 0.9, 1.0], i * 3)
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('size', new THREE.BufferAttribute(size, 1))
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
  const mat = new THREE.ShaderMaterial({
    uniforms: { uPR: { value: dpr }, uRoomGain: shared.uRoomGain },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    vertexShader: /* glsl */ `attribute float size; varying vec3 vC; varying float vS; uniform float uPR;
      void main(){ vC = color; vS = size; gl_PointSize = size * uPR * 1.4; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `varying vec3 vC; varying float vS; uniform float uRoomGain[9];
      void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d); a *= a;
        gl_FragColor = vec4(vC * a * (0.45 + vS * 0.55) * uRoomGain[8], 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  })
  const stars = new THREE.Points(geo, mat)
  stars.frustumCulled = false
  return stars
}
