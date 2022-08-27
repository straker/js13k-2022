import { angleToTarget, Vector } from '../libs/kontra.mjs'

/*
  steering behaviors that allow enemies to move in various ways.
  all behaviors take same parameters: current enemy, player, and all enemies array.
*/

// avoidance (based on separation flocking behavior)
// @see https://gamedevelopment.tutsplus.com/tutorials/3-simple-rules-of-flocking-behaviors-alignment-cohesion-and-separation--gamedev-3444
// Note: slow for large groups of enemies (~350)
function avoidance(source, targets, distance) {
  let numNeighbors = 0,
    avoidanceVector = Vector()

  ;[].concat(targets).map(target => {
    if (source != target && source.position.distance(target) <= distance) {
      numNeighbors++
      avoidanceVector = avoidanceVector.add(
        target.position.subtract(source.position)
      )
    }
  })

  if (numNeighbors) {
    avoidanceVector = avoidanceVector
      .normalize(numNeighbors)
      .scale(-1)
      .normalize()
  }

  return avoidanceVector
}

const behaviors = [
  // seek player. apply a weighted scale to the vector
  // to make seeking player the lowest priority
  // @see https://gamedevelopment.tutsplus.com/tutorials/understanding-steering-behaviors-seek--gamedev-849
  (enemy, player) => {
    let angle = angleToTarget(enemy, player)
    return Vector(sin(angle), -cos(angle)).subtract(enemy.velocity).scale(0.9)
  },

  // avoid other enemies
  distance => (enemy, player, enemies) => avoidance(enemy, enemies, distance),

  // avoid player
  distance => (enemy, player) => avoidance(enemy, player, distance)
]

export default behaviors
