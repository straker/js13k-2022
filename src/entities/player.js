import { keyPressed, Sprite } from '../libs/kontra.mjs'
import weaponsTable from '../tables/weapons.js'
import abilityTable from '../tables/abilities.js'
import { getAngle } from '../utils.js'
import { spawnWeaponProjectiles } from './projectiles.js'

export let player = Sprite({
  x: canvas.width / 2,
  y: canvas.height / 2,
  width: 25, // also used as collision size
  height: 35,
  color: 'orange',
  anchor: { x: 0.5, y: 0.5 },
  weapon: weaponsTable[1],
  dt: 99, // high so first attack happens right away
  facingRot: 0,
  abilities: [abilityTable[16]],
  xp: 0,
  lvl: 1,
  reqXp: 5,
  update() {
    let dx = 0,
      dy = 0,
      { speed } = this
    this.dx = this.dy = 0

    // support arrow keys, WASD, and ZQSD
    if (keyPressed(['arrowleft', 'a', 'q'])) {
      dx = -1
    } else if (keyPressed(['arrowright', 'd'])) {
      dx = 1
    }
    if (keyPressed(['arrowup', 'w', 'z'])) {
      dy = -1
    } else if (keyPressed(['arrowdown', 's'])) {
      dy = 1
    }

    if (dx || dy) {
      this.facingRot = getAngle(dx, dy)
      this.dx = dx ? speed * sin(this.facingRot) : 0
      this.dy = dy ? speed * -cos(this.facingRot) : 0
    }
  },
  fire(weapon, projectile) {
    this.dt = 0
    spawnWeaponProjectiles(projectile, this, weapon)
    weapon[5].map(effect => effect(this))
  }
})

export function resetPlayer() {
  Object.assign(player, {
    size: 75, // this is the players pickup size, not collision size
    speed: 2,
    hp: 0
  })
}
