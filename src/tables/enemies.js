/*
  index stat properties:
  0 - id
  1 - speed
  2 - size
  3 - color
  4 - hp



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

const enemies = [
  [0, 1.5, 10, 'red', 50],

  /**
   * enemy: wraith
   * @see https://github.com/straker/js13k-2022/issues/3#issuecomment-1223405705
   */
  [1, 1, 10, 'white', 150]
]

export default enemies
