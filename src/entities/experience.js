import { Sprite } from '../libs/kontra.mjs';
import behaviorTable from '../tables/behaviors.js';
import { removeDead } from '../utils.js';

export let experiences = [];

export function spawnExperience(enemy) {
  const { x, y, value } = enemy;

  experiences.push(
    Sprite({
      type: 1,
      x,
      y,
      value,
      size: 4,
      speed: 10,
      render() {
        const { size, context } = this;
        context.beginPath();
        context.fillStyle = '#60AC53';
        context.arc(0, 0, size, 0, Math.PI * 2);
        context.fill();
      },
      update(player) {
        const { position, speed, value, active } = this;
        // seek player when active (player is close
        // enough)
        if (active) {
          this.velocity = this.velocity
            .add(behaviorTable.seekPlayer(this, player))
            .normalize()
            .scale(speed);

          this.advance();

          if (position.distance(player) <= speed) {
            this.ttl = 0;
            player.xp += value * player.xpGain;
          }
        }
      }
    })
  );
}

export function removeDeadExperience() {
  experiences = removeDead(experiences);
}
