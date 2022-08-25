export function getAngle(x, y) {
  return atan2(y, x) + PI / 2
}

export function circleCircleCollision(circle1, circle2) {
  return (
    (circle2.x - circle1.x) ** 2 + (circle2.y - circle1.y) ** 2 <=
    (circle1.size + circle2.size) ** 2
  )
}

/**
 * algorithm for 2D baddy -> player collision
 * @see https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection */
export function baddyPlayerCollision(baddy, player) {
  return (
    player.x < baddy.x + player.width &&
    player.x + player.width > player.x &&
    player.y < baddy.y + player.height &&
    player.height + player.y > player.y
  )
}
