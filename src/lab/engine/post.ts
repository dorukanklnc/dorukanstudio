/** 'high' quality post chain: MSAA scene → bloom → tone map / sRGB → vignette + grain. */
import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'

export class Post {
  private readonly composer: EffectComposer
  private readonly bloom: UnrealBloomPass
  private readonly output: OutputPass
  private readonly final: ShaderPass

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera, w: number, h: number, dpr: number) {
    const rt = new THREE.WebGLRenderTarget(Math.max(1, w * dpr), Math.max(1, h * dpr), { type: THREE.HalfFloatType, samples: 4 })
    this.composer = new EffectComposer(renderer, rt)
    this.composer.setPixelRatio(dpr)
    this.composer.setSize(w, h)
    this.composer.addPass(new RenderPass(scene, camera))
    this.bloom = new UnrealBloomPass(new THREE.Vector2(w, h), 0.55, 0.55, 0.92)
    this.composer.addPass(this.bloom)
    this.output = new OutputPass()
    this.composer.addPass(this.output)
    this.final = new ShaderPass({
      uniforms: { tDiffuse: { value: null }, uRes: { value: new THREE.Vector2(w, h) }, uTime: { value: 0 } },
      vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `uniform sampler2D tDiffuse; uniform vec2 uRes; uniform float uTime; varying vec2 vUv;
        float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
        void main(){
          vec4 c = texture2D(tDiffuse, vUv);
          vec2 p = vUv - 0.5; p.x *= uRes.x / uRes.y;
          c.rgb *= mix(0.66, 1.0, smoothstep(1.05, 0.25, length(p)));
          float l = dot(c.rgb, vec3(0.299, 0.587, 0.114));
          c.rgb = mix(c.rgb, c.rgb * vec3(0.92, 0.97, 1.08), (1.0 - smoothstep(0.0, 0.35, l)) * 0.5);
          c.rgb += (hash(vUv * uRes + uTime) - 0.5) * 0.024;
          gl_FragColor = c;
        }`,
    })
    this.composer.addPass(this.final)
  }

  setSize(w: number, h: number, dpr: number): void {
    this.composer.setPixelRatio(dpr)
    this.composer.setSize(w, h)
    ;(this.final.uniforms.uRes.value as THREE.Vector2).set(w, h)
  }

  render(time: number): void {
    this.final.uniforms.uTime.value = time
    this.composer.render()
  }

  dispose(): void {
    this.bloom.dispose()
    this.output.dispose()
    this.final.dispose()
    this.composer.dispose()
  }
}
