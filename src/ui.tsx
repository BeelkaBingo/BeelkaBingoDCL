import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { Label, Button, Input, ReactEcsRenderer, UiEntity } from '@dcl/sdk/react-ecs'
import { signedFetch } from '~system/SignedFetch'

export function setupUi() {
  ReactEcsRenderer.setUiRenderer(uiComponent)
}

let newGameName = ""
let gameList: any[] = []

let showMenu = true
let showJoinGameMenu = false
let showNewGameMenu = false
let showRulesMenu = false
let showLeaderboardsMenu = false

const uiComponent = () => (
  <UiEntity
    uiTransform={{
      display: 'flex',
      positionType: 'absolute',
      position: {
        right: '0%',
        top: '0%'
      },
      width: '75%',
      height: '100%'
    }}
  >
    <UiEntity
      uiTransform={{
        display: showMenu ? 'flex' : 'none',
        flexDirection: 'column',
        alignItems: 'center',
        positionType: 'absolute',
        position: {
          right: '0%',
          bottom: '0%'
        },
        width: 373.5,
        height: 691.5
      }}
      uiBackground={{
        textureMode: 'stretch',
        texture: {
          src: 'images/menu.png'
        }
      }}
    >
      <Button
        uiTransform={{
          width: 279.75,
          height: 61.5,
          position: {
            top: '44%'
          }
        }}
        value=""
        variant="secondary"
        fontSize={18}
        onMouseDown={async () => {
          await signedFetch({
            url: "https://bingo.dcl.guru/games/active", init: {
              method: "GET",
              headers: {}
            }
          }).then((res) => {
            gameList = JSON.parse(res.body)
            console.log(gameList);
          })
          showMenu = false
          showJoinGameMenu = true
        }}
        uiBackground={{
          textureMode: 'stretch',
          texture: {
            src: 'images/joinGame.png'
          }
        }}
      />
      <Button
        uiTransform={{
          width: 279.75,
          height: 61.5,
          position: {
            top: '47%'
          }
        }}
        value=""
        variant="secondary"
        fontSize={18}
        onMouseDown={() => {
          showMenu = false
          showNewGameMenu = true
        }}
        uiBackground={{
          textureMode: 'stretch',
          texture: {
            src: 'images/newGame.png'
          }
        }}
      />
      <Button
        uiTransform={{
          width: 279.75,
          height: 61.5,
          position: {
            top: '50%'
          }
        }}
        value=""
        variant="secondary"
        fontSize={18}
        onMouseDown={() => {
          showMenu = false
          showRulesMenu = true
        }}
        uiBackground={{
          textureMode: 'stretch',
          texture: {
            src: 'images/rules.png'
          }
        }}
      />
      <Button
        uiTransform={{
          width: 279.75,
          height: 61.5,
          position: {
            top: '53%'
          }
        }}
        value=""
        variant="secondary"
        fontSize={18}
        onMouseDown={() => {
          showMenu = false
          showLeaderboardsMenu = true
        }}
        uiBackground={{
          textureMode: 'stretch',
          texture: {
            src: 'images/leaderboards.png'
          }
        }}
      />
    </UiEntity>
    <UiEntity // Join Game
      uiTransform={{
        display: showJoinGameMenu ? 'flex' : 'none',
        flexDirection: 'column',
        alignItems: 'center',
        positionType: 'absolute',
        position: {
          right: '0%',
          bottom: '0%'
        },
        width: 480,
        height: 480
      }}
      uiBackground={{
        textureMode: 'stretch',
        texture: {
          src: 'images/menuGames.png'
        }
      }}
      onMouseDown={async () => {
        showMenu = true
        showJoinGameMenu = false
      }}
    >
      {gameList.map((i) => (
        <Label
          key={i.id}
          uiTransform={{
            width: 279.75,
            height: 61.5,
            margin: {
              top: i === 1 ? `10%` : `4%`
            }
          }}
          uiBackground={{
            textureMode: 'stretch',
            texture: {
              src: 'images/button.png'
            }
          }}
          value={i.name}
          fontSize={24}
          onMouseDown={() => { }}
        />
      ))}
    </UiEntity>
    <UiEntity // New Game
      uiTransform={{
        display: showNewGameMenu ? 'flex' : 'none',
        flexDirection: 'column',
        alignItems: 'center',
        positionType: 'absolute',
        position: {
          right: '0%',
          bottom: '0%'
        },
        width: 480,
        height: 480
      }}
      uiBackground={{
        textureMode: 'stretch',
        texture: {
          src: 'images/menuGames.png'
        }
      }}
    >
      <Label
        uiTransform={{
          width: 279.75,
          height: 61.5,
          margin: {
            top: `10%`
          }
        }}
        value=""
        fontSize={24}
        uiBackground={{
          textureMode: 'stretch',
          texture: {
            src: 'images/enterGamesName.png'
          }
        }}
      />
      <Input
        uiTransform={{
          width: 279.75,
          height: 61.5,
          margin: {
            top: `1%`
          }
        }}
        color={Color4.White()}
        placeholderColor={Color4.White()}
        placeholder="Enter games name"
        fontSize={24}
        value=""
        onChange={(e) => {newGameName = e}}
      />
      <Button
        uiTransform={{
          width: 279.75,
          height: 61.5,
          margin: {
            top: `4%`
          }
        }}
        uiBackground={{
          textureMode: 'stretch',
          texture: {
            src: 'images/createGame.png'
          }
        }}
        value=""
        variant="secondary"
        fontSize={24}
        onMouseDown={async () => {
          await signedFetch({
            url: "https://bingo.dcl.guru/game", init: {
              method: "POST",
              body: JSON.stringify({
                name: newGameName
              }),
              headers: {}
            }
          })
          newGameName = ""
          showMenu = true
          showNewGameMenu = false
        }}
      />
      <Button
        uiTransform={{
          width: 279.75,
          height: 61.5,
          margin: {
            top: `4%`
          }
        }}
        uiBackground={{
          textureMode: 'stretch',
          texture: {
            src: 'images/back.png'
          }
        }}
        value=""
        variant="secondary"
        fontSize={24}
        onMouseDown={() => {
          showMenu = true
          showNewGameMenu = false
        }}
      />
    </UiEntity>
    <UiEntity // Rules
      uiTransform={{
        display: showRulesMenu ? 'flex' : 'none',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        positionType: 'absolute',
        position: {
          right: '10%',
          bottom: '10%'
        },
        width: 1254.4,
        height: 716.8
      }}
      uiBackground={{
        textureMode: 'stretch',
        texture: {
          src: 'images/rulesBoard.png'
        }
      }}
    >
      <Button
        uiTransform={{
          width: 279.75,
          height: 61.5,
          position: {
            bottom: '3.5%'
          }
        }}
        uiBackground={{
          textureMode: 'stretch',
          texture: {
            src: 'images/back.png'
          }
        }}
        value=""
        variant="secondary"
        fontSize={24}
        onMouseDown={() => {
          showMenu = true
          showRulesMenu = false
        }}
      />
    </UiEntity>
    <UiEntity // Leaderboards
      uiTransform={{
        display: showLeaderboardsMenu ? 'flex' : 'none',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        positionType: 'absolute',
        position: {
          right: '10%',
          bottom: '10%'
        },
        width: 1254.4,
        height: 716.8
      }}
      uiBackground={{
        textureMode: 'stretch',
        texture: {
          src: 'images/leaderboardsBoard.png'
        }
      }}
    >
      <Button
        uiTransform={{
          width: 279.75,
          height: 61.5,
          position: {
            bottom: '3.5%'
          }
        }}
        uiBackground={{
          textureMode: 'stretch',
          texture: {
            src: 'images/back.png'
          }
        }}
        value=""
        variant="secondary"
        fontSize={24}
        onMouseDown={() => {
          showMenu = true
          showLeaderboardsMenu = false
        }}
      />
    </UiEntity>
  </UiEntity>
)
