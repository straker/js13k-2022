import { movePoint, degToRad } from '../libs/kontra.mjs'
import { addTimer, addContinuousTimer } from '../timer.js'
import { deepCopyArray } from '../utils.js'
import { spawnProjectile } from '../entities/projectiles.js'
/*
  all abilities take same parameters: weapon, projectile

  index stat properties:
  0 - rarity (0 = common, 1 = uncommon, 2 = rare)
  1 - text
  2 - effect function
  3 - priority (higher = applies later)
*/

let numProjectiles = 0

function addStatusEffect(projectile) {
  function applyStatus(entity) {
    let statusEffects = projectile[8]
    for (let i = 0; i < 4; i++) {
      if (statusEffects[i] && random() <= statusEffects[i]) {
        entity.status[i][0] = statusEffects[4]
        entity.status[i][1] = statusEffects[5]
      }
    }
  }

  // only apply status effects once
  if (!projectile[9].includes(applyStatus)) {
    projectile[9].push(applyStatus)
  }
}

const abilities = [
  [
    0,
    'Dash forward on attack',
    weapon => {
      weapon[5].push(player => {
        let { x, y } = movePoint(player, player.facingRot, 20)
        player.x = x
        player.y = y
      })
    }
  ],
  [0, '+1 Projectile', weapon => weapon[4]++],
  [0, 'Projectile Size +3', (weapon, projectile) => (projectile[2] += 3)],
  [1, 'Projectile Damage +5', (weapon, projectile) => (projectile[3] += 5)],
  [1, 'Projectile Pierce +1', (weapon, projectile) => projectile[5]++],
  [
    2,
    'Repeat attack after a short delay',
    (weapon, projectile, player) => {
      // don't add the repeat attack on to the repeated attack
      // TODO: handle multiple repeat attacks
      let wep = deepCopyArray(weapon)
      weapon[5].push(() => {
        addTimer(max(weapon[1] - 10, 5), () => player.fire(wep, projectile))
      })
    },
    9 // repeat attack should have all abilities
  ],
  [
    2,
    'Double total number of Projectiles',
    weapon => (weapon[4] *= 2),
    5 // double after other abilities add projectiles
  ],
  // TODO: need a way to reset global numProjectiles after
  // removing the ability
  [
    2,
    'Every one minute gain: +1 Projectile',
    weapon => {
      weapon[6] += 1

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
    1,
    'Enemies explode into small Projectiles when killed. +3 Projectiles per card',
    (weapon, projectile) => {
      projectile[10] += 3

      if (projectile[10] === 3) {
        // don't add explode projectile to the exploding
        // projectile
        let proj = deepCopyArray(projectile)
        projectile[8].push(entity => {
          let num = weapon[4] + projectile[10],
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
  [0, 'Attack Speed +5%', weapon => (weapon[1] -= weapon[1] * 0.05)],
  [
    0,
    'Move Speed +5%',
    (weapon, projectile, player) => {
      player.speed *= 1.05
    }
  ],
  [
    0,
    'Health +5%',
    (weapon, projectile, player) => {
      player.hp *= 1.05
    }
  ],
  [1, 'Attack Speed +15%', weapon => (weapon[1] -= weapon[1] * 0.15)],
  [
    1,
    'Move Speed +15%',
    (weapon, projectile, player) => {
      player.speed *= 1.15
    }
  ],
  [
    1,
    'Health +15%',
    (weapon, projectile, player) => {
      player.hp *= 1.15
    }
  ],
  [
    0,
    'Pickup Distance +10%',
    (weapon, projectile, player) => {
      player.size *= 1.1
    }
  ],
  [
    1,
    'Pickup Distance +10%',
    (weapon, projectile, player) => {
      player.size *= 1.1
    }
  ],
  [
    0,
    '+10% to apply Chill status on hit (slow enemy movement)',
    (weapon, projectile) => {
      projectile[8][0] += 0.1
      addStatusEffect(projectile)
    }
  ],
  [
    0,
    '+10% to apply Poison status on hit (damage over time)',
    (weapon, projectile) => {
      projectile[8][1] += 0.1
      addStatusEffect(projectile)
    }
  ],
  [
    0,
    '+10% to apply Shock status on hit (increase damage taken)',
    (weapon, projectile) => {
      projectile[8][2] += 0.1
      addStatusEffect(projectile)
    }
  ],
  [
    0,
    '+10% to apply Weaken status on hit (reduce damage dealt)',
    (weapon, projectile) => {
      projectile[8][3] += 0.1
      addStatusEffect(projectile)
    }
  ],
  [
    1,
    'Status chance +10%',
    (weapon, projectile) => {
      for (let i = 0; i < 4; i++) {
        if (projectile[8][i] > 0) {
          projectile[8][i] += 0.1
        }
      }
      addStatusEffect(projectile)
    },
    5 // apply after other status effect cards
  ],
  [
    1,
    'Status duration +2 seconds',
    (weapon, projectile) => (projectile[8][5] += 120)
  ],
  [1, 'Status potency +10%', (weapon, projectile) => (projectile[8][4] += 0.1)],
  [
    2,
    'Deal +20% damage to enemies with a stats effect',
    (weapon, projectile) => {
      projectile[9].push(entity => {
        for (let i = 0; i < 4; i++) {
          if (entity.status[i][1]) {
            projectile[3] *= 1.2
            break
          }
        }
      })
    },
    5 // apply after other abilities add damage
  ]
]

export default abilities
