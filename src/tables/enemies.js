import behaviors from './behaviors.js'
/*
  index stat properties:
  0 - id
  1 - speed
  2 - size
  3 - color
  4 - hp
  5 - behaviors



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
  [0, 1, 10, 'red', 10, [behaviors[0], behaviors[1](22)]],
  [0, 1, 10, 'yellow', 10, [behaviors[0], behaviors[1](22), behaviors[2](150)]]
]

export default enemies
