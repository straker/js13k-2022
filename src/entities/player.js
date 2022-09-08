import { keyPressed, Sprite } from '../libs/kontra.mjs'
import weaponsTable from '../tables/weapons.js'
import abilityTable from '../tables/abilities.js'
import { getAngle, fillBar } from '../utils.js'
import { spawnWeaponProjectiles } from './projectiles.js'
import { spawnDamageText } from './damage-text.js'

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
  abilities: [abilityTable[31]],
  xp: 0,
  lvl: 1,
  reqXp: 5,
  // if max hp/shield is changed, changed these
  hp: 20,
  shields: [
    0 // 0 - current shields

    // === below values are reset every frame
    // 1 - max shields
    // 2 - recovery delay
    // 3 - recovery speed
    // 4 - spike % damage
    // 5 - num shields to add every n time
  ],
  shieldDt: 0,
  update() {
    let dx = 0,
      dy = 0,
      { speed, shields } = this
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

    // recover shields (mimic the shield recovery of Halo games)
    // recover shields after 10s, full recovery in 10s
    // @see https://halo.fandom.com/wiki/Energy_shielding#Energy_shields_in-game
    // @see https://www.halopedia.org/Energy_shielding#Gameplay
    if (++this.shieldDt >= 600 / shields[2] && shields[0] < shields[1]) {
      shields[0] = min(shields[0] + shields[1] / (600 / shields[3]), shields[1])
    }
  },
  render() {
    this.draw()

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
    )

    // shield bar
    fillBar(
      -10,
      this.height + 5,
      this.width + 20,
      10,
      1,
      'skyblue',
      player.shields[0],
      player.shields[1]
    )
  },
  fire(weapon, projectile) {
    this.dt = 0
    spawnWeaponProjectiles(projectile, this, weapon)
    weapon[5].map(effect => effect(this))
  },
  takeDamage(damage, type, entity, projectile) {
    // reset shield delay timer when hit
    this.shieldDt = 0
    damage = round(damage)
    let { x, y, shields } = this,
      curShields = round(shields[0]),
      diff = damage - curShields

    // shield spike damage
    if (shields[0] && shields[4]) {
      entity.takeDamage(projectile[3] * shields[4], 0)
    }

    // take from shields first
    if (diff <= 0) {
      shields[0] -= damage
      spawnDamageText(this, damage, 'skyblue')
    } else {
      if (shields[0]) {
        spawnDamageText({ x: x - 10, y }, curShields, 'skyblue')
        spawnDamageText({ x: x + 10, y }, diff, '#E10600')
        shields[0] = 0
        this.hp -= diff
      } else {
        this.hp -= damage
        spawnDamageText(this, diff, '#E10600')
      }
    }
  }
})

export function resetPlayer() {
  Object.assign(player, {
    size: 75, // this is the players pickup size, not collision size
    speed: 2,
    // if max hp/shield is changed, changed player start
    // hp/shield
    maxHp: 20,
    shields: [player.shields[0], 0, 1, 1, 0, 0],
    xpGain: 1
  })
}
