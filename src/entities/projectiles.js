import { degToRad, Sprite } from '../libs/kontra.mjs';
import { removeDead } from '../utils.js';

export let projectiles = [];

export function spawnProjectile(
  projectile,
  pos,
  angle,
  padding = { x: 0, y: 0 }
) {
  const { speed } = projectile;

  projectiles.push(
    Sprite({
      ...projectile,
      // a projectile can only hit each enemy once during
      // its lifetime
      hit: [],
      x: pos.x + padding.x * sin(angle),
      y: pos.y + padding.y * -cos(angle),
      rotation: angle,
      anchor: { x: 0.5, y: 0.5 },
      dx: speed * sin(angle),
      dy: speed * -cos(angle)
    })
  );
}

export function spawnWeaponProjectiles(projectile, player, weapon) {
  const { spread, numProjectiles } = weapon;
  const { width, height, facingRot } = player;
  const startAngle = (-(numProjectiles - 1) * spread) / 2;

  for (let i = 0; i < numProjectiles; i++) {
    const angle = facingRot + degToRad(startAngle + spread * i);
    spawnProjectile(projectile, player, angle, { x: width, y: height });
  }
}

export function removeDeadProjectiles() {
  projectiles = removeDead(projectiles);
}
