import { degToRad, Sprite } from '../libs/kontra.mjs'
import { removeDead } from '../utils.js'

export let projectiles = []

export function spawnProjectile(
  projectile,
  pos,
  angle,
  padding = { x: 0, y: 0 }
) {
  let [
    ,
    speed,
    size,
    damage,
    ttl,
    pierce,
    update,
    render,
    statusEffects,
    effects
  ] = projectile
  projectiles.push(
    Sprite({
      speed,
      size,
      damage,
      ttl,
      pierce,
      update,
      render,
      statusEffects,
      effects,
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
  )
}

export function spawnWeaponProjectiles(projectile, player, weapon) {
  let [, , , spread, numProjectiles] = weapon,
    { width, height, facingRot } = player,
    startAngle = (-(numProjectiles - 1) * spread) / 2,
    i = 0
  for (; i < numProjectiles; i++) {
    let angle = facingRot + degToRad(startAngle + spread * i)
    spawnProjectile(projectile, player, angle, { x: width, y: height })
  }
}

export function removeDeadProjectiles() {
  projectiles = removeDead(projectiles)
}
