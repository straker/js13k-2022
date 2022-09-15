import { degToRad, rotatePoint, Sprite, Vector } from '../libs/kontra.mjs'
import enemyTable from '../tables/enemies.js'
import { spawnDamageText } from './damage-text.js'

export let enemiesDead = 0
export let enemies = []

function spawnEnemy(x, y, id, modifier) {
  let [, speed, size, color, hp, damage, attackSpeed, value, behaviors] =
    enemyTable[id]
  enemies.push(
    Sprite({
      type: 0,
      x,
      y,
      color,
      size,
      speed: speed * max(modifier / 2, 1),
      hp: round(hp * modifier),
      damage: round(damage * modifier),
      attackSpeed: round(attackSpeed * modifier),
      attackDt: 0,
      value,
      behaviors,
      status: [
        [0, 0], // chill, duration
        [0, 0], // poison, duration
        [0, 0], // shock, duration
        [0, 0] // weaken, duration
      ],
      // 23 = ability: increase damage from all sources
      23: 0,
      render() {
        let { size, color } = this
        context.beginPath()
        context.fillStyle = color
        context.arc(0, 0, size, 0, PI * 2)
        context.fill()
      },
      update(player) {
        let { velocity, speed, status, behaviors } = this,
          velocityVector = velocity,
          maxSpeed = speed - speed * status[0][0],
          angle = degToRad(5)

        this.attackDt++

        // apply poison every 60 frames
        if (status[1][0] && status[1][1] % 60 == 0) {
          let damage = round(10 * status[1][0])
          this.takeDamage(damage, 1, 'lightgreen')
        }

        behaviors.map(behavior => {
          velocityVector = velocityVector.add(behavior(this, player))
        })

        // smoothly transition enemy from current velocity to
        // new velocity by capping rotation to a max value
        if (velocity.angle(velocityVector) > angle) {
          // determine if the velocityVector is clockwise or
          // counter-clockwise from the current velocity
          // @see https://stackoverflow.com/a/13221874/2124254
          let dot =
              velocity.x * -velocityVector.y + velocity.y * velocityVector.x,
            sign = dot > 0 ? -1 : 1,
            { x, y } = rotatePoint(velocity, angle * sign)
          velocityVector = Vector(x, y)
        }

        this.velocity = velocityVector.normalize().scale(maxSpeed)

        this.advance()

        status.map(effect => {
          if (effect[1]) {
            if (--effect[1] == 0) {
              effect[0] = 0
            }
          }
        })
      },
      /*
        types:
        0 - projectile
        1 - poison
      */
      takeDamage(damage, type, color) {
        // shock status
        if (this.status[2][1] && type == 0) {
          damage += damage * this.status[2][0]
        }

        // ability: increase damage from all sources
        for (let i = 0; i < 4; i++) {
          if (this.status[i][1]) {
            damage += damage * this[23]
            break
          }
        }
        damage = round(damage)
        this.hp -= damage
        spawnDamageText(this, damage, color)
      }
    })
  )
}

export function spawnEnemies(num, id, modifier) {
  for (let i = num; i--; ) {
    let angle = degToRad(random() * 360)
    let { x, y } = rotatePoint(
      { x: canvas.width / 2, y: canvas.height / 2 },
      angle
    )
    spawnEnemy(x + canvas.width / 2, y + canvas.height / 2, id, modifier)
  }
}

export function removeDeadEnemies() {
  enemies = enemies.filter(enemy => {
    if (!enemy.isAlive()) {
      enemiesDead++
    }
    return enemy.isAlive()
  })
}
