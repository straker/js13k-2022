import { deepCloneObject } from '../utils.js';

const projectilesTable = {
  guantlet: {
    speed: 15,
    size: 19,
    damage: 40,
    ttl: 4,
    pierce: 5,
    update() {
      this.opacity -= 1 / this.ttl / 2;
    },
    render() {
      const { size, context } = this;
      context.beginPath();
      context.strokeStyle = 'skyblue';
      context.lineWidth = 5;
      // pixel perfect collision doesn't look visually
      // satisfying so we'll add a small padding around the
      // projectile by drawing it smaller than its size
      context.arc(0, 0, size - 4, PI, 0);
      context.stroke();
    }
  },
  pistol: {
    speed: 15,
    size: 12,
    damage: 6,
    ttl: 25,
    pierce: 1,
    update() {
      this.opacity -= 1 / this.ttl / 2;
    },
    render() {
      const { size, context } = this;
      context.beginPath();
      context.fillStyle = 'skyblue';
      context.lineWidth = 5;
      context.arc(0, 0, size - 4, 0, Math.PI * 2);
      context.fill();
    }
  }
};
export default projectilesTable;

export function resetProjectile(projectile) {
  const proj = deepCloneObject(projectile);
  // set time below an increment of 60 so that status
  // effects like poison don't trigger immediately
  proj.statusEffects = proj.statusEffects ?? {
    chill: 0,
    poison: 0,
    shock: 0,
    weaken: 0,
    effectivness: 0.2,
    duration: 210 // (frames)
  };
  proj.onHitEffects = [];
  proj.numProjectilesOnExplosion = 0;
  proj.damageToEnemiesWithStats = 0;
  return proj;
}
