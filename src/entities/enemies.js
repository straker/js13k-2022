import { degToRad, rotatePoint, Sprite, Vector } from '../libs/kontra.mjs'
import enemyTable from '../tables/enemies.js'

export let enemiesDead = 0
export let enemies = []

function spawnEnemy(x, y, id) {
  let [, speed, size, color, hp, value, behaviors] = enemyTable[id]
  enemies.push(
    Sprite({
      type: 0,
      x,
      y,
      color,
      size,
      speed,
      hp,
      value,
      behaviors,
      render() {
        let { size, context, color } = this
        context.beginPath()
        context.fillStyle = color
        context.arc(0, 0, size, 0, PI * 2)
        context.fill()
      },
      update(player) {
        let velocityVector = this.velocity

        this.behaviors.map(behavior => {
          velocityVector = velocityVector.add(behavior(this, player))
        })

        // smoothly transition enemy from current velocity to
        // new velocity by capping rotation to a max value
        let angle = degToRad(5)
        if (this.velocity.angle(velocityVector) > angle) {
          // determine if the velocityVector is clockwise or
          // counter-clockwise from the current velocity
          // @see https://stackoverflow.com/a/13221874/2124254
          let dot =
              this.velocity.x * -velocityVector.y +
              this.velocity.y * velocityVector.x,
            sign = dot > 0 ? -1 : 1,
            { x, y } = rotatePoint(this.velocity, angle * sign)
          velocityVector = Vector(x, y)
        }

        this.velocity = velocityVector.normalize().scale(this.speed)

        this.advance()
      }
    })
  )
}

export function spawnEnemies(num, id) {
  for (let i = num; i--; ) {
    let angle = degToRad(random() * 360)
    let { x, y } = rotatePoint(
      { x: canvas.width / 2, y: canvas.height / 2 },
      angle
    )
    spawnEnemy(x + canvas.width / 2, y + canvas.height / 2, id)
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
