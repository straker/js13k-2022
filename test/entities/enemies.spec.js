import { SpriteClass } from '../../src/libs/kontra.mjs';
import {
  enemiesDead,
  enemies,
  spawnEnemies,
  removeDeadEnemies,
  _clear
} from '../../src/entities/enemies.js';

let enemy;
let stub;

beforeEach(() => {
  stub = sinon.stub().returns({ x: 0, y: 0 });
  spawnEnemies(1, 'ghost', 1);
  enemy = enemies[0];
  enemy.behaviors = [stub];
  _clear();
});

describe('entities/enemies', () => {
  describe('spawnEnemies', () => {
    it('should spawn enemy', () => {
      assert.lengthOf(enemies, 0);
      spawnEnemies(1, 'ghost', 1);

      assert.lengthOf(enemies, 1);
      assert.isTrue(enemies[0] instanceof SpriteClass);
    });

    it('should spawn multiple enemy', () => {
      assert.lengthOf(enemies, 0);
      spawnEnemies(5, 'ghost', 1);

      assert.lengthOf(enemies, 5);
    });
  });

  describe('update', () => {
    it('should increment attack dt', () => {
      enemy.attackDt = 0;
      enemy.update();

      assert.equal(enemy.attackDt, 1);
    });

    describe('movement', () => {
      it('should call behaviors', () => {
        const player = {};
        enemy.update(player);

        assert.isTrue(stub.calledWith(enemy, player));
      });

      it('should clamp movement by speed', () => {
        stub.returns({ x: 100, y: 100 });
        enemy.update();

        assert.equal(enemy.velocity.length(), enemy.speed);
      });
    });

    describe('statuses', () => {
      it('should reduce speed by chill', () => {
        stub.returns({ x: 100, y: 100 });
        enemy.speed = 10;
        enemy.statuses.chill.amount = 0.5;
        enemy.update();

        assert.equal(enemy.velocity.length(), 5);
      });

      it('should apply poison damage', () => {
        const hp = enemy.hp;
        enemy.statuses.poison.amount = 1;
        enemy.statuses.poison.duration = 60;
        enemy.update();

        assert.isBelow(enemy.hp, hp);
      });

      it('should not apply poison damage if not poisoned', () => {
        const hp = enemy.hp;
        enemy.statuses.poison.amount = 0;
        enemy.statuses.poison.duration = 100;
        enemy.update();

        assert.equal(enemy.hp, hp);
      });

      it('should decrement statuses', () => {
        enemy.statuses.chill.duration = 10;
        enemy.statuses.shock.duration = 10;
        enemy.statuses.poison.duration = 10;
        enemy.statuses.weaken.duration = 10;
        enemy.update();

        assert.equal(enemy.statuses.chill.duration, 9);
        assert.equal(enemy.statuses.shock.duration, 9);
        assert.equal(enemy.statuses.poison.duration, 9);
        assert.equal(enemy.statuses.weaken.duration, 9);
      });

      it('should set status amount to 0 if duration is expired', () => {
        enemy.statuses.chill.amount = 10;
        enemy.statuses.chill.duration = 1;
        enemy.statuses.shock.amount = 10;
        enemy.statuses.shock.duration = 1;
        enemy.statuses.poison.amount = 10;
        enemy.statuses.poison.duration = 1;
        enemy.statuses.weaken.amount = 10;
        enemy.statuses.weaken.duration = 1;
        enemy.update();

        assert.equal(enemy.statuses.chill.amount, 0);
        assert.equal(enemy.statuses.shock.amount, 0);
        assert.equal(enemy.statuses.poison.amount, 0);
        assert.equal(enemy.statuses.weaken.amount, 0);
      });
    });
  });

  describe('takeDamage', () => {
    it('should reduce hp by damage', () => {
      enemy.hp = 20;
      enemy.takeDamage(10, 0);

      assert.equal(enemy.hp, 10);
    });

    it('should round the damage', () => {
      enemy.hp = 20;
      enemy.takeDamage(5.4);

      assert.equal(enemy.hp, 15);

      enemy.takeDamage(5.7);
      assert.equal(enemy.hp, 9);
    });

    it('should apply shock status to projectile damage', () => {
      enemy.hp = 20;
      enemy.statuses.shock.duration = 10;
      enemy.statuses.shock.amount = 1;
      enemy.takeDamage(5, 0);

      assert.equal(enemy.hp, 10);
    });

    it('should not apply shock status to other damage types', () => {
      enemy.hp = 20;
      enemy.statuses.shock.duration = 10;
      enemy.statuses.shock.amount = 1;
      enemy.takeDamage(5, 1);

      assert.equal(enemy.hp, 15);
    });

    it('should increase damage from all sources (projectile)', () => {
      enemy.hp = 20;
      enemy.increasedDamageTaken = 1;
      enemy.takeDamage(5, 0);

      assert.equal(enemy.hp, 10);
    });

    it('should increase damage from all sources (shock)', () => {
      enemy.hp = 20;
      enemy.statuses.shock.duration = 10;
      enemy.statuses.shock.amount = 1;
      enemy.increasedDamageTaken = 1;
      enemy.takeDamage(5, 0);

      assert.equal(enemy.hp, 0);
    });

    it('should increase damage from all sources (poison)', () => {
      enemy.hp = 20;
      enemy.increasedDamageTaken = 1;
      enemy.takeDamage(5, 1);

      assert.equal(enemy.hp, 10);
    });
  });

  describe('removeDeadEnemies', () => {
    it('should remove dead entities', () => {
      enemies.push(
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
      removeDeadEnemies();

      assert.lengthOf(enemies, 1);
    });

    it('should increment enemiesDead by number removed', () => {
      const num = enemiesDead;
      enemies.push(
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
      removeDeadEnemies();

      assert.equal(enemiesDead, num + 2);
    });
  });
});
