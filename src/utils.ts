import { signedFetch } from '~system/SignedFetch'
import { getUserData } from '~system/UserIdentity'

export async function joinGame(gameId: string) {
  return await signedFetch({
    url: 'https://bingo.dcl.guru/game/' + gameId + '/join',
    init: {
      method: 'POST',
      headers: {}
    }
  })
}
export async function clickCell(gameId: string, number: number) {
  return signedFetch({
    url: 'https://bingo.dcl.guru/game/' + gameId + '/click',
    init: {
      method: 'POST',
      headers: {},
      body: JSON.stringify({
        number: number
      })
    }
  })
}
export async function createGame(name: string, callingSpeed: number) {
  return signedFetch({
    url: 'https://bingo.dcl.guru/game',
    init: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: name,
        callingSpeed: callingSpeed
      })
    }
  })
}
export async function pauseGame(gameId: string) {
  return signedFetch({
    url: 'https://bingo.dcl.guru/game/' + gameId + '/pause',
    init: {
      method: 'POST',
      headers: {}
    }
  })
}
export async function startGame(gameId: string) {
  return signedFetch({
    url: 'https://bingo.dcl.guru/game/' + gameId + '/start',
    init: {
      method: 'POST',
      headers: {}
    }
  })
}
export async function getGame(gameId: string) {
  return signedFetch({
    url: 'https://bingo.dcl.guru/game/' + gameId,
    init: {
      method: 'GET',
      headers: {}
    }
  })
}
export async function getGameList() {
  return signedFetch({
    url: 'https://bingo.dcl.guru/games',
    init: {
      method: 'GET',
      headers: {}
    }
  })
}
export async function getActiveGamesList() {
  return signedFetch({
    url: 'https://bingo.dcl.guru/games/active',
    init: {
      method: 'GET',
      headers: {}
    }
  })
}
export async function getLoginCode() {
  const res = await signedFetch({
    url: 'https://bingo.dcl.guru/login',
    init: {
      method: 'GET',
      headers: {}
    }
  })
  const body = await res.body
  return JSON.parse(body).loginCode
}

export async function callBingo(gameId: string) {
  return signedFetch({
    url: 'https://bingo.dcl.guru/game/' + gameId + '/check',
    init: {
      method: 'POST',
      headers: {}
    }
  })
}

export async function createWebsocket() {
  const ws = new WebSocket('wss://bingo.dcl.guru/ws')
  const userData = await getUserData({})
  const loginCode = await getLoginCode()
  ws.onopen = () => {
    ws.send(JSON.stringify({ type: 'auth', address: userData.data?.userId, loginCode }))
  }
  return ws
}
