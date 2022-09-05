import { Text } from '../libs/kontra.mjs'
import { removeDead } from '../utils.js'

export let damageTexts = []

export function spawnDamageText(entity, damage, color = 'yellow') {
  damageTexts.push(
    Text({
      text: damage,
      x: entity.x,
      y: entity.y,
      font: '24px Arial',
      color,
      strokeColor: 'black',
      storkeSize: 0.5,
      anchor: { x: 0.5, y: 0.5 },
      update() {
        this.opacity -= 0.025
        this.y -= 2
        if (this.opacity <= 0) {
          this.ttl = 0
        }
      }
    })
  )
}

export function removeDeadDamageTexts() {
  damageTexts = removeDead(damageTexts)
}
