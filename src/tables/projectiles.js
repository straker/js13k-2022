/*
  index stat properties:
  0 - id
  1 - speed
  2 - size
  3 - damage
  4 - ttl
  5 - pierce
  6 - update function
  7 - render function
  8 - on hit effects (added dynamically as projectile has no inherit effects)

  ===== everything beyond this point is for ability modifications

  9 - num projectiles on explosion



  possible stats
  id
  draw
  projectile_speed
  projectile_size
  projectile_spread
  projectile_area
  projectile_piercing
  projectile_bounce
  effects {
    knockback

  }
*/

const projectiles = [
  // gauntlets
  [
    0,
    15,
    19,
    40,
    4,
    5,
    function () {
      this.opacity -= 1 / this.ttl / 2
    },
    function () {
      let { size, context } = this
      context.beginPath()
      context.strokeStyle = 'skyblue'
      context.lineWidth = 5
      // pixel perfect collision doesn't look visually
      // satisfying so we'll add a small padding around the
      // projectile by drawing it smaller than its size
      context.arc(0, 0, size - 4, PI, 0)
      context.stroke()
    }
  ],
  // pistol
  [
    1,
    15,
    12,
    10,
    25,
    1,
    function () {
      this.opacity -= 1 / this.ttl / 2
    },
    function () {
      let { size, context } = this
      context.beginPath()
      context.fillStyle = 'skyblue'
      context.lineWidth = 5
      // pixel perfect collision doesn't look visually
      // satisfying so we'll add a small padding around the
      // projectile by drawing it smaller than its size
      context.arc(0, 0, size - 4, 0, Math.PI * 2)
      context.fill()
    }
  ]
]

export default projectiles
