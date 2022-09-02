import { movePoint, degToRad } from '../libs/kontra.mjs'
import { addTimer, addContinuousTimer } from '../timer.js'
import { deepCopyArray } from '../utils.js'
import { spawnProjectile } from '../entities/projectiles.js'
/*
  all abilities take same parameters: weapon, projectile

  index stat properties:
  0 - id
  1 - rarity (0 = common, 1 = uncommon, 2 = rare)
  2 - effect function
  3 - priority (higher = applies later)
*/

const abilities = [
  // on attack: dash player forward
  [
    0,
    1,
    weapon => {
      weapon[5].push(player => {
        let { x, y } = movePoint(player, player.facingRot, 20)
        player.x = x
        player.y = y
      })
    }
  ],
  // increase # projectiles
  [1, 0, weapon => weapon[4]++],
  // increase projectile size
  [2, 0, (weapon, projectile) => (projectile[2] += 3)],
  // increase projectile damage
  [3, 1, (weapon, projectile) => (projectile[3] += 5)],
  // increase projectile pierce
  [4, 1, (weapon, projectile) => projectile[5]++],
  // repeat attack
  [
    5,
    2,
    (weapon, projectile, player) => {
      // don't add the repeat attack on to the repeated attack
      let wep = deepCopyArray(weapon)
      weapon[5].push(() => {
        addTimer(20, () => player.fire(wep, projectile))
      })
    },
    9 // repeat attack should have all abilities
  ],
  // double projectiles
  [
    6,
    2,
    weapon => (weapon[4] *= 2),
    5 // double after other abilities add projectiles
  ],
  // add projectile every n time
  // TODO: need a way to reset global numProjectiles after
  // removing the ability
  [
    7,
    2,
    weapon => {
      weapon[4] += weapon[7]
      weapon[6] = (weapon[6] ?? 0) + 1
      // 1 minute (60 frames a second * 60 seconds)
      addContinuousTimer(0, 3600, () => {
        weapon[4] += ++weapon[6]
      })
    }
  ],
  // explode projectiles on hit
  [
    8,
    1,
    (weapon, projectile) => {
      projectile[9] = (projectile[9] ?? 0) + 3

      if (projectile[9] === 3) {
        // don't add explode projectile to the exploding
        // projectile
        let proj = deepCopyArray(projectile)
        projectile[8].push(entity => {
          let numProjectiles = weapon[4] + projectile[9],
            angle = degToRad(360 / numProjectiles),
            i = 0
          // reduce stats
          proj[1] = 5
          proj[2] -= proj[2] / 3
          proj[3] -= (proj[3] / 2) | 0
          proj[4] = 10
          proj[5] = max(proj[5] - proj[5] / 3, 1)

          for (; i < numProjectiles; i++) {
            spawnProjectile(proj, entity, angle * i)
          }
        })
      }
    },
    8 // explosion should get all projectile bonuses
  ]
]

export default abilities
