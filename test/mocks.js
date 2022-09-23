import { resetWeapon } from '../src/tables/weapons.js';
import { resetProjectile } from '../src/tables/projectiles.js';

const noop = () => {};

export function getProjectileMock() {
  return resetProjectile({
    speed: 5,
    size: 4,
    damage: 3,
    ttl: 2,
    pierce: 1,
    update: noop,
    render: noop
  });
}

export function getWeaponMock() {
  return resetWeapon({
    attackSpeed: 5,
    projectile: getProjectileMock(),
    spread: 4,
    numProjectiles: 3
  });
}

export function getEnemyMock() {
  return {
    speed: 6,
    size: 5,
    hp: 4,
    damage: 3,
    attackSpeed: 2,
    value: 1,
    behaviors: []
  };
}
