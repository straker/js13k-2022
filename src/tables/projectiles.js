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
  8 - effects



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
    15,
    40,
    4,
    5,
    function () {
      this.opacity -= 1 / this.ttl / 2
      this.advance()
    },
    function () {
      let { size, context } = this
      context.beginPath()
      context.strokeStyle = 'skyblue'
      context.lineWidth = 5
      context.arc(0, 0, size, PI, 0)
      context.stroke()
    }
  ]
]

export default projectiles
