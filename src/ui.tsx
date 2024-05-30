import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { Label, Button, Input, ReactEcsRenderer, UiEntity } from '@dcl/sdk/react-ecs'
import { signedFetch } from '~system/SignedFetch'

export function setupUi() {
  ReactEcsRenderer.setUiRenderer(uiComponent)
}

let newGameName = ''
let gameList: any[] = []
let bingoNumbers: number[] = []
bingoNumbers = Array.from({ length: 90 }, () => Math.floor(Math.random() * 100)) // test
let playerCard: number[] = []
playerCard = [5, 0, 0, 3, 0, 12, 0, 25, 35, 0, 0, 2, 0, 0, 40, 55, 32, 67, 11, 22, 0, 4, 72, 0, 80, 0, 0]
let playerCardCheck: [number, boolean][] = []
playerCardCheck = playerCard.map((number) => [number, false])

let showMenu = true
let showJoinGameMenu = false
let showNewGameMenu = false
let showRulesMenu = false
let showLeaderboardsMenu = false

let playerInGame = false
let showPlayerCard = false
let showBingoBoard = false
let currentMenu: 'main' | 'player' = 'main'

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
    <UiEntity // Main Menu
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
            url: 'https://bingo.dcl.guru/games/active',
            init: {
              method: 'GET',
              headers: {}
            }
          }).then((res) => {
            gameList = JSON.parse(res.body)
            console.log(gameList)
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
    >
      {gameList.map((game, index) => (
        <Label
          key={game.id}
          uiTransform={{
            width: 279.75,
            height: 61.5,
            margin: {
              top: index === 0 ? `10%` : `4%`
            }
          }}
          uiBackground={{
            textureMode: 'stretch',
            texture: {
              src: 'images/button.png'
            }
          }}
          value={game.name}
          fontSize={24}
          onMouseDown={async () => {
            await signedFetch({
              url: "https://bingo.dcl.guru/game/" + game.id + "/join", init: {
                method: "POST",
                headers: {}
              }
            })
            showJoinGameMenu = false
            showMenu = true
          }}
        />
      ))}
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
          showJoinGameMenu = false
        }}
      />
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
        onChange={(e) => { newGameName = e }}
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
            url: 'https://bingo.dcl.guru/game',
            init: {
              method: 'POST',
              body: JSON.stringify({
                name: newGameName
              }),
              headers: {}
            }
          })
          newGameName = ''
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
          if (currentMenu === 'main') {
            showMenu = true
            showRulesMenu = false
          } else if (currentMenu === 'player') {
            playerInGame = true
            showRulesMenu = false
          }
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
    <UiEntity // Player in game
      uiTransform={{
        display: playerInGame ? 'flex' : 'none',
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
        onMouseDown={() => {
          showPlayerCard = !showPlayerCard
        }}
        uiBackground={{
          textureMode: 'stretch',
          texture: {
            src: showPlayerCard ? 'images/bingoCardHide.png' : 'images/bingoCardView.png'
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
          showBingoBoard = !showBingoBoard
        }}
        uiBackground={{
          textureMode: 'stretch',
          texture: {
            src: showBingoBoard ? 'images/bingoBoardHide.png' : 'images/bingoBoardView.png'
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
          showRulesMenu = true
          showBingoBoard = false
          showPlayerCard = false
          playerInGame = false
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
        onMouseDown={() => {}}
        uiBackground={{
          textureMode: 'stretch',
          texture: {
            src: 'images/leaveGame.png'
          }
        }}
      />
    </UiEntity>
    <UiEntity // Player Card
      uiTransform={{
        display: showPlayerCard ? 'flex' : 'none',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        positionType: 'absolute',
        position: {
          right: '35%',
          bottom: '1%'
        },
        width: 814.5,
        height: 384.3
      }}
      uiBackground={{
        textureMode: 'stretch',
        texture: {
          src: 'images/playerCard.png'
        }
      }}
    >
      <UiEntity
        uiTransform={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          flexWrap: 'wrap',
          alignContent: 'center',
          justifyContent: 'center',
          positionType: 'relative',
          position: { top: '3%' },
          width: 711,
          height: 384.3
        }}
      >
        {playerCardCheck.map((number, index) => (
          <Label
            key={index}
            uiTransform={{
              width: 75,
              height: 75,
              margin: {
                left: 2,
                right: 2
              }
            }}
            uiBackground={{
              textureMode: 'stretch',
              texture: {
                src:
                  number[1] === true
                    ? 'images/acorns1.png'
                    : number[0] === 0
                    ? 'images/cellBlue.png'
                    : 'images/cellPink.png'
              }
            }}
            value={number[0] === 0 ? '' : number[0].toString()}
            fontSize={24}
            onMouseDown={() => {
              number[1] = true
            }}
          />
        ))}
      </UiEntity>

      <Button
        uiTransform={{
          width: 279.75,
          height: 61.5,
          position: {
            bottom: '4%'
          }
        }}
        uiBackground={{
          textureMode: 'stretch',
          texture: {
            src: 'images/bingoWin.png'
          }
        }}
        value=""
        variant="secondary"
        onMouseDown={() => {}}
      />
    </UiEntity>
    <UiEntity // Bingo Board
      uiTransform={{
        display: showBingoBoard ? 'flex' : 'none',
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        alignContent: 'flex-start',
        justifyContent: 'flex-start',
        positionType: 'absolute',
        position: {
          right: '34%',
          top: '1%'
        },
        width: 830,
        height: 830
      }}
    >
      {bingoNumbers.map((number, index) => (
        <Label
          key={index}
          uiTransform={{
            width: 55,
            height: 55
          }}
          uiBackground={{
            textureMode: 'stretch',
            texture: {
              src: 'images/cellPink.png'
            }
          }}
          value={number.toString()}
          fontSize={18}
          onMouseDown={() => {}}
        />
      ))}
    </UiEntity>
    <Label // test button
      uiTransform={{
        display: 'flex',
        positionType: 'absolute',
        position: {
          right: '0%',
          top: '5%'
        },
        width: 50,
        height: 50
      }}
      value="T"
      fontSize={12}
      onMouseDown={() => {
        if (currentMenu === 'main') {
          currentMenu = 'player'
        } else if (currentMenu === 'player') {
          currentMenu = 'main'
        }
        showMenu = !showMenu
        showJoinGameMenu = false
        showNewGameMenu = false
        showRulesMenu = false
        showLeaderboardsMenu = false
        playerInGame = !playerInGame
      }}
    />
  </UiEntity>
)
