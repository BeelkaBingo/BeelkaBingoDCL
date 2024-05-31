import {
  Billboard,
  engine,
  GltfContainer,
  Material,
  MaterialTransparencyMode,
  MeshRenderer,
  Transform
} from '@dcl/sdk/ecs'
import { bingoNumbers, bingoNumbersTest, setupUi } from './ui'
import { Color4 } from '@dcl/sdk/math'

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

  // const blueButtonGrid = engine.addEntity()
  // MeshRenderer.setPlane(blueButtonGrid)
  // Transform.create(blueButtonGrid, {
  //   position: { x: 38.2, y: 7, z: 32.5 },
  //   scale: { x: 7, y: 7, z: 1 }
  // })
  // Material.setPbrMaterial(blueButtonGrid, {
  //   texture: Material.Texture.Common({
  //     src: 'images/blueButtonGrid.png'
  //   }),
  //   transparencyMode: MaterialTransparencyMode.MTM_ALPHA_TEST,
  //   alphaTest: 1,
  //   metallic: 0.1,
  //   albedoColor: { r: 1, g: 0, b: 12, a: 1 }
  // })
  // Billboard.create(blueButtonGrid, {})

  // bingoNumbersTest.forEach((number, index) => {
  //   createCube(38.2 + (index % 5) * 7, 7, 32.5 - Math.floor(index / 5) * 7, number)
  // })

  function createNumbers(number: number, index: number) {
    const numberEntity = engine.addEntity()
    MeshRenderer.setPlane(numberEntity)
    Transform.create(numberEntity, {
      position: { x: 40 - index , y: 5, z: 32.5 },
      scale: { x: 1, y: 1, z: 1 }
    })
    Material.setPbrMaterial(numberEntity, {
      texture: Material.Texture.Common({
        src: 'images/numbers/' + number + '.png'
      }),
      transparencyMode: MaterialTransparencyMode.MTM_ALPHA_TEST,
      alphaTest: 1,
      metallic: 0.1,
      // albedoColor: { r: 0, g: 0, b: 0, a: 1 }
    })
    Billboard.create(numberEntity, {})
  }

  bingoNumbersTest.forEach((number, index) => {
    createNumbers(number, index)
  })
}
