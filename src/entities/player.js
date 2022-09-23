import { getCanvas, keyPressed, Sprite } from '../libs/kontra.mjs';
import weaponsTable from '../tables/weapons.js';
import { getAngle, fillBar } from '../utils.js';
import { spawnWeaponProjectiles } from './projectiles.js';
import { spawnDamageText } from './damage-text.js';

let player;

export function spawnPlayer() {
  const canvas = getCanvas();

  player = Sprite({
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 25, // also used as collision size
    height: 35,
    color: 'orange',
    anchor: { x: 0.5, y: 0.5 },
    weapon: weaponsTable.pistol,
    dt: 99, // high so first attack happens right away
    facingRot: 0,
    abilities: [],
    xp: 0,
    lvl: 1,
    reqXp: 5,
    // if max hp/shield is changed, changed these
    hp: 20,
    shields: {
      current: 0 // 0 - current shields

      // === below values are reset every frame
      // 1 - max shields
      // 2 - recovery delay
      // 3 - recovery speed
      // 4 - spike % damage
      // 5 - num shields to add every n time
    },
    shieldDt: 0,
    update() {
      let dx = 0;
      let dy = 0;
      const { speed, shields } = this;
      this.dx = this.dy = 0;

      // support arrow keys, WASD, and ZQSD
      if (keyPressed(['arrowleft', 'a', 'q'])) {
        dx = -1;
      } else if (keyPressed(['arrowright', 'd'])) {
        dx = 1;
      }
      if (keyPressed(['arrowup', 'w', 'z'])) {
        dy = -1;
      } else if (keyPressed(['arrowdown', 's'])) {
        dy = 1;
      }

      if (dx || dy) {
        this.facingRot = getAngle(dx, dy);
        this.dx = dx ? speed * Math.sin(this.facingRot) : 0;
        this.dy = dy ? speed * -Math.cos(this.facingRot) : 0;
      }

      // recover shields (mimic the shield recovery of Halo
      // games). recover shields after 10s (600 frames),
      // full recovery in 10s
      // @see https://halo.fandom.com/wiki/Energy_shielding#Energy_shields_in-game
      // @see https://www.halopedia.org/Energy_shielding#Gameplay
      if (
        ++this.shieldDt >= 600 / shields.recoveryDelay &&
        shields.current < shields.max
      ) {
        shields.current = Math.min(
          shields.current + shields.max / (600 / shields.recoverySpeed),
          shields.max
        );
      }
    },
    render() {
      this.draw();

      // health bar
      fillBar(
        -10,
        this.height + 5,
        this.width + 20,
        10,
        1,
        'red',
        player.hp,
        player.maxHp
      );

      // shield bar
      fillBar(
        -10,
        this.height + 5,
        this.width + 20,
        10,
        1,
        'skyblue',
        player.shields.current,
        player.shields.max
      );
    },
    fire(weapon, projectile) {
      this.dt = 0;
      spawnWeaponProjectiles(projectile, this, weapon);
      weapon.onAttackEffects.map(effect => effect(this));
    },
    takeDamage(damage, type, entity, projectile) {
      damage = Math.round(damage);
      const { x, y, shields } = this;
      const curShields = Math.round(shields.current);
      const diff = damage - curShields;

      // reset shield delay timer when hit, but only if player
      // has max shields. that way recovery starts immediately
      // when player first gets shield ability
      if (shields.max) {
        this.shieldDt = 0;
      }

      // shield spike damage
      if (shields.current && shields.spikeDamagePercent) {
        entity.takeDamage(projectile.damage * shields.spikeDamagePercent, 0);
      }

      // take from shields first
      if (diff <= 0) {
        shields.current -= damage;
        spawnDamageText(this, damage, 'skyblue');
      } else {
        if (shields.current) {
          spawnDamageText({ x: x - 10, y }, curShields, 'skyblue');
          spawnDamageText({ x: x + 10, y }, diff, '#E10600');
          shields.current = 0;
          this.hp -= diff;
        } else {
          this.hp -= damage;
          spawnDamageText(this, diff, '#E10600');
        }
      }

      this.hp = Math.max(this.hp, 0);
    }
  });

  player.position.clamp(
    player.width / 2,
    player.height / 2,
    canvas.width - player.width / 2,
    canvas.height - player.height / 2
  );

  return player;
}

export function resetPlayer() {
  Object.assign(player, {
    size: 75, // this is the players pickup size, not collision size
    speed: 2,
    // if max hp/shield is changed, changed player start
    // hp/shield
    maxHp: 20,
    shields: {
      current: player.shields.current,
      max: 0,
      recoveryDelay: 1,
      recoverySpeed: 1,
      spikeDamagePercent: 0,
      numShieldsPerMinute: 0
    },
    xpGain: 1
  });
}
