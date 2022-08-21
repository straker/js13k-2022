import { movePoint } from '../libs/kontra.mjs'
import projectiles from './projectiles.js'

/*
  index stat properties:
  0 - id
  1 - damage
  2 - rate of fire (seconds per attack)
  3 - projectile
  4 - effects


  possible stats
  id
  damage
  fire_rate
  ammo
  num_projectiles
*/

const weapons = [
  // gauntlets
  [
    0,
    30,
    45,
    projectiles[0],
    [
      // dash player forward
      player => {
        let { x, y } = movePoint(player, player.facingRot, 10)
        player.x = x
        player.y = y
      }
    ]
  ]
]

export default weapons
