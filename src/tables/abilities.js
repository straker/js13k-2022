import { movePoint, degToRad } from '../libs/kontra.mjs'
import { addTimer, addContinuousTimer } from '../timer.js'
import { deepCopyArray } from '../utils.js'
import { spawnProjectile } from '../entities/projectiles.js'
/*
  all abilities take same parameters: weapon, projectile

  index stat properties:
  0 - rarity (-1 = basic, 0 = common, 1 = uncommon, 2 = rare)
  1 - text
  2 - effect function
  3 - priority (higher = applies later)
*/

let numProjectiles = 0,
  numShields = 0

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

let abilities = [
  // 0
  // TODO: needs improvement to attack all enemies that you
  // pass through. should also use a tween and lock player
  // movement until the tween is done
  // [
  //   0,
  //   'Dash forward on attack',
  //   weapon => {
  //     weapon[5].push(player => {
  //       let { x, y } = movePoint(player, player.facingRot, 20)
  //       player.x = x
  //       player.y = y
  //     })
  //   }
  // ],
  // 0
  [0, '+1 Projectile\nProjectile Damage -2\nSpread +5', (weapon, projectile) => {
      weapon[4]++
      projectile[3] = max(projectile[3] - 2, 1)
      weapon[3] += 5
    }
  ],
  // 1
  [0, 'Projectile Damage +2\nProjectile Size +3', (weapon, projectile) => {
      projectile[3] += 2
      projectile[2] += 3
    }
  ],
  // 2
  [0, 'Projectile Damage +4', (weapon, projectile) => (projectile[3] += 4)],
  // 3
  [0, 'Projectile Damage +7\nProjectile Size -1', (weapon, projectile) => {
      projectile[3] += 7
      projectile[2] = max(projectile[2] - 1, 1)
    }
  ],
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
  [
    1,
    'Enemies explode into small Projectiles when killed. +3 Projectiles per card',
    (weapon, projectile) => {
      projectile[10] += 3

      if (projectile[10] === 3) {
        // don't add explode projectile to the exploding
        // projectile
        let proj = deepCopyArray(projectile)
        projectile[9].push(entity => {
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
      player.maxHp *= 1.05
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
      player.maxHp *= 1.15
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
    '+20% to apply Chill status on hit (slows enemy movement)',
    (weapon, projectile) => {
      projectile[8][0] += 0.2
      addStatusEffect(projectile)
    },
    6 // don't apply before ability to add damage to targets with stats
  ],
  // 17
  [
    0,
    '+20% to apply Poison status on hit (damage over time)',
    (weapon, projectile) => {
      projectile[8][1] += 0.2
      addStatusEffect(projectile)
    },
    6 // don't apply before ability to add damage to targets with stats
  ],
  // 18
  [
    0,
    '+20% to apply Shock status on hit (increases damage taken from Projectiles)',
    (weapon, projectile) => {
      projectile[8][2] += 0.2
      addStatusEffect(projectile)
    },
    6 // don't apply before ability to add damage to targets with stats
  ],
  // 19
  // TODO: implement
  [
    0,
    '+20% to apply Weaken status on hit (reduces damage dealt)',
    (weapon, projectile) => {
      projectile[8][3] += 0.2
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
    'Status effectiveness +20%',
    (weapon, projectile) => (projectile[8][4] += 0.2)
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
  [
    0,
    'Gain +20 Shield. Shields absorb damage and recover slowly after a delay',
    (weapon, projectile, player) => (player.shields[1] += 20)
  ],
  // 25
  [
    0,
    'Recover Shield on hit up to +10% of Projectile damage',
    (weapon, projectile, player) => {
      projectile[9].push(
        () =>
          (player.shields[0] = min(
            player.shields[0] + projectile[3] * 0.1,
            player.shields[1]
          ))
      )
    }
  ],
  // 26
  [
    1,
    'Shield recovery delay -30%',
    (weapon, projectile, player) => (player.shields[2] *= 1.3)
  ],
  // 27
  [
    1,
    'Shield recovery speed +30%',
    (weapon, projectile, player) => (player.shields[3] *= 1.3)
  ],
  // 28
  [
    1,
    'Shield deals +20% of Projectile damage to the attacker',
    (weapon, projectile, player) =>
      (player.shields[4] = player.shields[4]
        ? player.shields[4] * 1.2 - 1
        : 1.2)
  ],
  // 29
  [
    2,
    'Double total amount of Shield',
    (weapon, projectile, player) => (player.shields[1] *= 2),
    5 // double after other abilities add shields
  ],
  // 30
  // TODO: need a way to reset global numShields after
  // removing the ability
  [
    2,
    'Every one minute gain: +20 Shield',
    (weapon, projectile, player) => {
      player.shields[5] += 1

      // only add total num shields once
      if (player.shields[5] === 1) {
        player.shields[1] += numShields
      }

      // 1 minute (3600 frames)
      addContinuousTimer(0, 3600, () => {
        numShields += player.shields[5]
      })
    }
  ],
  // 31
  [
    1,
    'Experience +15%',
    (weapon, projectile, player) => (player.xpGain *= 1.15)
  ],
  // 32
  [1, 'Projectile Damage +10\nAttack Speed -10%', (weapon, projectile) => {
      projectile[3] += 10
      weapon[1] *= 1.1
    }
  ]
]

export default abilities


export function logAbilityStats() {
  let commons = abilities.filter(ability => ability[0] == 0)
  let uncommons = abilities.filter(ability => ability[0] == 1)
  let rares = abilities.filter(ability => ability[0] == 2)
  let total = abilities.filter(ability => [0,1,2].includes(ability[0])).length

  let projectiles = abilities.filter(ability => {
    let str = ability[1].toLowerCase()
    let projectileIndex = str.indexOf('projectile')
    let shieldIndex = str.indexOf('shield')
    let statusIndex = str.indexOf('status')

    return [0,1,2].includes(ability[0]) &&
      projectileIndex > -1 &&
      (shieldIndex > -1 ? projectileIndex < shieldIndex : true) && (statusIndex > -1 ? projectileIndex < statusIndex : true)
  })
  let shields = abilities.filter(ability => {
    let str = ability[1].toLowerCase()
    let projectileIndex = str.indexOf('projectile')
    let shieldIndex = str.indexOf('shield')
    let statusIndex = str.indexOf('status')

    return [0,1,2].includes(ability[0]) &&
      shieldIndex > -1 &&
      (projectileIndex > -1 ? shieldIndex < projectileIndex : true) && (statusIndex > -1 ? projectileIndex < statusIndex : true)
  })
  let status = abilities.filter(ability => {
    let str = ability[1].toLowerCase()
    let projectileIndex = str.indexOf('projectile')
    let shieldIndex = str.indexOf('shield')
    let statusIndex = str.indexOf('status')

    return [0,1,2].includes(ability[0]) &&
      statusIndex > -1 &&
      (shieldIndex > -1 ? statusIndex < shieldIndex : true) && (projectileIndex > -1 ? statusIndex < projectileIndex : true)
  })
  let other = abilities.filter(ability => {
    return [0,1,2].includes(ability[0]) &&
      !projectiles.includes(ability) &&
      !shields.includes(ability) &&
      !status.includes(ability)
  })

  console.log('Rarity Spread')
  console.table([
    { rarity: 'common', number: commons.length, percent: (commons.length / total * 100).toFixed(2), targetPercent: '25 - 28' },
    { rarity: 'uncommon', number: uncommons.length, percent: (uncommons.length / total * 100).toFixed(2), targetPercent: '47 - 51' },
    { rarity: 'rare', number: rares.length, percent: (rares.length / total * 100).toFixed(2), targetPercent: '22 - 27' }
  ])

  console.log('\nRarity Spread Breakdown')
  console.groupCollapsed('commons')

  console.group('projectile')
  commons.forEach(ability => projectiles.includes(ability) && console.log(ability[1]))
  console.groupEnd()
  console.group('shield')
  commons.forEach(ability => shields.includes(ability) && console.log(ability[1]))
  console.groupEnd()
  console.group('status effects')
  commons.forEach(ability => status.includes(ability) && console.log(ability[1]))
  console.groupEnd()
  console.group('other')
  commons.forEach(ability => other.includes(ability) && console.log(ability[1]))
  console.groupEnd()

  console.groupEnd()
  console.groupCollapsed('uncommons')

  console.group('projectile')
  uncommons.forEach(ability => projectiles.includes(ability) && console.log(ability[1]))
  console.groupEnd()
  console.group('shield')
  uncommons.forEach(ability => shields.includes(ability) && console.log(ability[1]))
  console.groupEnd()
  console.group('status effects')
  uncommons.forEach(ability => status.includes(ability) && console.log(ability[1]))
  console.groupEnd()
  console.group('other')
  uncommons.forEach(ability => other.includes(ability) && console.log(ability[1]))
  console.groupEnd()

  console.groupEnd()
  console.groupCollapsed('rares')

  console.group('projectile')
  rares.forEach(ability => projectiles.includes(ability) && console.log(ability[1]))
  console.groupEnd()
  console.group('shield')
  rares.forEach(ability => shields.includes(ability) && console.log(ability[1]))
  console.groupEnd()
  console.group('status effects')
  rares.forEach(ability => status.includes(ability) && console.log(ability[1]))
  console.groupEnd()
  console.group('other')
  rares.forEach(ability => other.includes(ability) && console.log(ability[1]))
  console.groupEnd()

  console.groupEnd()


  console.log('\nSynergy Spread')
  console.table([
    { synergy: 'projectile', number: projectiles.length, percent: (projectiles.length / total * 100).toFixed(2) },
    { synergy: 'shield', number: shields.length, percent: (shields.length / total * 100).toFixed(2) },
    { synergy: 'status effects', number: status.length, percent: (status.length / total * 100).toFixed(2) },
    { synergy: 'other', number: other.length, percent: (other.length / total * 100).toFixed(2) },
  ])

  console.log('\nSynergy Spread Breakdown')
  console.groupCollapsed('projectile')
  projectiles.forEach(ability => console.log(ability[1]))
  console.groupEnd()
  console.groupCollapsed('shield')
  shields.forEach(ability => console.log(ability[1]))
  console.groupEnd()
  console.groupCollapsed('status effects')
  status.forEach(ability => console.log(ability[1]))
  console.groupEnd()
  console.groupCollapsed('other')
  other.forEach(ability => console.log(ability[1]))
  console.groupEnd()
}