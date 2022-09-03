import { randInt, GameLoop, Button, Text } from './libs/kontra.mjs'
import abilityTable from './tables/abilities.js'

// taking drop rate algorithm from slay the spire
// @see https://docs.google.com/spreadsheets/d/1ZsxNXebbELpcCi8N7FVOTNGdX_K9-BRC_LMgx4TORo4/edit#gid=113279270
let statCommonPercent = 60,
  startUncommonPercent = 37,
  startRarePercent = 3,
  commonPercent = statCommonPercent,
  uncommonPercent = startUncommonPercent,
  rarePercent = startRarePercent,
  abilities = [],
  texts = [],
  loop = GameLoop({
    clearCanvas: false,
    render() {
      context.save()
      context.globalAlpha = 0.75
      context.fillStyle = '#333'
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.restore()

      abilities.map(ability => ability.render())
      texts.map(text => text.render())
    }
  })

export function levelUp(cb) {
  abilities = [
    Button({
      x: canvas.height - 100,
      y: canvas.width / 2,
      padX: 10,
      padY: 10,
      color: 'white',
      text: {
        text: 'Skip',
        color: '#333',
        font: '18px Arial'
      }
    })
  ]
  texts = []
  getAbilities(ability => {
    loop.stop()
    abilities.map(ability => ability.destroy())
    abilities = []
    cb(ability)
  })
  texts.push(
    Text({
      x: canvas.width / 2,
      y: 100,
      text: 'Choose a Card',
      font: '26px Arial',
      color: 'white',
      anchor: { x: 0.5, y: 0.5 }
    })
  )
  loop.start()
}

function getAbilities(cb) {
  for (let i = 0; i < 3; i++) {
    let rand = random() * 100,
      x = canvas.width / 2 - 200 + 200 * i,
      y = canvas.height / 2,
      rarity,
      availableAbilities,
      ability
    if (rand <= rarePercent) {
      rarity = 2
      commonPercent = statCommonPercent
      uncommonPercent = startUncommonPercent
      rarePercent = startRarePercent
    } else if (rand <= rarePercent + uncommonPercent) {
      rarity = 1
    } else {
      rarity = 0
      rarePercent++
      if (commonPercent) {
        commonPercent--
      } else {
        uncommonPercent--
      }
    }

    availableAbilities = abilityTable.filter(ability => ability[1] == rarity)
    do {
      ability = availableAbilities[randInt(0, availableAbilities.length - 1)]
      // don't let the same ability appear twice for selection
    } while (abilities.find(ab => ab.ability == ability))

    abilities.push(
      Button({
        x,
        y,
        ability,
        width: 150,
        height: 200,
        color: rarity == 0 ? 'lightgrey' : rarity == 1 ? 'lightblue' : 'gold',
        text: {
          y: 10,
          text: ability[2],
          color: '#333',
          width: 115,
          font: '14px Arial',
          lineHeight: 1.25,
          anchor: { x: 0.5, y: 0 }
        },
        anchor: { x: 0.5, y: 0.5 },
        onUp() {
          cb(ability)
        },
        render() {
          this.draw()

          context.fillStyle = 'white'
          context.fillRect(10, this.height / 2, this.width - 20, 90)

          context.fillStyle = '#333'
          context.strokeStyle = '#333'
          context.fillRect(10, 10, this.width - 20, 75)
          context.strokeRect(10, this.height / 2, this.width - 20, 90)

          if (this.focused || this.hovered) {
            this.context.lineWidth = 3
            this.context.strokeStyle = 'orange'
            this.context.strokeRect(-5, -5, this.width + 10, this.height + 10)
          }
        }
      })
    )
  }
}
