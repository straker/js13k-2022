import weaponsTable, { resetWeapon } from '../../src/tables/weapons.js';
import { WeaponSchema } from '../schemas.js';

describe('tables/weapons', () => {
  it('should follow schema', () => {
    Object.values(weaponsTable).forEach(value => {
      WeaponSchema.parse(value);
    });
  });

  describe('resetWeapon', () => {
    it('should reset properties', () => {
      const weapon = resetWeapon(weaponsTable.pistol);
      assert.deepEqual(weapon.onAttackEffects, []);
      assert.deepEqual(weapon.numProjectilesPerMinute, 0);
    });

    it('should create clone', () => {
      const weapon = resetWeapon(weaponsTable.pistol);
      assert.notEqual(weapon, weaponsTable.pistol);
    });
  });
});
