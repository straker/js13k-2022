import projectilesTable from './projectiles.js';
import { deepCloneObject } from '../utils.js';

const weaponTable = {
  guantlet: {
    attackSpeed: 45, // frames per attack
    projectile: projectilesTable.guantlet,
    spread: 15, // in degrees
    numProjectiles: 1
  },
  pistol: {
    attackSpeed: 30,
    projectile: projectilesTable.pistol,
    spread: 9,
    numProjectiles: 1
  }
};
export default weaponTable;

export function resetWeapon(weapon) {
  // deep copy objects so we don't cause any unforeseen
  // problems due to mutation
  const wep = deepCloneObject(weapon);
  wep.onAttackEffects = [];
  wep.numProjectilesPerMinute = 0;
  return wep;
}
