import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { Label, Button, Input, ReactEcsRenderer, UiEntity } from '@dcl/sdk/react-ecs'
import { Game, WebsocketEvents, createGame, getGameList, getLoginCode, joinGame, nukeGame, pauseGame, startGame } from './utils'
import { getPlayer } from '@dcl/sdk/src/players'
import { getUserData } from '~system/UserIdentity'

export function setupUi() {
  ReactEcsRenderer.setUiRenderer(uiComponent)
}

export async function createWebsocket() {
  const ws = new WebSocket('wss://bingo.dcl.guru/ws')
  const userData = await getUserData({})
  const loginCode = await getLoginCode()
  ws.onmessage = async (event) => {
    const data = JSON.parse(event.data) as WebsocketEvents
    if (data.type === 'authRequired') {
      return ws.send(JSON.stringify({ type: 'auth', address: userData.data?.userId, loginCode }))
    }
    switch (data.type) {
      case 'authSuccess':
        console.log('Auth success')
        break
      case 'gameStarted':
        console.log('Game started', data.id)
        break
      case 'gamePaused':
        console.log('Game paused', data.id)
        break
      case 'gameUnpaused':
        console.log('Game unpaused', data.id)
        break
      case 'gameEnded':
        console.log('Game ended', data.id)
        break
      case 'playerJoined':
        console.log('Player joined', data.id, data.address)
        break
      case 'playerLeft':
        console.log('Player left', data.id, data.address)
        break
      case 'numberDrawn':
        console.log('Number drawn', data.id, data.number)
        break
      case 'bingo':
        console.log('Bingo', data.id, data.address, data.combinaison)
        break
    }
  }
  return ws
}


let newGameName = ''
let currentGame: Game | null = null
let gameList: Game[] = []
let bingoNumbers: number[] = []
bingoNumbers = Array.from({ length: 90 }, () => Math.floor(Math.random() * 100)) // test
let playerCardCheck: [number, boolean][] = []

let showMenu = true
let showJoinGameMenu = false
let showNewGameMenu = false
let showRulesMenu = false
let showLeaderboardsMenu = false
let showAdminMenu = false

let playerInGame = false
let showPlayerCard = false
let showBingoBoard = false
let currentMenu: 'main' | 'player' = 'main'

let currentGameListIndex = 0
let currentGames: Game[] = []

const updateCurrentGames = () => {
  currentGames = gameList.slice(currentGameListIndex, currentGameListIndex + 4)
}

const handleGameListUpClick = () => {
  currentGameListIndex = Math.max(0, currentGameListIndex - 1)
  updateCurrentGames()
}

const handleGameListDownClick = () => {
  currentGameListIndex = Math.min(gameList.length - 4, currentGameListIndex + 1)
  updateCurrentGames()
}

const handleUpdatePlayerCard = (playerId: string) => {
  if (!currentGame) return
  const flattenedBoard = currentGame.players[playerId].board.flat().map((num) => (num === null ? 0 : num))
  playerCardCheck = flattenedBoard?.map((number) => [number, false])
  console.log(playerCardCheck)
}

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
          gameList = await getGameList()
          currentGames = gameList.slice(currentGameListIndex, currentGameListIndex + 4)
          console.log(gameList)
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
          newGameName = ''
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
        justifyContent: 'flex-end',
        positionType: 'absolute',
        position: {
          right: '1%',
          bottom: '1%'
        },
        width: 1254.4,
        height: 716.8
      }}
      uiBackground={{
        textureMode: 'stretch',
        texture: {
          src: 'images/joinGameMenu.png'
        }
      }}
    >
      <UiEntity
        uiTransform={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          positionType: 'absolute',
          position: { top: '20%' },
          width: 1000,
          height: 350
        }}
      >
        <UiEntity
          uiTransform={{
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {currentGames.map((game, index) => (
            <UiEntity
              key={index}
              uiTransform={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                width: 1000,
                height: 350
              }}
            >
              <Label
                uiTransform={{
                  width: 279.75,
                  height: 61.5,
                  margin: {
                    top: '7%'
                  }
                }}
                uiBackground={{
                  textureMode: 'stretch',
                  texture: {
                    src: 'images/button.png'
                  }
                }}
                value={game.name.length > 18 ? game.name.slice(0, 18) + '...' : game.name}
                fontSize={24}
                onMouseDown={async () => {
                  const myPlayer = getPlayer()
                  console.log('Joining game', game.id)
                  currentGame = game
                  handleUpdatePlayerCard(myPlayer?.userId || '')
                  if (myPlayer && game.admin === myPlayer.userId) {
                    showAdminMenu = true
                    showJoinGameMenu = false
                  } else {
                    await joinGame(game.id)
                    currentMenu = 'player'
                    showJoinGameMenu = false
                    playerInGame = true
                  }
                }}
              />

              <Label
                uiTransform={{
                  width: 279.75,
                  height: 61.5,
                  margin: {
                    top: '7%'
                  }
                }}
                value={Object.keys(game.players).length.toString()}
                fontSize={32}
                color={Color4.Purple()}
                onMouseDown={async () => {
                  await joinGame(game.id)

                  currentMenu = 'player'
                  showJoinGameMenu = false
                  playerInGame = true
                }}
              />

              <Label
                uiTransform={{
                  width: 279.75,
                  height: 61.5,
                  margin: {
                    top: '7%'
                  }
                }}
                value={game.admin.substring(0, 10) + '...'}
                fontSize={24}
                color={Color4.Purple()}
                onMouseDown={async () => {
                  await joinGame(game.id)

                  currentMenu = 'player'
                  showJoinGameMenu = false
                  playerInGame = true
                }}
              />
            </UiEntity>
          ))}
        </UiEntity>
      </UiEntity>
      <Button
        uiTransform={{
          positionType: 'absolute',
          position: {
            top: '38%',
            right: '7%'
          },
          width: 50,
          height: 50
        }}
        uiBackground={{
          textureMode: 'stretch',
          texture: {
            src: 'images/buttonUp.png'
          }
        }}
        value=""
        variant="secondary"
        fontSize={24}
        onMouseDown={handleGameListUpClick}
      />
      <Button
        uiTransform={{
          positionType: 'absolute',
          position: {
            top: '45%',
            right: '7%'
          },
          width: 50,
          height: 50
        }}
        uiBackground={{
          textureMode: 'stretch',
          texture: {
            src: 'images/buttonDown.png'
          }
        }}
        value=""
        variant="secondary"
        fontSize={24}
        onMouseDown={handleGameListDownClick}
      />
      <Button
        uiTransform={{
          width: 279.75,
          height: 61.5,
          margin: {
            bottom: `7%`
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
        onChange={(e) => {
          newGameName = e
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
            src: 'images/createGame.png'
          }
        }}
        value=""
        variant="secondary"
        fontSize={24}
        onMouseDown={async () => {
          await createGame(newGameName, 10)
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
            // value={number[0] === 0 ? '' : number[0].toString()}
            value={number[0].toString()}
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
    <UiEntity // Admin Menu
      uiTransform={{
        display: showAdminMenu ? 'flex' : 'none',
        flexDirection: 'column',
        alignItems: 'center',
        positionType: 'absolute',
        position: {
          right: '0%',
          bottom: '0%'
        },
        width: 373.5,
        height: 751.5
      }}
      uiBackground={{
        textureMode: 'stretch',
        texture: {
          src: 'images/menuAdmin.png'
        }
      }}
    >
      <Button
        uiTransform={{
          width: 279.75,
          height: 61.5,
          position: {
            top: '40%'
          }
        }}
        value=""
        variant="secondary"
        fontSize={18}
        onMouseDown={async () => {
          if (!currentGame) return
          await startGame(currentGame.id)
        }}
        uiBackground={{
          textureMode: 'stretch',
          texture: {
            src: 'images/adminStart.png'
          }
        }}
      />
      <Button
        uiTransform={{
          width: 279.75,
          height: 61.5,
          position: {
            top: '43%'
          }
        }}
        value=""
        variant="secondary"
        fontSize={18}
        onMouseDown={async () => {
          if (!currentGame) return
          await pauseGame(currentGame.id)
        }}
        uiBackground={{
          textureMode: 'stretch',
          texture: {
            src: 'images/adminPause.png'
          }
        }}
      />
      <Button
        uiTransform={{
          width: 279.75,
          height: 61.5,
          position: {
            top: '46%'
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
            top: '49%'
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
            top: '52%'
          }
        }}
        value=""
        variant="secondary"
        fontSize={18}
        onMouseDown={() => {
          showAdminMenu = false
          showMenu = true
        }}
        uiBackground={{
          textureMode: 'stretch',
          texture: {
            src: 'images/back.png'
          }
        }}
      />
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
        const myPlayer = getPlayer()
        console.log(myPlayer && myPlayer.userId)
      }}
    />
    <Label // test button
      uiTransform={{
        display: 'flex',
        positionType: 'absolute',
        position: {
          right: '0%',
          top: '10%'
        },
        width: 50,
        height: 50
      }}
      value="Delete"
      fontSize={12}
      onMouseDown={async () => {
        await nukeGame()
      }}
    />
  </UiEntity>
)
