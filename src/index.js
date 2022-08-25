import {
  Sprite,
  keyPressed,
  degToRad,
  rotatePoint,
  Vector,
  GameLoop
} from './libs/kontra.mjs'
// eslint-disable-next-line no-unused-vars
import globals from './globals.js'
import init from './init.js'
import weapons from './tables/weapons.js'
import enemies from './tables/enemies.js'
import { getAngle, circleCircleCollision } from './utils.js'

let { canvas } = init()
let projectiles = []
let baddies = []

let player = Sprite({
  x: canvas.width / 2,
  y: canvas.height / 2,
  width: 25,
  height: 35,
  color: 'orange',
  anchor: { x: 0.5, y: 0.5 },
  weapon: weapons[0],
  speed: 2,
  dt: 99, // high so first attack happens right away
  facingRot: 0,
  update() {
    let dx = 0,
      dy = 0,
      { weapon, x, y, width, height, speed } = this
    this.dx = this.dy = 0

    // support arrow keys, WASD, and ZQSD
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
      projectiles.push(
        Sprite({
          speed,
          size,
          ttl,
          update,
          render,
          x: x + width * sin(this.facingRot),
          y: y + height * -cos(this.facingRot),
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

function spawnBaddy(x, y, id) {
  let [, speed, size, color, hp, behaviors] = enemies[id]
  baddies.push(
    Sprite({
      x,
      y,
      color,
      size,
      speed,
      hp,
      behaviors,
      render() {
        let { size, context, color } = this
        context.beginPath()
        context.fillStyle = color
        context.arc(0, 0, size, 0, PI * 2)
        context.fill()
      }
    })
  )
}

for (let i = 0; i < 10; i++) {
  spawnBaddy(50 + i * 30, 50, 0)
}
spawnBaddy(50, 20, 1)

let loop = GameLoop({
  update() {
    player.update()
    projectiles.map(projectile => projectile.update())

    baddies.map(baddy => {
      let velocityVector = baddy.velocity

      baddy.behaviors.map(behavior => {
        velocityVector = velocityVector.add(behavior(baddy, player, baddies))
      })

      // smoothly transition baddy from current velocity to new
      // velocity by capping rotation to a max value
      let angle = degToRad(5)
      if (baddy.velocity.angle(velocityVector) > angle) {
        // determine if the velocityVector is clockwise or
        // counter-clockwise from the current velocity
        // @see https://stackoverflow.com/a/13221874/2124254
        let dot =
          baddy.velocity.x * -velocityVector.y +
          baddy.velocity.y * velocityVector.x
        let sign = dot > 0 ? -1 : 1
        let { x, y } = rotatePoint(baddy.velocity, angle * sign)
        velocityVector = Vector(x, y)
      }

      baddy.velocity = velocityVector.normalize().scale(baddy.speed)

      baddy.advance()

      // collision detection
      projectiles.map(projectile => {
        if (circleCircleCollision(projectile, baddy)) {
          baddy.ttl = 0
        }
      })
    })

    projectiles = projectiles.filter(projectile => projectile.isAlive())
    baddies = baddies.filter(baddy => baddy.isAlive())
  },
  render() {
    player.render()
    projectiles.map(projectile => projectile.render())
    baddies.map(baddy => baddy.render())
  }
})
loop.start()
