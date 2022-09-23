import { SpriteClass, degToRad } from '../../src/libs/kontra.mjs';
import {
  projectiles,
  spawnProjectile,
  spawnWeaponProjectiles,
  removeDeadProjectiles,
  _clear
} from '../../src/entities/projectiles.js';
import { getProjectileMock, getWeaponMock } from '../mocks.js';

beforeEach(() => {
  _clear();
});

describe('entities/projectiles', () => {
  describe('spawnProjectile', () => {
    it('should spawn a projectile', () => {
      assert.lengthOf(projectiles, 0);
      spawnProjectile(getProjectileMock(), { x: 10, y: 5 }, 0);

      assert.lengthOf(projectiles, 1);
      assert.isTrue(projectiles[0] instanceof SpriteClass);
    });

    it('should spawn at the x/y position', () => {
      spawnProjectile(getProjectileMock(), { x: 10, y: 5 }, 0);

      assert.equal(projectiles[0].x, 10);
      assert.equal(projectiles[0].y, 5);
    });

    it('should take into account padding and angle', () => {
      spawnProjectile(getProjectileMock(), { x: 10, y: 5 }, 0, { x: 5, y: 2 });

      assert.equal(projectiles[0].x, 10);
      assert.equal(projectiles[0].y, 3);
    });

    it('should set dx/dy', () => {
      spawnProjectile(getProjectileMock(), { x: 10, y: 5 }, 0);

      assert.equal(projectiles[0].dx, 0);
      assert.equal(projectiles[0].dy, -5);
    });
  });

  describe('spawnWeaponProjectiles', () => {
    it('should spawn `numProjectiles` number of projectiles', () => {
      assert.lengthOf(projectiles, 0);
      spawnWeaponProjectiles(
        getProjectileMock(),
        { width: 10, height: 5, facingRot: 0 },
        getWeaponMock()
      );

      assert.lengthOf(projectiles, 3);
    });

    it('should spawn on player position and size', () => {
      spawnWeaponProjectiles(
        getProjectileMock(),
        { x: 10, y: 5, width: 10, height: 5, facingRot: degToRad(90) },
        getWeaponMock()
      );

      assert.closeTo(projectiles[0].x, 20, 0.1);
      assert.closeTo(projectiles[0].y, 4.6, 0.1);
      assert.closeTo(projectiles[1].x, 20, 0.1);
      assert.closeTo(projectiles[1].y, 5, 0.1);
      assert.closeTo(projectiles[2].x, 20, 0.1);
      assert.closeTo(projectiles[2].y, 5.4, 0.1);
    });

    it('should evenly spawn projectiles based on spread', () => {
      spawnWeaponProjectiles(
        getProjectileMock(),
        { x: 10, y: 5, width: 10, height: 5, facingRot: degToRad(90) },
        getWeaponMock()
      );

      assert.closeTo(projectiles[0].dx, 5, 0.1);
      assert.closeTo(projectiles[0].dy, -0.35, 0.1);
      assert.closeTo(projectiles[1].dx, 5, 0.1);
      assert.closeTo(projectiles[1].dy, 0, 0.1);
      assert.closeTo(projectiles[2].dx, 5, 0.1);
      assert.closeTo(projectiles[2].dy, 0.35, 0.1);
    });
  });

  describe('removeDeadProjectiles', () => {
    it('should remove dead entities', () => {
      projectiles.push(
        {
          isAlive() {
            return false;
          }
        },
        {
          isAlive() {
            return true;
          }
        },
        {
          isAlive() {
            return false;
          }
        }
      );
      removeDeadProjectiles();

      assert.lengthOf(projectiles, 1);
    });
  });
});
