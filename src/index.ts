import {
  Billboard,
  engine,
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

  const blueButtonGrid = engine.addEntity()
  MeshRenderer.setPlane(blueButtonGrid)
  Transform.create(blueButtonGrid, {
    position: { x: 38.2, y: 7, z: 32.5 },
    scale: { x: 7, y: 7, z: 1 }
  })
  Material.setPbrMaterial(blueButtonGrid, {
    texture: Material.Texture.Common({
      src: 'images/blueButtonGrid.png'
    }),
    transparencyMode: MaterialTransparencyMode.MTM_ALPHA_TEST,
    alphaTest: 1,
    metallic: 0.1,
    albedoColor: { r: 1, g: 0, b: 12, a: 1 }
  })
  Billboard.create(blueButtonGrid, {})
}
