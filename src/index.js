import { Sprite, keyPressed, GameLoop } from '../node_modules/kontra/kontra.mjs'
import init from './init.js'

let { canvas } = init()

let player = Sprite({
  x: canvas.width / 2,
  y: canvas.height / 2,
  width: 25,
  height: 50,
  color: 'red',
  anchor: { x: 0.5, y: 0.5 },
  update() {
    this.dx = this.dy = 0

    // support arrow keys, WASD, and ZQSD
    if (keyPressed('arrowleft') || keyPressed('a') || keyPressed('q')) {
      this.dx = -3
    } else if (keyPressed('arrowright') || keyPressed('d')) {
      this.dx = 3
    }
    if (keyPressed('arrowup') || keyPressed('w') || keyPressed('z')) {
      this.dy = -3
    } else if (keyPressed('arrowdown') || keyPressed('s')) {
      this.dy = 3
    }

    this.advance()
  }
})

let loop = GameLoop({
  update() {
    player.update()
  },
  render() {
    player.render()
  }
})
loop.start()
