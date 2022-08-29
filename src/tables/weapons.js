import projectiles from './projectiles.js'

/*
  index stat properties:
  0 - id
  1 - attack speed (seconds per attack)
  2 - projectile
  3 - on attack effects (added dynamically as weapon has no inherit effects)


  possible stats
  id
  damage
  fire_rate
  ammo
  num_projectiles
*/

const weapons = [
  // gauntlets
  [0, 45, projectiles[0]]
]

export default weapons
