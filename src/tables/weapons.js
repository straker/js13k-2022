import projectiles from './projectiles.js'
import { deepCopyArray } from '../utils.js'

/*
  index stat properties:
  0 - id
  1 - attack speed (frames per attack)
  2 - projectile
  3 - spread (in degrees)
  4 - number of projectiles

  ===== everything beyond this point is for ability modifications

  5 - on attack effects (added dynamically as weapon has no inherit effects)
  6 - num projectiles to add every n time
*/

const weapons = [
  // gauntlets
  [0, 45, projectiles[0], 15, 1, []],
  // pistol
  [0, 30, projectiles[1], 9, 1, []]
]

export function resetWeapon(weapon) {
  // (deep copy objects so we don't cause any unforeseen
  // problems due to mutation)
  let wep = deepCopyArray(weapon)
  wep[6] = 0
  return wep
}

export default weapons
