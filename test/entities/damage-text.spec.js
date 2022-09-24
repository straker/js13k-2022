import { TextClass } from '../../src/libs/kontra.mjs';
import {
  damageTexts,
  spawnDamageText,
  removeDeadDamageTexts,
  _clear
} from '../../src/entities/damage-text.js';

beforeEach(() => {
  _clear();
});

describe('entities/damage-text', () => {
  describe('spawnDamageText', () => {
    it('should spawn text', () => {
      assert.lengthOf(damageTexts, 0);
      spawnDamageText({ x: 10, y: 5 }, 2);

      assert.lengthOf(damageTexts, 1);
      assert.isTrue(damageTexts[0] instanceof TextClass);
    });

    it('should spawn text at position', () => {
      spawnDamageText({ x: 10, y: 5 }, 2);

      assert.equal(damageTexts[0].x, 10);
      assert.equal(damageTexts[0].y, 5);
    });

    it('should set value', () => {
      spawnDamageText({ x: 10, y: 5 }, 2);

      assert.equal(damageTexts[0].text, 2);
    });

    it('should set color', () => {
      spawnDamageText({ x: 10, y: 5 }, 2, 'blue');

      assert.equal(damageTexts[0].color, 'blue');
    });
  });

  describe('removeDeadDamageTexts', () => {
    it('should remove dead entities', () => {
      damageTexts.push(
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
      removeDeadDamageTexts();

      assert.lengthOf(damageTexts, 1);
    });
  });
});
