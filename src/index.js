import {
  degToRad,
  rotatePoint,
  keyPressed,
  Vector,
  GameLoop,
  Text
} from './libs/kontra.mjs'

// call first so canvas will exist in all other files
import './init.js'
import './globals.js'

import player from './entities/player.js'
import {
  projectiles,
  spawnProjectile,
  removeDeadProjectiles
} from './entities/projectiles.js'
import { enemies, spawnEnemies, removeDeadEnemies } from './entities/enemies.js'
import { addToGrid, clearGrid } from './grid.js'
import { easeInSine, deepCopyArray, updateAndGetCollisions } from './utils.js'

let timeText = Text({
    text: '00:00',
    x: 25,
    y: 25,
    font: '26px Arial',
    color: 'white'
  }),
  totalGameTime = 60 * 10, // 10 minutes (600 seconds)
  gameTime = 0,
  spawnDt = 99, // high so first wave happens right away
  loop = GameLoop({
    update(dt) {
      clearGrid()

      /////////////////////////////////////////////
      // update game time
      /////////////////////////////////////////////
      gameTime += dt
      spawnDt += dt

      timeText.text = `${(((gameTime / 60) | 0) + '').padStart(2, 0)}:${(
        (gameTime % 60 | 0) +
        ''
      ).padStart(2, 0)}`

      /////////////////////////////////////////////
      // update enemies
      /////////////////////////////////////////////
      // spawn enemies every 5 seconds
      if (spawnDt >= 5) {
        spawnDt = 0

        // use a tween function to slowly increase the number
        // of enemies
        let numEnemies = easeInSine(gameTime, 5, 100, totalGameTime) | 0
        spawnEnemies(numEnemies, 0)
      }

      enemies.map(enemy => {
        let velocityVector = enemy.velocity

        enemy.behaviors.map(behavior => {
          velocityVector = velocityVector.add(behavior(enemy, player, enemies))
        })

        // smoothly transition enemy from current velocity to
        // new velocity by capping rotation to a max value
        let angle = degToRad(5)
        if (enemy.velocity.angle(velocityVector) > angle) {
          // determine if the velocityVector is clockwise or
          // counter-clockwise from the current velocity
          // @see https://stackoverflow.com/a/13221874/2124254
          let dot =
              enemy.velocity.x * -velocityVector.y +
              enemy.velocity.y * velocityVector.x,
            sign = dot > 0 ? -1 : 1,
            { x, y } = rotatePoint(enemy.velocity, angle * sign)
          velocityVector = Vector(x, y)
        }

        enemy.velocity = velocityVector.normalize().scale(enemy.speed)

        enemy.advance()
        addToGrid(enemy)
      })

      /////////////////////////////////////////////
      // update projectiles
      /////////////////////////////////////////////
      // fire projectiles before updating them so their
      // first position is checked for collision (otherwise
      // they move first and and no collision happens where
      // they first spawn)

      // apply abilities (deep copy objects so we don't
      // cause any unforseen problems due to mutation)
      let weapon = deepCopyArray(player.weapon),
        projectile = deepCopyArray(weapon[2])
      weapon[3] = []
      player.abilities.map(ability => {
        ability[1](weapon, projectile)
      })
      let [, attackSpeed, , effects] = weapon

      // attack
      if (++player.dt > attackSpeed && keyPressed('space')) {
        player.dt = 0
        spawnProjectile(projectile, player)
        effects.map(effect => effect(player))
      }

      projectiles.map(projectile => {
        let collisions = updateAndGetCollisions(projectile),
          { hit, pierce } = projectile,
          i = 0
        for (
          ;
          collisions[i] && hit.length < pierce && !hit.includes(collisions[i]);
          i++
        ) {
          hit.push(collisions[i])
          collisions[i].hp -= projectile.damage

          if (collisions[i].hp <= 0) {
            collisions[i].ttl = 0
          }
        }

        if (hit.length >= pierce) {
          projectile.ttl = 0
        }
      })

      /////////////////////////////////////////////
      // update player
      /////////////////////////////////////////////
      updateAndGetCollisions(player)

      removeDeadProjectiles()
      removeDeadEnemies()
    },
    render() {
      player.render()
      projectiles.map(projectile => projectile.render())
      enemies.map(enemy => enemy.render())
      timeText.render()
    }
  })
loop.start()
