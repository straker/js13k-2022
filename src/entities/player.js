import { getCanvas, keyPressed, Sprite } from '../libs/kontra.mjs'
import { spawnProjectile } from './projectiles.js'
import weaponsTable from '../tables/weapons.js'
import abilityTable from '../tables/abilities.js'
import { getAngle, deepCopyArray } from '../utils.js'

let canvas = getCanvas(),
  player = Sprite({
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 25,
    height: 35,
    color: 'orange',
    anchor: { x: 0.5, y: 0.5 },
    weapon: weaponsTable[0],
    speed: 2,
    dt: 99, // high so first attack happens right away
    facingRot: 0,
    abilities: [abilityTable[0]],
    update() {
      let dx = 0,
        dy = 0,
        { weapon, speed, abilities } = this
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

      // apply abilities (deep copy objects so we don't
      // cause any unforseen problems due to mutation)
      weapon = deepCopyArray(weapon)
      weapon[3] = []
      let projectile = deepCopyArray(weapon[2])
      abilities.map(ability => {
        ability[1](weapon, projectile)
      })
      let [, attackSpeed, , effects] = weapon

      // attack
      if (++this.dt > attackSpeed && keyPressed('space')) {
        this.dt = 0
        spawnProjectile(projectile, this)
        effects.map(effect => effect(this))
      }
    }
  })

export default player
