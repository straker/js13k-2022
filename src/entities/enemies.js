import { getCanvas, degToRad, rotatePoint, Sprite } from '../libs/kontra.mjs'
import enemyTable from '../tables/enemies.js'

export let enemiesDead = 0
export let enemies = [],
  canvas = getCanvas()

function spawnEnemy(x, y, id) {
  let [, speed, size, color, hp, behaviors] = enemyTable[id]
  enemies.push(
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
