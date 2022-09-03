import { keyPressed, GameLoop, Text } from './libs/kontra.mjs'

// call first so canvas will exist in all other files
import './init.js'
import './globals.js'

import { player, resetPlayer } from './entities/player.js'
import { projectiles, removeDeadProjectiles } from './entities/projectiles.js'
import {
  enemies,
  enemiesDead,
  spawnEnemies,
  removeDeadEnemies
} from './entities/enemies.js'
import {
  experiences,
  spawnExperience,
  removeDeadExperience
} from './entities/experience.js'
import { resetWeapon } from './tables/weapons.js'
import { resetProjectile } from './tables/projectiles.js'
import { addToGrid, clearGrid } from './grid.js'
import { easeInSine, updateAndGetCollisions } from './utils.js'
import { updateTimers } from './timer.js'
import { levelUp } from './level-up.js'

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
  ],
  totalGameTime = 60 * 10, // 10 minutes (600 seconds)
  gameTime = 0,
  spawnDt = 99, // high so first wave happens right away
  loop = GameLoop({
    update(dt) {
      if (this.pause) return
      clearGrid()

      /////////////////////////////////////////////
      // update game time
      /////////////////////////////////////////////
      gameTime += dt
      spawnDt += dt

      texts[0].text = `${(((gameTime / 60) | 0) + '').padStart(2, 0)}:${(
        (gameTime % 60 | 0) +
        ''
      ).padStart(2, 0)}`

      /////////////////////////////////////////////
      // update enemies
      /////////////////////////////////////////////
      // spawn enemies every 5 seconds
      if (enemies.length < 400 && spawnDt >= 5) {
        spawnDt = 0

        // use a tween function to slowly increase the number
        // of enemies
        let numEnemies = easeInSine(gameTime, 5, 100, totalGameTime) | 0
        spawnEnemies(numEnemies, 0)
      }

      enemies.map(enemy => {
        enemy.update(player)
        addToGrid(enemy)
      })

      /////////////////////////////////////////////
      // update projectiles
      /////////////////////////////////////////////
      // fire projectiles before updating them so their
      // first position is checked for collision (otherwise
      // they move first and and no collision happens where
      // they first spawn)

      // apply abilities
      let weapon = resetWeapon(player.weapon),
        projectile = resetProjectile(weapon[2])
      resetPlayer()

      player.abilities
        // sort abilities by priority
        .sort((a, b) => (a[3] ?? 0) - (b[3] ?? 0))
        .map(ability => {
          ability[2](weapon, projectile, player)
        })

      // attack
      if (++player.dt > weapon[1] && keyPressed('space')) {
        player.fire(weapon, projectile)
      }

      // update any timers before updating projectiles to
      // account for any added projectiles (e.g. repeat attack)
      updateTimers()

      projectiles.map(projectile => {
        let collisions = updateAndGetCollisions(projectile, 0),
          { hit, pierce } = projectile,
          i = 0,
          collision
        for (; (collision = collisions[i]) && hit.length < pierce; i++) {
          if (collision.isAlive() && !hit.includes(collision)) {
            hit.push(collision)
            // apply effects before dealing damage so effect
            // can increase damage
            projectile.effects.map(effect => effect(collision))
            collision.hp -= projectile.damage

            // damage text
            texts.push(
              Text({
                text: projectile.damage,
                x: collision.x,
                y: collision.y,
                font: '24px Arial',
                color: 'yellow',
                strokeColor: 'black',
                storkeSize: 0.5,
                anchor: { x: 0.5, y: 0.5 },
                update() {
                  this.opacity -= 0.025
                  this.y -= 2
                  if (this.opacity <= 0) {
                    this.ttl = 0
                  }
                }
              })
            )

            if (collision.hp <= 0) {
              spawnExperience(collision)
              collision.ttl = 0
            }
          }
        }

        if (hit.length >= pierce) {
          projectile.ttl = 0
        }
      })

      /////////////////////////////////////////////
      // update experience
      /////////////////////////////////////////////
      experiences.map(experience => {
        experience.update(player)
        addToGrid(experience)
      })

      /////////////////////////////////////////////
      // update player
      /////////////////////////////////////////////
      // for the purposes of collision we'll use the players
      // pickup size in order to easily find all experience
      // orbs on the ground
      let collisions = updateAndGetCollisions(player, [0, 1])
      collisions.map(collision => {
        if (collision.type == 1) {
          collision.active = true
        }
      })

      // level up player
      if (player.xp >= player.reqXp) {
        let diff = player.xp - player.reqXp
        player.lvl++
        texts[2].text = 'Lvl: ' + player.lvl
        player.xp = diff
        // simple exponential curve for determining next level
        // @see https://gamedev.stackexchange.com/a/13640/33867
        player.reqXp += (player.lvl ** 1.25) | 0

        loop.pause = true
        levelUp(ability => {
          if (ability) {
            player.abilities.push(ability)
          }
          loop.pause = false
        })
      }

      /////////////////////////////////////////////
      // update texts
      /////////////////////////////////////////////
      texts[1].text = `Kills: ${enemiesDead}`
      texts.map(text => text.update())
    },
    render() {
      experiences.map(experience => experience.render())
      player.render()
      projectiles.map(projectile => projectile.render())
      enemies.map(enemy => enemy.render())

      // experience bar
      context.strokeStyle = 'white'
      context.fillStyle = '#60AC53'
      context.lineWidth = 3
      let width = canvas.width - 20,
        fill = player.xp / player.reqXp
      context.strokeRect(10, 10, width, 25)
      context.fillRect(13, 13, (width - 6) * fill, 19)

      texts.map(text => text.render())

      // remove after rendering so projectiles look like they
      // killed the enemy where they hit instead before they
      // hit
      removeDeadProjectiles()
      removeDeadEnemies()
      removeDeadExperience()
      texts = texts.filter(text => text.isAlive())
    }
  })
loop.start()
