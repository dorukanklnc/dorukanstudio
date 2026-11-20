/** Assembles the placeholder world (rooms, building, street, backdrop) before baking. */
import * as THREE from 'three'
import { buildFrame, buildShell } from './building'
import { buildEnvironment } from './environment'
import { Kit } from './kit'
import { COL_X, COLS, FLOOR_Y, ROOMS } from './layout'
import { LightRig } from './lights'
import { createRng } from './random'
import { buildAbout } from './rooms/about'
import { buildAI } from './rooms/ai'
import type { DynRegistry, RoomCtx } from './rooms/context'
import { buildGame } from './rooms/game'
import { buildIoT } from './rooms/iot'
import { buildMobile } from './rooms/mobile'
import { buildSaaS } from './rooms/saas'
import { buildSecurity } from './rooms/security'
import { buildStudio } from './rooms/studio'
import type { Art } from './textures'
import type { RoomId } from './types'

const BUILDERS: Record<RoomId, (c: RoomCtx) => void> = {
  studio: buildStudio,
  ai: buildAI,
  mobile: buildMobile,
  about: buildAbout,
  saas: buildSaaS,
  security: buildSecurity,
  iot: buildIoT,
  game: buildGame,
}

export interface World {
  root: THREE.Group
  rig: LightRig
  dyn: DynRegistry
  kit: Kit
}

export function buildWorld(art: Art): World {
  const kit = new Kit()
  const rig = new LightRig()
  const rng = createRng(1119)
  const root = new THREE.Group()
  const dyn: DynRegistry = { arm: null, rings: null, cage: null }
  for (const r of ROOMS) {
    const g = kit.group(root, COL_X[r.col], FLOOR_Y[r.floor], 0)
    g.userData.room = r.index
    buildShell(kit, art, r, g)
    BUILDERS[r.id]({ kit, art, rig, rng, g, w: COLS[r.col], index: r.index, dyn })
  }
  buildFrame(kit, art, root, rig)
  buildEnvironment(kit, art, root, rig, rng)
  root.updateMatrixWorld(true)
  rig.resolve()
  if (dyn.cage) dyn.cage.anchor.localToWorld(dyn.cage.center)
  return { root, rig, dyn, kit }
}
