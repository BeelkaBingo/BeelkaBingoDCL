import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { Label, Button, Input, ReactEcsRenderer, UiEntity } from '@dcl/sdk/react-ecs'
import { AudioSource, engine } from '@dcl/sdk/ecs'
import {
  Game,
  WebsocketEvents,
  callBingo,
  clickCell,
  createGame,
  getActiveGamesList,
  getGame,
  getLoginCode,
  joinGame,
  nukeGame,
  pauseGame,
  startGame
} from './utils'
import { getPlayer } from '@dcl/sdk/src/players'
import { getUserData } from '~system/UserIdentity'
import { createNumbers, removeAllCreatedEntities } from '.'

export function setupUi() {
  ReactEcsRenderer.setUiRenderer(uiComponent)
  createWebsocket()
}

let myPlayer = getPlayer()
let newGameName = ''
let currentGame: Game | null = null
let gameList: Game[] = []
export let bingoNumbers: number[] = []
let playerCardCheck: [number, boolean][] = []

let isGameStarted = false
let showMenu = true
let showJoinGameMenu = false
let showNewGameMenu = false
let showRulesMenu = false
let showLeaderboardsMenu = false
let showAdminMenu = false

let playerInAnotherGame = ''
let playerInAnotherGameId = ''
let playerInGame = false
let showPlayerCard = false
let showBingoBoard = false
let currentMenu: 'main' | 'player' = 'main'

let currentGameListIndex = 0
let currentGames: Game[] = []

let gamePaused = true

const bingoSoundEntity = engine.addEntity()
AudioSource.create(bingoSoundEntity, {
  audioClipUrl: 'sounds/bingoVoice.mp3',
  loop: false,
  playing: false,
  volume: 1
})
function playBingoSound() {
  const audioSource = AudioSource.getMutable(bingoSoundEntity)
  audioSource.playing = true
}

const generateBingoNumbers = () => {
  return bingoNumbers.map((number, index) => (
    <Label
      key={index}
      uiTransform={{ width: 55, height: 55 }}
      uiBackground={{
        textureMode: 'stretch',
        texture: { src: 'images/cellPink.png' }
      }}
      value={number.toString()}
      fontSize={18}
    />
  ))
}

export async function createWebsocket() {
  const userData = await getUserData({})
  const ws = new WebSocket('wss://bingo.dcl.guru/ws')

  ws.onmessage = async (event) => {
    console.log(event)
    const data = JSON.parse(event.data) as WebsocketEvents
    console.log(data)

    if (data.type === 'authRequired') {
      const loginCode = await getLoginCode()
      console.log(loginCode)

      ws.send(JSON.stringify({ type: 'auth', address: userData.data?.userId, loginCode }))
    }
    switch (data.type) {
      case 'authSuccess':
        console.log('Auth success')
        break
      case 'gameStarted':
        console.log('Game started', data.id)
        gamePaused = false
        break
      case 'gamePaused':
        console.log('Game paused', data.id)
        gamePaused = true
        break
      case 'gameUnpaused':
        console.log('Game unpaused', data.id)
        gamePaused = false
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
        console.log('new number drawn', data.number)
        bingoNumbers.push(data.number)
        generateBingoNumbers()
        console.log(bingoNumbers)
        bingoNumbers.forEach((number, index) => {
          createNumbers(number, index)
        })
        break
      case 'bingo':
        console.log('Bingo', data.id, data.address, data.combinaison)
        break
    }
  }
  return ws
}

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
  if (!currentGame.players[playerId]) return
  const flattenedBoard = currentGame.players[playerId].board.flat().map((num) => (num === null ? 0 : num))
  playerCardCheck = flattenedBoard?.map((number) => [number, false])
  console.log(playerCardCheck)
}

const handleJoinGame = async (gameId: string, isAdmin: boolean) => {
  const myPlayer = getPlayer()
  if (!myPlayer) return
  const joinedGame = await getGame(gameId)
  await joinGame(gameId)
  currentGame = joinedGame
  bingoNumbers.length = 0
  bingoNumbers.push(...currentGame.drawnNumbers.flatMap((num) => num.number))
  bingoNumbers.forEach((number, index) => {
    createNumbers(number, index)
  })
  isGameStarted = currentGame.startedAt !== undefined
  playerCardCheck = []

  if (isAdmin) {
    showAdminMenu = true
    showJoinGameMenu = false
  } else {
    currentMenu = 'player'
    showJoinGameMenu = false
    playerInGame = true
  }
}

const handlePlayerInAnotherGame = (games: Game[]) => {
  console.log('handlePlayerInAnotherGame', myPlayer?.userId)
  const gameNames = games
    .map((game) => {
      if (Object.keys(game.players).includes(myPlayer?.userId || '')) {
        playerInAnotherGameId = game.id
        return game.name
      } else {
        return ''
      }
    })
    .filter((name) => name !== '')
  return gameNames.join(', ')
}

const handleEnterGame = async (gameId: string) => {
  const gameToEnter = await getGame(gameId)
  currentGame = gameToEnter
  bingoNumbers.length = 0
  bingoNumbers.push(...currentGame.drawnNumbers.flatMap((num) => num.number))
  bingoNumbers.forEach((number, index) => {
    createNumbers(number, index)
  })
  isGameStarted = currentGame.startedAt !== undefined
  playerCardCheck = []

  if (myPlayer && currentGame.admin === myPlayer.userId) {
    showAdminMenu = true
    showJoinGameMenu = false
    playerInAnotherGame = ''
    playerInAnotherGameId = ''
  } else {
    currentMenu = 'player'
    showJoinGameMenu = false
    playerInGame = true
    playerInAnotherGame = ''
    playerInAnotherGameId = ''
  }
}

const handleClearCurrentGameData = () => {
  newGameName = ''
  currentGame = null
  gameList = []
  bingoNumbers = []
  playerCardCheck = []
  isGameStarted = false
  showMenu = true
  showJoinGameMenu = false
  showNewGameMenu = false
  showRulesMenu = false
  showLeaderboardsMenu = false
  showAdminMenu = false
  playerInGame = false
  showPlayerCard = false
  showBingoBoard = false
  currentMenu = 'main'
  currentGameListIndex = 0
  currentGames = []
  gamePaused = true

  removeAllCreatedEntities()
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
          myPlayer = getPlayer()
          gameList = await getActiveGamesList()
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
            flexDirection: 'column',
            margin: {
              top: '4%'
            }
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
                height: 'auto',
                margin: {
                  bottom: '1%'
                }
              }}
            >
              <Label
                uiTransform={{
                  width: 279.75,
                  height: 61.5
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
                  if (
                    currentGames.map((game) => Object.keys(game.players).includes(myPlayer?.userId || '')) &&
                    !Object.keys(game.players).includes(myPlayer?.userId || '')
                  ) {
                    playerInAnotherGame = handlePlayerInAnotherGame(currentGames)
                    showJoinGameMenu = false
                    console.log('playerInAnotherGame', playerInAnotherGame)
                    return
                  }

                  if (myPlayer && game.admin === myPlayer.userId) {
                    handleJoinGame(game.id, true)
                  } else {
                    handleJoinGame(game.id, false)
                  }
                }}
              />

              <Label
                uiTransform={{
                  width: 279.75,
                  height: 61.5
                }}
                value={
                  Object.keys(game.players).includes(myPlayer?.userId || '')
                    ? Object.keys(game.players).length.toString() + ' (Joined)'
                    : Object.keys(game.players).length.toString()
                }
                fontSize={32}
                color={Color4.Purple()}
              />

              <Label
                uiTransform={{
                  width: 279.75,
                  height: 61.5
                }}
                value={game.adminName.length > 18 ? game.adminName.slice(0, 18) + '...' : game.adminName}
                fontSize={24}
                color={Color4.Purple()}
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
          const adminName = getPlayer()
          console.log('adminName', adminName)
          await createGame(newGameName, 10, adminName?.name || 'Guest')
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
          newGameName = ''
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
        onMouseDown={async () => {
          if (!showPlayerCard) {
            currentGame = await getGame(currentGame?.id || '')
            console.log('bingo card toggle', currentGame)
            const myPlayer = getPlayer()
            handleUpdatePlayerCard(myPlayer?.userId || '')
          }
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
        onMouseDown={async () => {
          if (!showBingoBoard) {
            currentGame = await getGame(currentGame?.id || '')
            console.log('bingo board toggle', currentGame)
            bingoNumbers.length = 0
            bingoNumbers.push(...currentGame.drawnNumbers.flatMap((num) => num.number))
          }
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
        onMouseDown={() => {
          handleClearCurrentGameData()
        }}
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
            onMouseDown={async () => {
              console.log(number[0])
              let checkCell = await clickCell(currentGame?.id || '', number[0])
              console.log(checkCell)

              if (bingoNumbers.includes(number[0])) {
                number[1] = true
              }
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
        onMouseDown={async () => {
          playBingoSound()
          callBingo(currentGame?.id || '')
        }}
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
        height: 'auto'
      }}
    >
      {generateBingoNumbers()}
    </UiEntity>
    <UiEntity // Admin Menu
      uiTransform={{
        display: showAdminMenu ? 'flex' : 'none',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
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
      <Label
        uiTransform={{
          width: 279.75,
          height: 32,
          margin: {
            top: '48%'
          }
        }}
        value={'Game Name: ' + currentGame?.name || ''}
        fontSize={18}
      />
      <Label
        uiTransform={{
          display: isGameStarted ? 'flex' : 'none',
          width: 279.75,
          height: 32
        }}
        value={'Drawn Numbers: ' + bingoNumbers.length + ' / 90'}
        fontSize={18}
      />
      {/* <Label
        uiTransform={{
          display: isGameStarted ? 'flex' : 'none',
          width: 279.75,
          height: 32
        }}
        value={'Last Number: ' + currentGame?.drawnNumbers[currentGame?.drawnNumbers.length - 1].number || ''}
        fontSize={18}
      /> */}
      <Button
        uiTransform={{
          display: isGameStarted ? 'none' : 'flex',
          width: 279.75,
          height: 61.5,
          margin: {
            top: '4%'
          }
        }}
        value=""
        variant="secondary"
        fontSize={18}
        onMouseDown={async () => {
          if (!currentGame) return
          await startGame(currentGame.id)
          isGameStarted = true
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
          display: isGameStarted ? 'flex' : 'none',
          width: 279.75,
          height: 61.5,
          margin: {
            top: '4%'
          }
        }}
        value=""
        variant="secondary"
        fontSize={18}
        onMouseDown={async () => {
          currentGame = await getGame(currentGame?.id || '')
          if (!currentGame) return
          if (currentGame.paused) {
            gamePaused = false
            await startGame(currentGame.id)
          } else if (!currentGame.paused) {
            gamePaused = true
            await pauseGame(currentGame.id)
          }
        }}
        uiBackground={{
          textureMode: 'stretch',
          texture: {
            src: gamePaused ? 'images/adminResume.png' : 'images/adminPause.png'
          }
        }}
      />
      <Button
        uiTransform={{
          width: 279.75,
          height: 61.5,
          margin: {
            top: '4%'
          }
        }}
        value=""
        variant="secondary"
        fontSize={18}
        onMouseDown={async () => {
          if (!showPlayerCard) {
            currentGame = await getGame(currentGame?.id || '')
            console.log('bingo card toggle', currentGame)
            const myPlayer = getPlayer()
            handleUpdatePlayerCard(myPlayer?.userId || '')
          }
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
          margin: {
            top: '4%'
          }
        }}
        value=""
        variant="secondary"
        fontSize={18}
        onMouseDown={async () => {
          if (!showBingoBoard) {
            currentGame = await getGame(currentGame?.id || '')
            console.log('bingo board toggle', currentGame)
            bingoNumbers.length = 0
            bingoNumbers.push(...currentGame.drawnNumbers.flatMap((num) => num.number))
          }
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
          margin: {
            top: '4%'
          }
        }}
        value=""
        variant="secondary"
        fontSize={18}
        onMouseDown={() => {
          handleClearCurrentGameData()
        }}
        uiBackground={{
          textureMode: 'stretch',
          texture: {
            src: 'images/back.png'
          }
        }}
      />
    </UiEntity>
    <UiEntity // Player in another game
      uiTransform={{
        display: playerInAnotherGame != '' ? 'flex' : 'none',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
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
      <Label
        uiTransform={{
          width: 279.75,
          height: 61.5,
          margin: {
            top: '48%'
          }
        }}
        value={'You are already in the game:\n' + playerInAnotherGame}
        fontSize={18}
      />
      <Button
        uiTransform={{
          width: 279.75,
          height: 61.5,
          margin: {
            top: '4%'
          }
        }}
        value=""
        variant="secondary"
        fontSize={18}
        onMouseDown={async () => {
          handleEnterGame(playerInAnotherGameId)
        }}
        uiBackground={{
          textureMode: 'stretch',
          texture: {
            src: 'images/enterGame.png'
          }
        }}
      />
      <Button
        uiTransform={{
          width: 279.75,
          height: 61.5,
          margin: {
            top: '4%'
          }
        }}
        value=""
        variant="secondary"
        fontSize={18}
        onMouseDown={() => {
          playerInAnotherGame = ''
          showJoinGameMenu = true
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
        console.log(myPlayer && myPlayer)
        console.log(currentGame)
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
        console.log('Nuking game')
        await nukeGame()
      }}
    />
  </UiEntity>
)
