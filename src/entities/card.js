import { Button } from '../libs/kontra.mjs'

export function spawnCard(x, y, ability, cb) {
  return Button({
    x,
    y,
    ability,
    width: 150,
    height: 200,
    color:
      ability[0] == 0 ? 'lightgrey' : ability[0] == 1 ? 'lightblue' : 'gold',
    text: {
      y: 8,
      text: ability[1],
      color: '#333',
      width: 115,
      font: '13px Arial',
      lineHeight: 1.25,
      anchor: { x: 0.5, y: 0 }
    },
    anchor: { x: 0.5, y: 0.5 },
    onUp() {
      cb && cb(ability)
    },
    render() {
      this.draw()

      context.fillStyle = 'white'
      context.fillRect(10, this.height / 2, this.width - 20, 90)

      context.fillStyle = '#333'
      context.strokeStyle = '#333'
      context.fillRect(10, 10, this.width - 20, 75)
      context.strokeRect(10, this.height / 2, this.width - 20, 90)

      if (cb && (this.focused || this.hovered)) {
        context.lineWidth = 3
        context.strokeStyle = 'orange'
        context.strokeRect(-5, -5, this.width + 10, this.height + 10)
      }
    }
  })
}
