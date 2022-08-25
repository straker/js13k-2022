import {
  Sprite,
  keyPressed,
  angleToTarget,
  Vector,
  GameLoop
} from './libs/kontra.mjs'
// eslint-disable-next-line no-unused-vars
import globals from './globals.js'
import init from './init.js'
import weapons from './tables/weapons.js'
import enemies from './tables/enemies.js'
import {
  getAngle,
  circleCircleCollision,
  baddyPlayerCollision
} from './utils.js'

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
          damage: weapon[1], //weapon damage
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
  let [, speed, size, color, hp] = enemies[id]
  /* used to track total amount of times player has been hit */
  let hitPlayer = 0
  baddies.push(
    Sprite({
      x,
      y,
      color,
      size,
      speed,
      hp,
      hitPlayer,
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

/* spawn wraith */
for (let i = 0; i < 5; i++) {
  /* spawn wraith just outside the canvas and spanned out */
  spawnBaddy(50 + i * 200, -50, 1)
}

let loop = GameLoop({
  update() {
    player.update()
    projectiles.map(projectile => projectile.update())

    baddies.map(baddy => {
      let numNeighbors = 0,
        angle = angleToTarget(baddy, player),
        separationVector = Vector()

      // seek steering behavior
      // @see https://gamedevelopment.tutsplus.com/tutorials/understanding-steering-behaviors-seek--gamedev-849
      let seekVector = Vector(sin(angle), -cos(angle)).subtract(baddy.velocity)

      // avoidance steering behavior (based on separation
      // flocking behavior)
      // @see https://gamedevelopment.tutsplus.com/tutorials/3-simple-rules-of-flocking-behaviors-alignment-cohesion-and-separation--gamedev-3444
      baddies.map(baddy2 => {
        if (baddy != baddy2 && circleCircleCollision(baddy, baddy2)) {
          numNeighbors++
          separationVector = separationVector.add(
            baddy2.position.subtract(baddy.position)
          )
        }
      })

      if (numNeighbors) {
        separationVector = separationVector
          .normalize(numNeighbors)
          .scale(-1)
          .normalize()
      }

      baddy.velocity = baddy.velocity
        .add(seekVector)
        .add(separationVector)
        .normalize()
        .scale(baddy.speed)

      if (baddyPlayerCollision(baddy, player)) {
        // TODO: we need a way to differentiate player was hit with X baddy effect somehow and attack rate
        // I am getting INSTA rooted :(
        baddy.hitPlayer++
      }

      baddy.advance()

      /* wraith: roots player for 3 seconds*/
      if (baddy.hitPlayer >= 5) {
        console.log('ROOTED!')
        player.speed = 0
        // not sure if this is the right approach
        setTimeout(() => {
          player.speed = 2
          this.hitPlayer = 0 // reset player hit
          console.log('Reset root')
        }, 3000)
      }

      // collision detection
      projectiles.map(projectile => {
        if (circleCircleCollision(projectile, baddy)) {
          console.log({
            bhp: baddy.hp,
            pd: projectile.damage
          })
          // damaged enemy, remove from current HP
          baddy.hp -= projectile.damage

          if (baddy.hp <= 0) {
            // baddy DEAD!
            baddy.ttl = 0
          }
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
