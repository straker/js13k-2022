import { Sprite } from '../libs/kontra.mjs'

export let projectiles = []

export function spawnProjectile(projectile, player) {
  let [, speed, size, damage, ttl, pierce, update, render] = projectile
  let { x, y, width, height, facingRot } = player
  projectiles.push(
    Sprite({
      speed,
      size,
      damage,
      ttl,
      pierce,
      update,
      render,
      // a projectile can only hit each enemy once during
      // its lifetime
      hit: [],
      x: x + width * sin(facingRot),
      y: y + height * -cos(facingRot),
      rotation: facingRot,
      anchor: { x: 0.5, y: 0.5 },
      dx: speed * sin(facingRot),
      dy: speed * -cos(facingRot)
    })
  )
}

export function removeDeadProjectiles() {
  projectiles = projectiles.filter(projectile => projectile.isAlive())
}
