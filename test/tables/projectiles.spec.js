import projectilesTable, {
  resetProjectile
} from '../../src/tables/projectiles.js';
import { ProjectileSchema } from '../schemas.js';

describe('tables/projectiles', () => {
  it('should follow schema', () => {
    Object.values(projectilesTable).forEach(value => {
      ProjectileSchema.parse(value);
    });
  });

  describe('resetProjectile', () => {
    it('should reset properties', () => {
      const projectile = resetProjectile(projectilesTable.pistol);
      assert.hasAllKeys(projectile.statusEffects, [
        'chill',
        'poison',
        'shock',
        'weaken',
        'effectivness',
        'duration'
      ]);
      assert.deepEqual(projectile.onHitEffects, []);
      assert.deepEqual(projectile.numProjectilesOnExplosion, 0);
      assert.deepEqual(projectile.damageToEnemiesWithStats, 0);
    });

    it('should create clone', () => {
      const projectile = resetProjectile(projectilesTable.pistol);
      assert.notEqual(projectile, projectilesTable.pistol);
    });
  });
});
