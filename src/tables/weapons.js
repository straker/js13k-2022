import { movePoint } from '../libs/kontra.mjs'
import projectiles from './projectiles.js'

/*
  index stat properties:
  0 - id
  1 - rate of fire (seconds per attack)
  2 - projectile
  3 - effects


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
    45,
    projectiles[0],
    [
      // dash player forward
      player => {
        let { x, y } = movePoint(player, player.facingRot, 20)
        player.x = x
        player.y = y
      }
    ]
  ]
]

export default weapons
