import { degToRad } from '../libs/kontra.mjs';
import { addTimer, addContinuousTimer } from '../timer.js';
import { deepCloneObject } from '../utils.js';
import { spawnProjectile } from '../entities/projectiles.js';

let numProjectiles = 0;
let numShields = 0;

// add an on hit effect only once
function addOnce(projectile, ability) {
  if (!projectile.onHitEffects.includes(ability)) {
    projectile.onHitEffects.push(ability);
  }
}

function addStatusEffect(projectile) {
  function applyStatus(entity) {
    // don't apply status to first hit (so shock doesn't
    // increase damage on first attack)
    addTimer(1, () => {
      let statusEffects = projectile.statusEffects;
      ['chill', 'poison', 'shock', 'weaken'].map(status => {
        if (statusEffects[status] && Math.random() <= statusEffects[status]) {
          entity.statuses[status].amount = statusEffects.effectivness;
          entity.statuses[status].duration = statusEffects.duration;
        }
      });
    });
  }

  addOnce(projectile, applyStatus);
}

function addIncreaseDamage(projectile) {
  function increaseDamage(entity) {
    // don't apply to the first attack
    addTimer(1, () => {
      console.log(projectile.damageToEnemiesWithStats);
      entity.damageFromAllSources = projectile.damageToEnemiesWithStats;
    });
  }

  addOnce(projectile, increaseDamage);
}

/*
  all abilities take same parameters: weapon, projectile
*/
let abilities = [
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
  {
    rarity: 0,
    text: '+1 Projectile\nProjectile Damage -2\nSpread +5',
    effect(weapon, projectile) {
      weapon.numProjectiles++;
      projectile.damage = Math.max(projectile.damage - 2, 1);
      weapon.spread += 5;
    }
  },
  // 1
  {
    rarity: 0,
    text: 'Projectile Damage +2\nProjectile Size +3',
    effect(weapon, projectile) {
      projectile.damage += 2;
      projectile.size += 3;
    }
  },
  // 2
  {
    rarity: 0,
    text: 'Projectile Damage +4',
    effect(weapon, projectile) {
      projectile.damage += 4;
    }
  },
  // 3
  {
    rarity: 0,
    text: 'Projectile Damage +7\nProjectile Size -1',
    effect(weapon, projectile) {
      projectile.damage += 7;
      projectile.size = Math.max(projectile.size - 1, 1);
    }
  },
  // 4
  {
    rarity: 1,
    text: 'Projectile Pierce +1',
    effect(weapon, projectile) {
      projectile.pierce++;
    }
  },
  // 5
  {
    rarity: 2,
    text: 'Repeat attack after a short delay',
    effect(weapon, projectile, player) {
      // don't add the repeat attack on to the repeated attack
      // TODO: handle multiple repeat attacks
      const wep = deepCloneObject(weapon);
      weapon.onAttackEffects.push(() => {
        addTimer(Math.max(weapon.attackSpeed - 10, 5), () =>
          player.fire(wep, projectile)
        );
      });
    },
    priority: 9 // repeat attack should have all abilities
  },
  // 6
  {
    rarity: 2,
    text: 'Double total number of Projectiles',
    effect(weapon) {
      weapon.numProjectiles *= 2;
    },
    priority: 5 // double after other abilities add projectiles
  },
  // TODO: need a way to reset global numProjectiles after
  // removing the ability
  // 7
  {
    rarity: 2,
    text: 'Every one minute gain: +1 Projectile',
    effect(weapon) {
      weapon.numProjectilesPerMinute += 1;

      // only add total num projectiles once
      if (weapon.numProjectilesPerMinute === 1) {
        weapon.numProjectiles += numProjectiles;
      }

      // 1 minute (3600 frames)
      addContinuousTimer(0, 3600, () => {
        numProjectiles += weapon.numProjectilesPerMinute;
      });
    }
  },
  // 8
  {
    rarity: 1,
    text: 'Enemies explode into small Projectiles when killed. +3 Projectiles per card',
    effect(weapon, projectile) {
      projectile.numProjectilesOnExplosion += 3;

      if (projectile.numProjectilesOnExplosion === 3) {
        // don't add explode projectile to the exploding
        // projectile
        const proj = deepCloneObject(projectile);
        projectile.onHitEffects.push(entity => {
          const num =
            weapon.numProjectiles + projectile.numProjectilesOnExplosion;
          const angle = degToRad(360 / num);

          // reduce stats
          proj.speed = 5;
          proj.size = max(proj.size * 0.25, 8);
          proj.damage = max(round(proj.damage * 0.25), 1);
          proj.ttl = 10;
          proj.pierce = max(proj.pierce * 0.25, 1);

          for (let i = 0; i < num; i++) {
            spawnProjectile(proj, entity, angle * i);
          }
        });
      }
    },
    priority: 8 // explosion should get all projectile bonuses
  },
  // 9
  {
    rarity: 0,
    text: 'Attack Speed +5%',
    effect(weapon) {
      weapon.attackSpeed -= weapon.attackSpeed * 0.05;
    }
  },
  // 10
  {
    rarity: 0,
    text: 'Move Speed +5%',
    effect(weapon, projectile, player) {
      player.speed *= 1.05;
    }
  },
  // 11
  {
    rarity: 0,
    text: 'Health +5%',
    effect(weapon, projectile, player) {
      player.maxHp *= 1.05;
    }
  },
  // 12
  {
    rarity: 1,
    text: 'Attack Speed +15%',
    effect(weapon) {
      weapon.attackSpeed -= weapon.attackSpeed * 0.15;
    }
  },
  // 13
  {
    rarity: 1,
    text: 'Move Speed +15%',
    effect(weapon, projectile, player) {
      player.speed *= 1.15;
    }
  },
  // 14
  {
    rarity: 1,
    text: 'Health +15%',
    effect(weapon, projectile, player) {
      player.maxHp *= 1.15;
    }
  },
  // 15
  {
    rarity: 0,
    text: 'Pickup Distance +20%',
    effect(weapon, projectile, player) {
      player.size *= 1.2;
    }
  },
  // 16
  {
    rarity: 0,
    text: '+20% to apply Chill status on hit (slows enemy movement)',
    effect(weapon, projectile) {
      projectile.statusEffects.chill += 0.2;
      addStatusEffect(projectile);
    },
    priority: 6 // don't apply before ability to add damage to targets with stats
  },
  // 17
  {
    rarity: 0,
    text: '+20% to apply Poison status on hit (damage over time)',
    effect(weapon, projectile) {
      projectile.statusEffects.poison += 0.2;
      addStatusEffect(projectile);
    },
    priority: 6 // don't apply before ability to add damage to targets with stats
  },
  // 18
  {
    rarity: 0,
    text: '+20% to apply Shock status on hit (increases damage taken from Projectiles)',
    effect(weapon, projectile) {
      projectile.statusEffects.shock += 0.2;
      addStatusEffect(projectile);
    },
    priority: 6 // don't apply before ability to add damage to targets with stats
  },
  // TODO: implement
  // 19
  {
    rarity: 0,
    text: '+20% to apply Weaken status on hit (reduces damage dealt)',
    effect(weapon, projectile) {
      projectile.statusEffects.weaken += 0.2;
      addStatusEffect(projectile);
    },
    priority: 6 // don't apply before ability to add damage to targets with stats
  },
  // 20
  {
    rarity: 1,
    text: 'Status chance +10%',
    effect(weapon, projectile) {
      ['chill', 'poison', 'shock', 'weaken'].map(status => {
        if (projectile.statusEffects[status] > 0) {
          projectile.statusEffects[status] += 0.1;
        }
      });
      addStatusEffect(projectile);
    },
    priority: 7 // apply after other status effect cards
  },
  // 21
  {
    rarity: 1,
    text: 'Status duration +2 seconds',
    effect(weapon, projectile) {
      projectile.statusEffects.duration += 120;
    }
  },
  // 22
  {
    rarity: 1,
    text: 'Status effectiveness +20%',
    effect(weapon, projectile) {
      projectile.statusEffects.effectivness += 0.2;
    }
  },
  // 23
  {
    rarity: 2,
    text: 'Enemies with a status effect take +20% damage from all sources',
    effect(weapon, projectile) {
      projectile.damageToEnemiesWithStats += 0.2;
      addIncreaseDamage(projectile);
    }
  },
  // 24
  {
    rarity: 0,
    text: 'Gain +20 Shield. Shields absorb damage and recover slowly after a delay',
    effect(weapon, projectile, player) {
      player.shields.max += 20;
    }
  },
  // 25
  {
    rarity: 0,
    text: 'Recover Shield on hit up to +10% of Projectile damage',
    effect(weapon, projectile, player) {
      projectile.onHitEffects.push(
        () =>
          (player.shields.current = Math.min(
            player.shields.current + projectile.damage * 0.1,
            player.shields.max
          ))
      );
    }
  },
  // 26
  {
    rarity: 1,
    text: 'Shield recovery delay -30%',
    effect(weapon, projectile, player) {
      player.shields.recoveryDelay *= 1.3;
    }
  },
  // 27
  {
    rarity: 1,
    text: 'Shield recovery speed +30%',
    effect(weapon, projectile, player) {
      player.shields.recoverySpeed *= 1.3;
    }
  },
  // 28
  {
    rarity: 1,
    text: 'Shield deals +20% of Projectile damage to the attacker',
    effect(weapon, projectile, player) {
      player.shields.spikeDamagePercent = player.shields.spikeDamagePercent
        ? player.shields.spikeDamagePercent * 1.2 - 1
        : 1.2;
    }
  },
  // 29
  {
    rarity: 2,
    text: 'Double total amount of Shield',
    effect(weapon, projectile, player) {
      player.shields.max *= 2;
    },
    priority: 5 // double after other abilities add shields
  },
  // TODO: need a way to reset global numShields after
  // removing the ability
  // 30
  {
    rarity: 2,
    text: 'Every one minute gain: +20 Shield',
    effect(weapon, projectile, player) {
      player.shields.numShieldsPerMinute += 1;

      // only add total num shields once
      if (player.shields.numShieldsPerMinute === 1) {
        player.shields.max += numShields;
      }

      // 1 minute (3600 frames)
      addContinuousTimer(0, 3600, () => {
        numShields += player.shields.numShieldsPerMinute;
      });
    }
  },
  // 31
  {
    rarity: 1,
    text: 'Experience +15%',
    effect(weapon, projectile, player) {
      player.xpGain *= 1.15;
    }
  },
  // 32
  {
    rarity: 1,
    text: 'Projectile Damage +10\nAttack Speed -10%',
    effect(weapon, projectile) {
      projectile.damage += 10;
      weapon.attackSpeed *= 1.1;
    }
  }
];

export default abilities;

export function logAbilityStats() {
  let commons = abilities.filter(ability => ability.rarity == 0);
  let uncommons = abilities.filter(ability => ability.rarity == 1);
  let rares = abilities.filter(ability => ability.rarity == 2);
  let total = abilities.filter(ability =>
    [0, 1, 2].includes(ability.rarity)
  ).length;

  let projectiles = abilities.filter(ability => {
    let str = ability.text.toLowerCase();
    let projectileIndex = str.indexOf('projectile');
    let shieldIndex = str.indexOf('shield');
    let statusIndex = str.indexOf('status');

    return (
      [0, 1, 2].includes(ability.rarity) &&
      projectileIndex > -1 &&
      (shieldIndex > -1 ? projectileIndex < shieldIndex : true) &&
      (statusIndex > -1 ? projectileIndex < statusIndex : true)
    );
  });
  let shields = abilities.filter(ability => {
    let str = ability.text.toLowerCase();
    let projectileIndex = str.indexOf('projectile');
    let shieldIndex = str.indexOf('shield');
    let statusIndex = str.indexOf('status');

    return (
      [0, 1, 2].includes(ability.rarity) &&
      shieldIndex > -1 &&
      (projectileIndex > -1 ? shieldIndex < projectileIndex : true) &&
      (statusIndex > -1 ? projectileIndex < statusIndex : true)
    );
  });
  let status = abilities.filter(ability => {
    let str = ability.text.toLowerCase();
    let projectileIndex = str.indexOf('projectile');
    let shieldIndex = str.indexOf('shield');
    let statusIndex = str.indexOf('status');

    return (
      [0, 1, 2].includes(ability.rarity) &&
      statusIndex > -1 &&
      (shieldIndex > -1 ? statusIndex < shieldIndex : true) &&
      (projectileIndex > -1 ? statusIndex < projectileIndex : true)
    );
  });
  let other = abilities.filter(ability => {
    return (
      [0, 1, 2].includes(ability.rarity) &&
      !projectiles.includes(ability) &&
      !shields.includes(ability) &&
      !status.includes(ability)
    );
  });

  console.log('Rarity Spread');
  console.table([
    {
      rarity: 'common',
      number: commons.length,
      percent: ((commons.length / total) * 100).toFixed(2),
      targetPercent: '25 - 28'
    },
    {
      rarity: 'uncommon',
      number: uncommons.length,
      percent: ((uncommons.length / total) * 100).toFixed(2),
      targetPercent: '47 - 51'
    },
    {
      rarity: 'rare',
      number: rares.length,
      percent: ((rares.length / total) * 100).toFixed(2),
      targetPercent: '22 - 27'
    }
  ]);

  console.log('\nRarity Spread Breakdown');
  console.groupCollapsed('commons');

  console.group('projectile');
  commons.forEach(
    ability => projectiles.includes(ability) && console.log(ability.text)
  );
  console.groupEnd();
  console.group('shield');
  commons.forEach(
    ability => shields.includes(ability) && console.log(ability.text)
  );
  console.groupEnd();
  console.group('status effects');
  commons.forEach(
    ability => status.includes(ability) && console.log(ability.text)
  );
  console.groupEnd();
  console.group('other');
  commons.forEach(
    ability => other.includes(ability) && console.log(ability.text)
  );
  console.groupEnd();

  console.groupEnd();
  console.groupCollapsed('uncommons');

  console.group('projectile');
  uncommons.forEach(
    ability => projectiles.includes(ability) && console.log(ability.text)
  );
  console.groupEnd();
  console.group('shield');
  uncommons.forEach(
    ability => shields.includes(ability) && console.log(ability.text)
  );
  console.groupEnd();
  console.group('status effects');
  uncommons.forEach(
    ability => status.includes(ability) && console.log(ability.text)
  );
  console.groupEnd();
  console.group('other');
  uncommons.forEach(
    ability => other.includes(ability) && console.log(ability.text)
  );
  console.groupEnd();

  console.groupEnd();
  console.groupCollapsed('rares');

  console.group('projectile');
  rares.forEach(
    ability => projectiles.includes(ability) && console.log(ability.text)
  );
  console.groupEnd();
  console.group('shield');
  rares.forEach(
    ability => shields.includes(ability) && console.log(ability.text)
  );
  console.groupEnd();
  console.group('status effects');
  rares.forEach(
    ability => status.includes(ability) && console.log(ability.text)
  );
  console.groupEnd();
  console.group('other');
  rares.forEach(
    ability => other.includes(ability) && console.log(ability.text)
  );
  console.groupEnd();

  console.groupEnd();

  console.log('\nSynergy Spread');
  console.table([
    {
      synergy: 'projectile',
      number: projectiles.length,
      percent: ((projectiles.length / total) * 100).toFixed(2)
    },
    {
      synergy: 'shield',
      number: shields.length,
      percent: ((shields.length / total) * 100).toFixed(2)
    },
    {
      synergy: 'status effects',
      number: status.length,
      percent: ((status.length / total) * 100).toFixed(2)
    },
    {
      synergy: 'other',
      number: other.length,
      percent: ((other.length / total) * 100).toFixed(2)
    }
  ]);

  console.log('\nSynergy Spread Breakdown');
  console.groupCollapsed('projectile');
  projectiles.forEach(ability => console.log(ability.text));
  console.groupEnd();
  console.groupCollapsed('shield');
  shields.forEach(ability => console.log(ability.text));
  console.groupEnd();
  console.groupCollapsed('status effects');
  status.forEach(ability => console.log(ability.text));
  console.groupEnd();
  console.groupCollapsed('other');
  other.forEach(ability => console.log(ability.text));
  console.groupEnd();
}
