import behaviors from './behaviors.js'
/*
  index stat properties:
  0 - id
  1 - speed
  2 - size (radius)
  3 - color
  4 - hp
  5 - damage
  6 - attack speed (frames per attack)
  7 - xp
  8 - behaviors
*/

const enemies = [
  [0, 1, 10, 'red', 7, 2, 120, 1, [behaviors[0], behaviors[1](22)]],
  [
    1,
    1,
    10,
    'yellow',
    10,
    10,
    5,
    [behaviors[0], behaviors[1](22), behaviors[2](150)]
  ]
]

export default enemies
