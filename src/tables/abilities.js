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

// add an on hit effect only once
function addOnce(projectile, ability) {
  if (!projectile[9].includes(ability)) {
    projectile[9].push(ability)
  }
}

function addStatusEffect(projectile) {
  function applyStatus(entity) {
    // don't apply status to first hit (so shock doesn't
    // increase damage on first attack)
    addTimer(1, () => {
      let statusEffects = projectile[8]
      for (let i = 0; i < 4; i++) {
        if (statusEffects[i] && random() <= statusEffects[i]) {
          entity.status[i][0] = statusEffects[4]
          entity.status[i][1] = statusEffects[5]
        }
      }
    })
  }

  addOnce(projectile, applyStatus)
}

function addIncreaseDamage(projectile) {
  function increaseDamage(entity) {
    // don't apply to the first attack
    addTimer(1, () => {
      console.log(projectile[11])
      entity[23] = projectile[11]
    })
  }

  addOnce(projectile, increaseDamage)
}

const abilities = [
  // 0
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
  // 1
  [0, '+1 Projectile', weapon => weapon[4]++],
  // 2
  [0, 'Projectile Size +3', (weapon, projectile) => (projectile[2] += 3)],
  // 3
  [1, 'Projectile Damage +5', (weapon, projectile) => (projectile[3] += 5)],
  // 4
  [1, 'Projectile Pierce +1', (weapon, projectile) => projectile[5]++],
  // 5
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
  // 6
  [
    2,
    'Double total number of Projectiles',
    weapon => (weapon[4] *= 2),
    5 // double after other abilities add projectiles
  ],
  // 7
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
  // 8
  // TODO: not working?
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
          proj[3] = max(round(proj[3] * 0.25), 1)
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
  // 9
  [0, 'Attack Speed +5%', weapon => (weapon[1] -= weapon[1] * 0.05)],
  // 10
  [
    0,
    'Move Speed +5%',
    (weapon, projectile, player) => {
      player.speed *= 1.05
    }
  ],
  // 11
  [
    0,
    'Health +5%',
    (weapon, projectile, player) => {
      player.hp *= 1.05
    }
  ],
  // 12
  [1, 'Attack Speed +15%', weapon => (weapon[1] -= weapon[1] * 0.15)],
  // 13
  [
    1,
    'Move Speed +15%',
    (weapon, projectile, player) => {
      player.speed *= 1.15
    }
  ],
  // 14
  [
    1,
    'Health +15%',
    (weapon, projectile, player) => {
      player.hp *= 1.15
    }
  ],
  // 15
  [
    0,
    'Pickup Distance +20%',
    (weapon, projectile, player) => {
      player.size *= 1.2
    }
  ],
  // 16
  [
    0,
    '+10% to apply Chill status on hit (slows enemy movement)',
    (weapon, projectile) => {
      projectile[8][0] += 0.1
      addStatusEffect(projectile)
    },
    6 // don't apply before ability to add damage to targets with stats
  ],
  // 17
  [
    0,
    '+10% to apply Poison status on hit (damage over time)',
    (weapon, projectile) => {
      projectile[8][1] += 0.1
      addStatusEffect(projectile)
    },
    6 // don't apply before ability to add damage to targets with stats
  ],
  // 18
  [
    0,
    '+10% to apply Shock status on hit (increases damage taken from Projectiles)',
    (weapon, projectile) => {
      projectile[8][2] += 0.1
      addStatusEffect(projectile)
    },
    6 // don't apply before ability to add damage to targets with stats
  ],
  // 19
  // TODO: implement
  [
    0,
    '+10% to apply Weaken status on hit (reduces damage dealt)',
    (weapon, projectile) => {
      projectile[8][3] += 0.1
      addStatusEffect(projectile)
    },
    6 // don't apply before ability to add damage to targets with stats
  ],
  // 20
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
    7 // apply after other status effect cards
  ],
  // 21
  [
    1,
    'Status duration +2 seconds',
    (weapon, projectile) => (projectile[8][5] += 120)
  ],
  // 22
  [
    1,
    'Status effectiveness +10%',
    (weapon, projectile) => (projectile[8][4] += 0.1)
  ],
  // 23
  [
    2,
    'Enemies with a status effect take +20% damage from all sources',
    (weapon, projectile) => {
      projectile[11] += 0.2
      addIncreaseDamage(projectile)
    }
  ],
  // 24
  // TODO: figure out how to give player a one-time shield
  // boost when they take the ability
  [
    0,
    'Gain +20 shield. Shields absorb damage and recover slowly after a delay.',
    (weapon, projectile, player) => (player.shields[1] += 20)
  ],
  [
    1,
    'Shield recovery delay -20%',
    (weapon, projectile, player) => (player.shields[2] *= 1.2)
  ],
  [
    1,
    'Shield recovery speed +20%',
    (weapon, projectile, player) => (player.shields[3] *= 1.2)
  ],
  [
    1,
    'Shields deal +20% of Projectile damage to the attacker',
    (weapon, projectile, player) => (player.shields[4] += 0.2)
  ]
]

export default abilities
