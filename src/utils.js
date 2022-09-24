import { getContext, movePoint } from './libs/kontra.mjs';
import { getFromGrid } from './grid.js';

export function getAngle(x, y) {
  if (x.x !== undefined) {
    y = x.y;
    x = x.x;
  }
  return Math.atan2(y, x) + Math.PI / 2;
}

export function circleCircleCollision(circle1, circle2) {
  return circle1.position.distance(circle2) <= circle1.size + circle2.size;
}

// @see https://github.com/chenglou/tween-functions
// @see https://docs.cocos.com/creator/3.5/manual/en/tween/img/tweener.png
export function easeInSine(t, b, _c, d) {
  const c = _c - b;
  return -c * Math.cos((t / d) * (Math.PI / 2)) + c + b;
}

export function easeLinear(t, b, _c, d) {
  const c = _c - b;
  return (c * t) / d + b;
}

export function deepCloneObject(object) {
  const clone = {};

  for (var property in object) {
    if (
      typeof object[property] === 'object' &&
      object[property] !== null &&
      clone[property]
    ) {
      deepCloneObject(clone[property], object[property]);
    } else {
      clone[property] = object[property];
    }
  }

  return clone;
}

// in order to calculate collision for a fast moving object
// we need to move the object by a fixed speed and check for
// collision at every interval
export function updateAndGetCollisions(obj, types) {
  // the fixed step size should not be larger than the smallest
  // enemy or enemy projectile diameter
  const fixedStep = 15;
  const length = obj.velocity.length();
  const collisions = [];
  let moveDistance = length;

  do {
    const { x, y } = movePoint(
      obj,
      getAngle(obj.velocity),
      Math.min(moveDistance, fixedStep)
    );

    obj.x = x;
    obj.y = y;

    const colliders = getFromGrid(obj, types);
    let i = colliders.length;
    while (i--) {
      const collider = colliders[i];
      if (
        circleCircleCollision(obj, collider) &&
        !collisions.includes(collider)
      ) {
        collisions.push(collider);
      }
    }

    moveDistance -= fixedStep;
  } while (moveDistance > 0);

  obj.update();
  obj.ttl--;

  return collisions;
}

export function removeDead(array) {
  return array.filter(item => item.isAlive());
}

export function fillBar(x, y, width, height, lineWidth, color, current, total) {
  const context = getContext();

  context.strokeStyle = 'white';
  context.fillStyle = color;
  context.lineWidth = lineWidth;
  context.strokeRect(x, y, width, height);
  context.fillRect(
    x + lineWidth,
    y + lineWidth,
    (width - lineWidth * 2) * (current / total),
    height - lineWidth * 2
  );
}
