import { getCanvas, keyPressed, GameLoop, Text } from './libs/kontra.mjs';

// call first so canvas will exist in all other files
import './init.js';

import { spawnPlayer, resetPlayer } from './entities/player.js';
import { projectiles, removeDeadProjectiles } from './entities/projectiles.js';
import {
  enemies,
  enemiesDead,
  spawnEnemies,
  removeDeadEnemies
} from './entities/enemies.js';
import {
  experiences,
  spawnExperience,
  removeDeadExperience
} from './entities/experience.js';
import { damageTexts, removeDeadDamageTexts } from './entities/damage-text.js';
import { resetWeapon } from './tables/weapons.js';
import { resetProjectile } from './tables/projectiles.js';
import { addToGrid, clearGrid } from './grid.js';
import {
  easeInSine,
  easeLinear,
  updateAndGetCollisions,
  circleCircleCollision,
  fillBar
} from './utils.js';
import { updateTimers } from './timer.js';
import { levelUp } from './level-up.js';

// TODO: remove
// output card stats
import { logAbilityStats } from './tables/abilities.js';
logAbilityStats();

const canvas = getCanvas();

let texts = [
  // timer
  Text({
    text: '00:00',
    x: 10,
    y: 45,
    font: '26px Arial',
    color: 'white'
  }),
  // kill count
  Text({
    text: 'Kills: 0',
    x: canvas.width - 10,
    y: 45,
    font: '26px Arial',
    color: 'white',
    anchor: { x: 1, y: 0 }
  }),
  // player level
  Text({
    text: 'Lvl: 1',
    x: canvas.width - 20,
    y: 14,
    font: '18px Arial',
    anchor: { x: 1, y: 0 },
    color: 'white',
    strokeColor: '#333',
    strokeWidth: 4
  })
];

const player = spawnPlayer();
const totalGameTime = 60 * 10; // 10 minutes (600 seconds)
let gameTime = 0;
let spawnDt = 99; // high so first wave happens right away

const loop = GameLoop({
  update(dt) {
    if (this.pause) return;
    clearGrid();

    /////////////////////////////////////////////
    // update game time
    /////////////////////////////////////////////
    gameTime += dt;
    spawnDt += dt;

    texts[0].text = `${(((gameTime / 60) | 0) + '').padStart(2, 0)}:${(
      (gameTime % 60 | 0) +
      ''
    ).padStart(2, 0)}`;

    /////////////////////////////////////////////
    // update enemies
    /////////////////////////////////////////////
    // spawn enemies every 5 seconds
    if (enemies.length < 400 && spawnDt >= 5) {
      spawnDt = 0;

      // use a tween function to slowly increase the number
      // of enemies
      const numEnemies = easeInSine(gameTime, 5, 100, totalGameTime) | 0;
      const modifier = easeLinear(gameTime, 1, 3, totalGameTime);

      spawnEnemies(numEnemies, 'ghost', modifier);
    }

    enemies.map(enemy => {
      enemy.update(player);

      if (enemy.hp <= 0) {
        spawnExperience(enemy);
        enemy.ttl = 0;
      } else {
        addToGrid(enemy);
      }
    });

    /////////////////////////////////////////////
    // update projectiles
    /////////////////////////////////////////////
    // fire projectiles before updating them so their
    // first position is checked for collision (otherwise
    // they move first and and no collision happens where
    // they first spawn)

    // apply abilities
    const weapon = resetWeapon(player.weapon);
    const projectile = resetProjectile(weapon.projectile);
    resetPlayer();

    player.abilities
      // sort abilities by priority
      .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))
      .map(ability => {
        ability.effect(weapon, projectile, player);
      });

    // attack
    if (++player.dt > weapon.attackSpeed && keyPressed('space')) {
      player.fire(weapon, projectile);
    }

    // update any timers before updating projectiles to
    // account for any added projectiles (e.g. repeat attack)
    updateTimers();

    projectiles.map(projectile => {
      const collisions = updateAndGetCollisions(projectile, 0);
      const { hit, pierce } = projectile;

      for (
        let i = 0, collision;
        (collision = collisions[i]) && hit.length < pierce;
        i++
      ) {
        if (collision.isAlive() && !hit.includes(collision)) {
          hit.push(collision);
          // apply effects before dealing damage so effects
          // can increase damage
          projectile.onHitEffects.map(effect => effect(collision, projectile));
          collision.takeDamage(projectile.damage, 0);
        }
      }

      if (hit.length >= pierce) {
        projectile.ttl = 0;
      }
    });

    /////////////////////////////////////////////
    // update experience
    /////////////////////////////////////////////
    experiences.map(experience => {
      experience.update(player);
      addToGrid(experience);
    });

    /////////////////////////////////////////////
    // update player
    /////////////////////////////////////////////
    // for the purposes of collision we'll use the players
    // pickup size in order to easily find all experience
    // orbs on the ground
    const collisions = updateAndGetCollisions(player, [0, 1]);
    collisions.map(collision => {
      if (collision.type == 1) {
        collision.active = true;
      }

      if (
        collision.type == 0 &&
        circleCircleCollision(
          { position: player.position, size: player.width - 10 },
          collision
        ) &&
        collision.attackDt > collision.attackSpeed
      ) {
        collision.attackDt = 0;
        player.takeDamage(collision.damage, 0, collision, projectile);
      }
    });

    // game over
    if (player.hp <= 0) {
      texts.push(
        Text({
          text: 'Game Over',
          font: '36px Arial',
          color: 'white',
          x: canvas.width / 2,
          y: 175,
          anchor: { x: 0.5, y: 0.5 }
        })
      );
      setTimeout(() => loop.stop());
    }

    // level up player
    if (player.xp >= player.reqXp) {
      const diff = player.xp - player.reqXp;
      player.lvl++;
      texts[2].text = 'Lvl: ' + player.lvl;
      player.xp = diff;
      // simple exponential curve for determining next level
      // @see https://gamedev.stackexchange.com/a/13640/33867
      player.reqXp += (player.lvl ** 1.25) | 0;

      loop.pause = true;
      levelUp(ability => {
        if (ability) {
          player.abilities.push(ability);
        }
        loop.pause = false;
      });
    }

    /////////////////////////////////////////////
    // update texts
    /////////////////////////////////////////////
    texts[1].text = `Kills: ${enemiesDead}`;
    damageTexts.map(text => text.update());
  },
  render() {
    experiences.map(experience => experience.render());
    player.render();
    projectiles.map(projectile => projectile.render());
    enemies.map(enemy => enemy.render());

    // experience bar
    fillBar(
      10,
      10,
      canvas.width - 20,
      25,
      3,
      '#60AC53',
      player.xp,
      player.reqXp
    );

    texts.map(text => text.render());
    damageTexts.map(text => text.render());

    // remove after rendering so projectiles look like they
    // killed the enemy where they hit instead before they
    // hit
    removeDeadProjectiles();
    removeDeadEnemies();
    removeDeadExperience();
    removeDeadDamageTexts();
    texts = texts.filter(text => text.isAlive());
  }
});
loop.start();
