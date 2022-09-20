import { angleToTarget, Vector } from '../libs/kontra.mjs';
import { getFromGrid } from '../grid.js';

/*
  steering behaviors that allow enemies to move in various ways.
  all behaviors take same parameters: current enemy and player
*/

// avoidance (based on separation flocking behavior)
// @see https://gamedevelopment.tutsplus.com/tutorials/3-simple-rules-of-flocking-behaviors-alignment-cohesion-and-separation--gamedev-3444
// Note: slow for large groups of enemies (~350)
function avoidance(source, targets, distance) {
  let numNeighbors = 0;
  let avoidanceVector = Vector();

  [].concat(targets).map(target => {
    if (source != target && source.position.distance(target) <= distance) {
      numNeighbors++;
      avoidanceVector = avoidanceVector.add(
        target.position.subtract(source.position)
      );
    }
  });

  if (numNeighbors) {
    avoidanceVector = avoidanceVector
      .normalize(numNeighbors)
      .scale(-1)
      .normalize();
  }

  return avoidanceVector;
}

const behaviors = {
  // apply a weighted scale to the vector to make seeking
  // player the lowest priority
  // @see https://gamedevelopment.tutsplus.com/tutorials/understanding-steering-behaviors-seek--gamedev-849
  seekPlayer(enemy, player) {
    const angle = angleToTarget(enemy, player);
    return Vector(sin(angle), -cos(angle)).subtract(enemy.velocity).scale(0.9);
  },
  avoidEnemies(distance) {
    return enemy => avoidance(enemy, getFromGrid(enemy, 0), distance);
  },
  avoidPlayer(distance) {
    return (enemy, player) => avoidance(enemy, player, distance);
  }
};

export default behaviors;
