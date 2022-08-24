export function getAngle(x, y) {
  return atan2(y, x) + PI / 2
}

export function circleCircleCollision(circle1, circle2) {
  return (
    (circle2.x - circle1.x) ** 2 + (circle2.y - circle1.y) ** 2 <=
    (circle1.size + circle2.size) ** 2
  )
}
