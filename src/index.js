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

/* read this for enemy movement logic: https://js13kgames.com/entries/back-to-life  for enemy */
let wraith = Sprite({
  speed: 3, //this is quite fast lol,
  hitPlayer: 0, // should increment by one on each hit
  x: canvas.width / 2, // spawn enemy outside of canvas,
  y: canvas.height, // spawn enemy outside of canvas,
  width: 20,
  height: 20,
  color: 'white',
  update: function (dt) {
    let dx = player.x - this.x // once this reaches 0 on the x axis == on the player
    let dy = player.y - this.y // once this reaches 0 on the y axis == on the player

    if (Math.abs(dx) > Math.abs(dy)) {
      this.dx = (dx / Math.abs(dx)) * this.speed
      // this.dy = 0
    } else {
      this.dy = (dy / Math.abs(dy)) * this.speed
      // this.dx = 0
    }

    this.advance(dt)

    if (this.isMeleeRange(player)) {
      // reason for 0.2 (if we have weapons that increase movement or spells) we'll always drop movement by 1
      // can be adjusted though
      player.speed -= 0.2
      this.hitPlayer++
      if (this.hitPlayer >= 5) {
        console.log('ROOTED!')
        player.speed = 0
        // not sure if this is the right approach
        setTimeout(() => {
          player.speed = 2
          this.hitPlayer = 0 // reset player hit
          console.log('Reset root')
        }, 3000)
      }
    }
  },
  isMeleeRange: function (player) {
    let dx = Math.abs(player.x - this.x)
    let dy = Math.abs(player.y - this.y)

    return Math.max(dx, dy) <= 3 // is in melee range
  }
})

let loop = GameLoop({
  update() {
    player.update()
    wraith.update()
    sprites.map(sprite => sprite.update())
    sprites = sprites.filter(sprite => sprite.isAlive())
  },
  render() {
    player.render()
    wraith.render()
    sprites.map(sprite => sprite.render())
  }
})
loop.start()
