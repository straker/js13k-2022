import { Sprite, keyPressed, GameLoop } from './libs/kontra.mjs'
// eslint-disable-next-line no-unused-vars
import * as globals from './globals.js'
import init from './init.js'
import weapons from './tables/weapons.js'
import { getAngle } from './utils.js'

let { canvas } = init()
let sprites = []

let player = Sprite({
  x: canvas.width / 2,
  y: canvas.height / 2,
  width: 25,
  height: 50,
  color: 'orange',
  anchor: { x: 0.5, y: 0.5 },
  weapon: weapons[0],
  speed: 2,
  dt: 99, // high so first attack happens right away
  facingRot: 0,
  update() {
    let { weapon, x, y, speed } = this
    this.dx = this.dy = 0

    // support arrow keys, WASD, and ZQSD
    let dx = 0,
      dy = 0
    if (keyPressed(['arrowleft', 'a', 'q'])) {
      dx = -1
    } else if (keyPressed(['arrowright', 'd'])) {
      dx = 1
    }
    if (keyPressed(['arrowup', 'w', 'z'])) {
      dy = -1
    } else if (keyPressed(['arrowdown', 's'])) {
      dy = 1
    }

    if (dx || dy) {
      this.facingRot = getAngle(dx, dy)
      this.dx = dx ? speed * sin(this.facingRot) : 0
      this.dy = dy ? speed * -cos(this.facingRot) : 0
    }

    // attack
    if (++this.dt > weapon[2] && keyPressed('space')) {
      this.dt = 0
      let [, speed, size, ttl, update, render] = weapon[3]
      sprites.push(
        Sprite({
          speed,
          size,
          ttl,
          update,
          render,
          x,
          y,
          rotation: this.facingRot,
          anchor: { x: 0.5, y: 0.5 },
          dx: speed * sin(this.facingRot),
          dy: speed * -cos(this.facingRot)
        })
      )
      weapon[4].map(effect => effect(this))
    }

    this.advance()
  }
})

let loop = GameLoop({
  update() {
    player.update()
    sprites.map(sprite => sprite.update())
    sprites = sprites.filter(sprite => sprite.isAlive())
  },
  render() {
    player.render()
    sprites.map(sprite => sprite.render())
  }
})
loop.start()
