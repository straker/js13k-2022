import {
  getCanvas,
  degToRad,
  rotatePoint,
  Sprite,
  Vector
} from '../libs/kontra.mjs';
import enemyTable from '../tables/enemies.js';
import { spawnDamageText } from './damage-text.js';

export let enemiesDead = 0;
export let enemies = [];

function spawnEnemy(x, y, name, modifier) {
  const { speed, size, color, hp, damage, attackSpeed, value, behaviors } =
    enemyTable[name];

  enemies.push(
    Sprite({
      type: 0,
      x,
      y,
      color,
      size,
      speed: speed * Math.max(modifier / 2, 1),
      hp: Math.round(hp * modifier),
      damage: Math.round(damage * modifier),
      attackSpeed: Math.round(attackSpeed * modifier),
      attackDt: 0,
      value,
      behaviors,
      statuses: {
        chill: { amount: 0, duration: 0 },
        poison: { amount: 0, duration: 0 },
        shock: { amount: 0, duration: 0 },
        weaken: { amount: 0, duration: 0 }
      },
      damageFromAllSources: 0,
      render() {
        const { size, color, context } = this;

        context.beginPath();
        context.fillStyle = color;
        context.arc(0, 0, size, 0, Math.PI * 2);
        context.fill();
      },
      update(player) {
        const { velocity, speed, statuses, behaviors } = this;
        const maxSpeed = speed - speed * statuses.chill.amount;
        const angle = degToRad(5);
        let velocityVector = velocity;

        this.attackDt++;

        // apply poison every 60 frames
        if (statuses.poison.amount && statuses.poison.duration % 60 == 0) {
          const damage = Math.round(10 * statuses.poison.amount);
          this.takeDamage(damage, 1, 'lightgreen');
        }

        behaviors.map(behavior => {
          velocityVector = velocityVector.add(behavior(this, player));
        });

        // smoothly transition enemy from current velocity to
        // new velocity by capping rotation to a max value
        if (velocity.angle(velocityVector) > angle) {
          // determine if the velocityVector is clockwise or
          // counter-clockwise from the current velocity
          // @see https://stackoverflow.com/a/13221874/2124254
          const dot =
            velocity.x * -velocityVector.y + velocity.y * velocityVector.x;
          const sign = dot > 0 ? -1 : 1;
          const { x, y } = rotatePoint(velocity, angle * sign);
          velocityVector = Vector(x, y);
        }

        this.velocity = velocityVector.normalize().scale(maxSpeed);

        this.advance();

        for (const status in statuses) {
          if (status.duration) {
            if (--status.duration == 0) {
              status.amount = 0;
            }
          }
        }
      },
      /*
        types:
        0 - projectile
        1 - poison
      */
      takeDamage(damage, type, color) {
        // shock status
        if (this.statuses.shock.duration && type == 0) {
          damage += damage * this.statuses.shock.amount;
        }

        // TODO: this looks wrong
        // ability: increase damage from all sources
        // for (let i = 0; i < 4; i++) {
        //   if (this.statuses[i][1]) {
        //     damage += damage * this[23];
        //     break;
        //   }
        // }
        damage = Math.round(damage);
        this.hp -= damage;
        spawnDamageText(this, damage, color);
      }
    })
  );
}

export function spawnEnemies(num, id, modifier) {
  const canvas = getCanvas();

  for (let i = num; i--; ) {
    const angle = degToRad(Math.random() * 360);
    const { x, y } = rotatePoint(
      { x: canvas.width / 2, y: canvas.height / 2 },
      angle
    );
    spawnEnemy(x + canvas.width / 2, y + canvas.height / 2, id, modifier);
  }
}

export function removeDeadEnemies() {
  enemies = enemies.filter(enemy => {
    if (!enemy.isAlive()) {
      enemiesDead++;
    }
    return enemy.isAlive();
  });
}
