import { movePoint, degToRad } from '../libs/kontra.mjs'
import { addTimer, addContinuousTimer } from '../timer.js'
import { deepCopyArray } from '../utils.js'
import { spawnProjectile } from '../entities/projectiles.js'
/*
  all abilities take same parameters: weapon, projectile

  index stat properties:
  0 - id
  1 - rarity (0 = common, 1 = uncommon, 2 = rare)
  2 - text
  3 - effect function
  4 - priority (higher = applies later)
*/

let numProjectiles = 0

const abilities = [
  [
    0,
    0, // TODO: uncommon, but need 3 commons for right now
    'Dash forward on attack',
    weapon => {
      weapon[5].push(player => {
        let { x, y } = movePoint(player, player.facingRot, 20)
        player.x = x
        player.y = y
      })
    }
  ],
  [1, 0, '+1 Projectile', weapon => weapon[4]++],
  [2, 0, 'Projectile Size +3', (weapon, projectile) => (projectile[2] += 3)],
  [3, 1, 'Projectile Damage +5', (weapon, projectile) => (projectile[3] += 5)],
  [4, 1, 'Projectile Pierce +1', (weapon, projectile) => projectile[5]++],
  [
    5,
    2,
    'Repeat attack after a short delay',
    (weapon, projectile, player) => {
      // don't add the repeat attack on to the repeated attack
      let wep = deepCopyArray(weapon)
      weapon[5].push(() => {
        addTimer(20, () => player.fire(wep, projectile))
      })
    },
    9 // repeat attack should have all abilities
  ],
  [
    6,
    2,
    'Double number of Projectiles',
    weapon => (weapon[4] *= 2),
    5 // double after other abilities add projectiles
  ],
  // TODO: need a way to reset global numProjectiles after
  // removing the ability
  [
    7,
    2,
    'Every 1 minute gain: +1 Projectile',
    weapon => {
      weapon[6] = (weapon[6] ?? 0) + 1

      // only add total num projectiles once
      if (weapon[6] === 1) {
        weapon[4] += numProjectiles
      }

      // 1 minute (3600 frames)
      addContinuousTimer(0, 3600, () => {
        numProjectiles += weapon[6]
      })
    }
  ],
  [
    8,
    1,
    'Enemies explode into 3 Projectiles when killed. Projectiles deal 25% damage.',
    (weapon, projectile) => {
      projectile[9] = (projectile[9] ?? 0) + 3

      if (projectile[9] === 3) {
        // don't add explode projectile to the exploding
        // projectile
        let proj = deepCopyArray(projectile)
        projectile[8].push(entity => {
          let num = weapon[4] + projectile[9],
            angle = degToRad(360 / num),
            i = 0
          // reduce stats
          proj[1] = 5
          proj[2] = max(proj[2] * 0.25, 8)
          proj[3] = max((proj[3] * 0.25) | 0, 1)
          proj[4] = 10
          proj[5] = max(proj[5] * 0.25, 1)

          for (; i < num; i++) {
            spawnProjectile(proj, entity, angle * i)
          }
        })
      }
    },
    8 // explosion should get all projectile bonuses
  ],
  [9, 0, 'Attack Speed +15%', weapon => (weapon[1] -= weapon[1] * 0.15)],
  [
    10,
    0,
    'Move Speed +15%',
    (weapon, projectile, player) => {
      player.stats[0] = (player.stats[0] ?? 0) + 0.15
    }
  ],
  [
    11,
    0,
    'Health +15%',
    (weapon, projectile, player) => {
      player.stats[0] = (player.stats[1] ?? 0) + 0.15
    }
  ],
  [12, 1, 'Attack Speed +25%', weapon => (weapon[1] -= weapon[1] * 0.25)],
  [
    13,
    1,
    'Move Speed +25%',
    (weapon, projectile, player) => {
      player.stats[0] = (player.stats[0] ?? 0) + 0.25
    }
  ],
  [
    14,
    1,
    'Health +25%',
    (weapon, projectile, player) => {
      player.stats[0] = (player.stats[1] ?? 0) + 0.25
    }
  ]
]

export default abilities
