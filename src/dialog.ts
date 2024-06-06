import { Dialog } from 'dcl-npc-toolkit'

export let welcomeScript: Dialog[] = [
  {
    text: `Hi there! Welcome to Beelka Bingo.`,
    // portrait: {
    //   path: 'images/npc.png'
    // }
  },
  {
    text: `Would you like a tutorial on how to play?`,
    isQuestion: true,
    buttons: [
      { label: `Yes!`, goToDialog: 3 },
      { label: `No`, goToDialog: 2 }
      // { label: `Test2`, goToDialog: 4, triggeredActions:()=>{
      //   console.log('Test2')
      // } }
    ]
  },
  {
    text: `Ok, enjoy your time at Beelka Bingo!`,
    isEndOfDialog: true,
    name: 'testing'
  },
  {
    text: `Click on "New Game" to create a new bingo game.`
  },
  {
    text: `Enter the name of the game and click "Create Game".`
  },
  {
    text: 'Click on "Join Game" to join a game that has already been created.'
  },
  {
    text: 'Click on the name of a game that you would like to join. If you created the game, then you will be the host.'
  },
  {
    text: 'The host can start and pause games as well as play in the game that they are hosting.'
  },
  {
    text: 'You can invite some friends to join the game you are hosting before starting a new round of bingo!'
  },
  {
    text: 'Have fun and enjoy your time at Beelka Bingo!',
    isEndOfDialog: true
  }
]
