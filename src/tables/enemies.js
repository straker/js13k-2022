import behaviors from './behaviors.js';

const enemiesTable = {
  // weak melee unit
  ghost: {
    speed: 0.75,
    size: 10,
    color: 'red',
    hp: 7,
    damage: 2,
    attackSpeed: 120, // frames per attack
    value: 1,
    behaviors: [behaviors.seekPlayer, behaviors.avoidEnemies(22)]
  }
};

export default enemiesTable;
