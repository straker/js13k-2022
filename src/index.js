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
import { projectiles, removeDeadProjectiles } from './entities/projectiles.js'
import {
  enemies,
  enemiesDead,
  spawnEnemies,
  removeDeadEnemies
} from './entities/enemies.js'
import { addToGrid, clearGrid } from './grid.js'
import { easeInSine, deepCopyArray, updateAndGetCollisions } from './utils.js'
import { updateTimers } from './timer.js'

let texts = [
    // timer
    Text({
      text: '00:00',
      x: 25,
      y: 25,
      font: '26px Arial',
      color: 'white'
    }),
    // kill count
    Text({
      text: 'Kills: 0',
      x: 850,
      y: 25,
      font: '26px Arial',
      color: 'white'
    })
  ],
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

      texts[0].text = `${(((gameTime / 60) | 0) + '').padStart(2, 0)}:${(
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
          velocityVector = velocityVector.add(behavior(enemy, player))
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
      weapon[5] = []
      projectile[8] = []

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
        let collisions = updateAndGetCollisions(projectile),
          { hit, pierce } = projectile,
          i = 0,
          collision
        for (
          ;
          (collision = collisions[i]) &&
          collision.isAlive() &&
          hit.length < pierce &&
          !hit.includes(collision);
          i++
        ) {
          hit.push(collision)
          collision.hp -= projectile.damage
          projectile.effects.map(effect => effect(collision))
          texts.push(
            Text({
              text: projectile.damage,
              x: collision.x,
              y: collision.y,
              font: '24px Arial',
              color: 'yellow',
              anchor: { x: 0.5, y: 0.5 },
              ttl: 10,
              update() {
                this.opacity -= 1 / this.ttl / 4
                this.y -= 2
              },
              render() {
                this.draw()
                this.context.strokeStyle = 'black'
                this.context.lineWidth = 0.5
                this.context.strokeText(this.text, 0, 0)
              }
            })
          )

          if (collision.hp <= 0) {
            collision.ttl = 0
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

      /////////////////////////////////////////////
      // update texts
      /////////////////////////////////////////////
      texts[1].text = `Kills: ${enemiesDead}`
      texts.map(text => text.update())
    },
    render() {
      player.render()
      projectiles.map(projectile => projectile.render())
      enemies.map(enemy => enemy.render())
      texts.map(text => text.render())

      // remove after rendering so projectiles look like they
      // killed the enemy where they hit instead before they
      // hit
      removeDeadProjectiles()
      removeDeadEnemies()
      texts = texts.filter(text => text.isAlive())
    }
  })
loop.start()
