import { movePoint } from './libs/kontra.mjs'
import { getFromGrid } from './grid.js'

export function getAngle(x, y) {
  if (x.x !== undefined) {
    y = x.y
    x = x.x
  }
  return atan2(y, x) + PI / 2
}

export function circleCircleCollision(circle1, circle2) {
  return circle1.position.distance(circle2) <= circle1.size + circle2.size
}

// @see https://github.com/chenglou/tween-functions
// @see https://docs.cocos.com/creator/3.5/manual/en/tween/img/tweener.png
export function easeInSine(t, b, _c, d) {
  let c = _c - b
  return -c * Math.cos((t / d) * (Math.PI / 2)) + c + b
}

export function deepCopyArray(array) {
  return array.map(item => {
    if (Array.isArray(item)) {
      return deepCopyArray(item)
    }
    return item
  })
}

// in order to calculate collision for a fast moving object
// we need to move the object by a fixed speed and check for
// collision at every interval
export function updateAndGetCollisions(obj) {
  // the fixed step size should not be larger than the smallest
  // enemy or enemy projectile diameter
  let fixedStep = 15,
    length = obj.velocity.length(),
    moveDistance = length,
    collisions = []
  do {
    let { x, y } = movePoint(
      obj,
      getAngle(obj.velocity),
      min(moveDistance, fixedStep)
    )

    obj.x = x
    obj.y = y

    let colliders = getFromGrid(obj),
      i = colliders.length
    while (i--) {
      let collider = colliders[i]
      if (
        circleCircleCollision(obj, collider) &&
        !collisions.includes(collider)
      ) {
        collisions.push(collider)
      }
    }

    moveDistance -= fixedStep
  } while (moveDistance > 0)

  obj.update()
  obj.ttl--

  return collisions
}
