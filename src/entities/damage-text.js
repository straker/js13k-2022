import { Text } from '../libs/kontra.mjs';
import { removeDead } from '../utils.js';

export let damageTexts = [];

export function spawnDamageText(entity, damage, color = 'yellow') {
  damageTexts.push(
    Text({
      text: damage,
      x: entity.x,
      y: entity.y,
      font: 'bold 24px Arial',
      color,
      strokeColor: 'black',
      storkeSize: 0.5,
      anchor: { x: 0.5, y: 0.5 },
      dt: 0,
      update() {
        this.y -= 2;

        if (++this.dt > 30) {
          this.opacity -= 0.05;
          if (this.opacity <= 0) {
            this.ttl = 0;
          }
        }
      }
    })
  );
}

export function removeDeadDamageTexts() {
  damageTexts = removeDead(damageTexts);
}

// expose for testing
export function _clear() {
  damageTexts = [];
}
