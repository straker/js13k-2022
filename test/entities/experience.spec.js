import { SpriteClass } from '../../src/libs/kontra.mjs';
import {
  experiences,
  spawnExperience,
  removeDeadExperience,
  _clear
} from '../../src/entities/experience.js';

beforeEach(() => {
  _clear();
});

describe('entities/experience', () => {
  describe('spawnExperience', () => {
    it('should spawn experience', () => {
      assert.lengthOf(experiences, 0);
      spawnExperience({ x: 10, y: 5, value: 2 });

      assert.lengthOf(experiences, 1);
      assert.isTrue(experiences[0] instanceof SpriteClass);
    });

    it('should spawn experience at position', () => {
      spawnExperience({ x: 10, y: 5, value: 2 });

      assert.equal(experiences[0].x, 10);
      assert.equal(experiences[0].y, 5);
    });

    it('should set value', () => {
      spawnExperience({ x: 10, y: 5, value: 2 });

      assert.equal(experiences[0].value, 2);
    });

    it('should set player xp when picked up', () => {
      const player = { x: 10, y: 5, xp: 0, xpGain: 1 };
      spawnExperience({ x: 10, y: 5, value: 2 });
      experiences[0].active = true;
      experiences[0].update(player);

      assert.equal(player.xp, 2);
    });

    it('should multiply player xp by xpGain', () => {
      const player = { x: 10, y: 5, xp: 0, xpGain: 2 };
      spawnExperience({ x: 10, y: 5, value: 2 });
      experiences[0].active = true;
      experiences[0].update(player);

      assert.equal(player.xp, 4);
    });

    it('should die when picked up', () => {
      const player = { x: 10, y: 5, xp: 0, xpGain: 2 };
      spawnExperience({ x: 10, y: 5, value: 2 });
      experiences[0].active = true;
      experiences[0].update(player);

      assert.equal(experiences[0].ttl, 0);
    });

    it('should move towards player when active', () => {
      const player = { x: 10, y: 5, xp: 0, xpGain: 2 };
      spawnExperience({ x: 0, y: 0, value: 2 });

      const distance = experiences[0].position.distance(player);
      experiences[0].active = true;
      experiences[0].update(player);
      const xDistance = experiences[0].position.distance(player);

      assert.closeTo(xDistance, distance - experiences[0].speed, 0.1);
    });
  });

  describe('removeDeadExperience', () => {
    experiences.push(
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
    removeDeadExperience();

    assert.lengthOf(experiences, 1);
  });
});
