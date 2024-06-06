import {
  Billboard,
  ColliderLayer,
  EasingFunction,
  engine,
  Entity,
  GltfContainer,
  InputAction,
  Material,
  MaterialTransparencyMode,
  MeshRenderer,
  PointerEvents,
  pointerEventsSystem,
  PointerEventType,
  Transform,
  Tween,
  TweenLoop,
  TweenSequence
} from '@dcl/sdk/ecs'
import { handleJoinGameClick, handleNewGameClick, setupUi } from './ui'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import * as npc from 'dcl-npc-toolkit'
import { welcomeScript } from './dialog'

export function main() {
  setupUi()

  const scene = engine.addEntity()
  GltfContainer.create(scene, {
    src: 'assets/scene/models/bingoScene.glb'
  })
  Transform.create(scene, {
    position: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 }
  })

  createBalls()

  let acornCharacter = npc.create(
    {
      position: Vector3.create(1, 0, 1),
      rotation: Quaternion.fromEulerDegrees(0, 0, 0),
      scale: Vector3.create(1, 1, 1)
    },
    {
      type: npc.NPCType.CUSTOM,
      model: {
        src: 'assets/scene/models/acornChar.glb'
      },
      // faceUser: true,
      portrait: { path: 'images/acornCharIcon.png' },
      onActivate: () => {
        npc.talk(acornCharacter, welcomeScript)
      },
      onWalkAway: () => {
        console.log('test on walk away function')
        npc.closeDialogWindow(acornCharacter)
      }
    }
  )

}

const createdEntities: Entity[] = []

export function createNumbers(number: number, index: number) {
  const numberEntity: Entity = engine.addEntity()
  createdEntities.push(numberEntity)
  MeshRenderer.setPlane(numberEntity)

  const row = Math.floor(index / 9)
  const col = index % 9

  Transform.create(numberEntity, {
    position: { x: 42 - col, y: 5 + row, z: 32.5 },
    scale: { x: 1.2, y: 1.2, z: 1 }
  })

  Material.setPbrMaterial(numberEntity, {
    texture: Material.Texture.Common({
      src: 'images/numbers/' + number + '.png'
    }),
    transparencyMode: MaterialTransparencyMode.MTM_ALPHA_TEST,
    alphaTest: 0.5,
    metallic: 0.5,
    albedoColor: { r: 1.7, g: 1.7, b: 1.7, a: 1 }
  })

  Billboard.create(numberEntity, {})
}

export function removeAllCreatedEntities() {
  for (const entity of createdEntities) {
    engine.removeEntity(entity)
  }
  createdEntities.length = 0
}

const ballsPink: Entity[] = []
const ballsBlue: Entity[] = []

export function createBalls() {
  const ballPink = engine.addEntity()
  GltfContainer.create(ballPink, {
    src: 'assets/scene/models/ballPink.glb',
    visibleMeshesCollisionMask: ColliderLayer.CL_POINTER
  })
  Transform.create(ballPink, {
    position: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 }
  })
  Tween.create(ballPink, {
    mode: Tween.Mode.Move({
      start: Vector3.create(0, 0, 0),
      end: Vector3.create(0, 3, 0)
    }),
    duration: 4000,
    easingFunction: EasingFunction.EF_EASESINE
  })
  TweenSequence.create(ballPink, { sequence: [], loop: TweenLoop.TL_YOYO })
  PointerEvents.create(ballPink, {
    pointerEvents: [
      {
        eventType: PointerEventType.PET_DOWN,
        eventInfo: {
          button: InputAction.IA_POINTER,
          hoverText: 'New Game',
          maxDistance: 100,
          showFeedback: true
        }
      }
    ]
  })
  pointerEventsSystem.onPointerDown({ entity: ballPink, opts: { button: InputAction.IA_POINTER } }, () => {
    console.log('clicked')
    handleNewGameClick()
    engine.removeEntity(ballPink)
    engine.removeEntity(ballBlue)
    ballsPink.length = 0
    ballsBlue.length = 0
  })

  const ballBlue = engine.addEntity()
  GltfContainer.create(ballBlue, {
    src: 'assets/scene/models/ballBlue.glb',
    visibleMeshesCollisionMask: ColliderLayer.CL_POINTER
  })
  Transform.create(ballBlue, {
    position: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 }
  })
  Tween.create(ballBlue, {
    mode: Tween.Mode.Move({
      start: Vector3.create(0, 3, 0),
      end: Vector3.create(0, 0, 0)
    }),
    duration: 4000,
    easingFunction: EasingFunction.EF_EASESINE
  })
  TweenSequence.create(ballBlue, { sequence: [], loop: TweenLoop.TL_YOYO })
  PointerEvents.create(ballBlue, {
    pointerEvents: [
      {
        eventType: PointerEventType.PET_DOWN,
        eventInfo: {
          button: InputAction.IA_POINTER,
          hoverText: 'Join Game',
          maxDistance: 100,
          showFeedback: true
        }
      }
    ]
  })
  pointerEventsSystem.onPointerDown({ entity: ballBlue, opts: { button: InputAction.IA_POINTER } }, () => {
    console.log('clicked')
    handleJoinGameClick()
    engine.removeEntity(ballPink)
    engine.removeEntity(ballBlue)
    ballsPink.length = 0
    ballsBlue.length = 0
  })
  ballsPink.push(ballPink)
  ballsBlue.push(ballBlue)
}

export function removeBallPink() {
  for (const entity of ballsPink) {
    engine.removeEntity(entity)
  }
  ballsPink.length = 0
}

export function removeBallBlue() {
  for (const entity of ballsBlue) {
    engine.removeEntity(entity)
  }
  ballsBlue.length = 0
}
