import { getCanvas, keyPressed, Sprite } from '../libs/kontra.mjs'
import weaponsTable from '../tables/weapons.js'
import abilityTable from '../tables/abilities.js'
import { getAngle } from '../utils.js'
import { spawnWeaponProjectiles } from './projectiles.js'

let canvas = getCanvas(),
  player = Sprite({
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 25,
    height: 35,
    color: 'orange',
    anchor: { x: 0.5, y: 0.5 },
    weapon: weaponsTable[1],
    speed: 2,
    dt: 99, // high so first attack happens right away
    facingRot: 0,
    abilities: [abilityTable[8], abilityTable[8], abilityTable[8]],
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

export default player
