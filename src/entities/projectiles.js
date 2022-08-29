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
      // TODO: since the projectile spawns a little in front
      // of the player, enemies behind the first movement
      // of the projectile are not hit
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
