import { signedFetch } from '~system/SignedFetch'
import { getUserData } from '~system/UserIdentity'

export async function nukeGame() {
  const res = await signedFetch({
    url: 'https://bingo.dcl.guru/nuke',
    init: {
      method: 'POST',
      headers: {}
    }
  })
  const body = await res.body
  return JSON.parse(body) as stringResult
}
export async function joinGame(gameId: string) {
  const res = await signedFetch({
    url: 'https://bingo.dcl.guru/game/' + gameId + '/join',
    init: {
      method: 'POST',
      headers: {}
    }
  })
  const body = await res.body
  return JSON.parse(body) as stringResult
}
export async function clickCell(gameId: string, number: number) {
  const res = await signedFetch({
    url: 'https://bingo.dcl.guru/game/' + gameId + '/click',
    init: {
      method: 'POST',
      headers: {},
      body: JSON.stringify({
        number: number
      })
    }
  })
  const body = await res.body
  return JSON.parse(body) as stringResult
}
export async function createGame(name: string, callingSpeed: number) {
  const res = await signedFetch({
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
  const body = await res.body
  return JSON.parse(body) as { success: boolean; game: Game }
}
export async function pauseGame(gameId: string) {
  const res = await signedFetch({
    url: 'https://bingo.dcl.guru/game/' + gameId + '/pause',
    init: {
      method: 'POST',
      headers: {}
    }
  })
  const body = await res.body
  return JSON.parse(body) as stringResult
}
export async function startGame(gameId: string) {
  const res = await signedFetch({
    url: 'https://bingo.dcl.guru/game/' + gameId + '/start',
    init: {
      method: 'POST',
      headers: {}
    }
  })
  const body = await res.body
  return JSON.parse(body) as stringResult
}
export async function getGame(gameId: string) {
  const res = await signedFetch({
    url: 'https://bingo.dcl.guru/game/' + gameId,
    init: {
      method: 'GET',
      headers: {}
    }
  })
  const body = await res.body
  return JSON.parse(body) as Game
}
export async function getGameList() {
  const res = await signedFetch({
    url: 'https://bingo.dcl.guru/games',
    init: {
      method: 'GET',
      headers: {}
    }
  })
  const body = await res.body
  return JSON.parse(body) as Game[]
}
export async function getActiveGamesList() {
  const res = await signedFetch({
    url: 'https://bingo.dcl.guru/games/active',
    init: {
      method: 'GET',
      headers: {}
    }
  })
  const body = await res.body
  return JSON.parse(body) as Game[]
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
  return JSON.parse(body).loginCode as string
}

export async function callBingo(gameId: string) {
  const res = await signedFetch({
    url: 'https://bingo.dcl.guru/game/' + gameId + '/check',
    init: {
      method: 'POST',
      headers: {}
    }
  })
  const body = await res.body
  return JSON.parse(body) as { success: boolean; message: string }
}


export interface Game {
  name: string
  id: string
  createdAt: Date
  startedAt?: Date
  endedAt?: Date
  type: string
  drawnNumbers: { number: number; date: Date; id: number }[]
  players: { [userId: string]: Board }
  admin: string
  rewards: Rewards[]
  callingSpeed: number
  paused: boolean
}

export interface Board {
  board: (number | null)[][]
  checkedNumbers: { number: number; date: Date; id: number }[]
  clickedNumbers: { number: number; date: Date; id: number }[]
}

export interface Rewards {
  combinaison: Combinaison
  rewardsServer: string
  campaignId: string
  campaignKey: string
  claimed?: { date: Date; ethAddress: string }
}

export enum Combinaison {
  SINGLE_LINE = 'singleLine',
  DOUBLE_LINES = 'doubleLines',
  FULL_HOUSE = 'fullHouse'
}

type stringResult = { success: true; board: [number[], number[], number[]] } | { success: false; error: string }

export type WebsocketEvents =
  | { type: 'authRequired' }
  | { type: 'authSuccess'; message: string }
  | { type: 'gameStarted'; id: string }
  | { type: 'gamePaused'; id: string }
  | { type: 'gameUnpaused'; id: string }
  | { type: 'gameEnded'; id: string }
  | { type: 'playerJoined'; id: string; address: string }
  | { type: 'playerLeft'; id: string; address: string }
  | { type: 'numberDrawn'; id: string; number: number }
  | { type: 'bingo'; id: string; address: string; combinaison: "fullHouse"|"line"|"doubleLines" }
