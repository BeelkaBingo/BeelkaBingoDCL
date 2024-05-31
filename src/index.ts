import {
  Billboard,
  engine,
  Entity,
  GltfContainer,
  Material,
  MaterialTransparencyMode,
  MeshRenderer,
  Transform
} from '@dcl/sdk/ecs'
import { setupUi } from './ui'

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
