import { movePoint } from '../libs/kontra.mjs'

/*
  all abilities take same parameters: weapon, projectile, player.

  index stat properties:
  0 - id
  1 - effect function
*/

const abilities = [
  // on attack: dash player forward
  [
    0,
    weapon => {
      weapon[3].push(player => {
        let { x, y } = movePoint(player, player.facingRot, 20)
        player.x = x
        player.y = y
      })
    }
  ]
]

export default abilities
