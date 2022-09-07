import { deepCopyArray } from '../utils.js'

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
  8 - status effects [
        0 - chill %
        1 - poison %
        2 - shock %
        3 - weaken %
        4 - effectiveness
        5 - duration (frames)
      ]

  ===== everything beyond this point is for ability modifications

  9 - on hit effects (added dynamically as projectile has no inherit effects)
  10 - num projectiles on explosion
  11 - damage % to add to enemies with stats effect
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
    5,
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

export function resetProjectile(projectile) {
  let proj = deepCopyArray(projectile)
  // set time below an increment of 60 so that status
  // effects like poison don't trigger immediately
  proj[8] = proj[8] ?? [0, 0, 0, 0, 0.2, 210]
  proj[9] = []
  proj[10] = proj[11] = 0
  return proj
}
