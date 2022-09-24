import { Sprite } from '../src/libs/kontra.mjs';
import {
  getAngle,
  circleCircleCollision,
  deepCloneObject,
  updateAndGetCollisions,
  removeDead
} from '../src/utils.js';
import { addToGrid, clearGrid } from '../src/grid.js';

beforeEach(() => {
  clearGrid();
});

describe('utils', () => {
  describe('getAngle', () => {
    it('should return angle', () => {
      assert.closeTo(getAngle(10, 5), 2, 0.1);
    });

    it('should accept vector', () => {
      assert.closeTo(getAngle({ x: 10, y: 5 }), 2, 0.1);
    });
  });

  describe('circleCircleCollision', () => {
    it('should return true for collision', () => {
      const circle1 = Sprite({ x: 10, y: 5, size: 2 });
      const circle2 = Sprite({ x: 15, y: 5, size: 3 });

      assert.isTrue(circleCircleCollision(circle1, circle2));
    });

    it('should return false when no collision', () => {
      const circle1 = Sprite({ x: 10, y: 5, size: 2 });
      const circle2 = Sprite({ x: 15, y: 5, size: 2 });

      assert.isFalse(circleCircleCollision(circle1, circle2));
    });
  });

  describe('deepCloneObject', () => {
    it('should deep clone', () => {
      const obj = {
        foo: 1,
        bar: '2',
        baz: {
          a: null,
          b: ['a', 'b'],
          c: () => {}
        }
      };

      assert.deepEqual(deepCloneObject(obj), obj);
    });

    it('should not be equal', () => {
      const obj = {
        foo: 1,
        bar: '2',
        baz: {
          a: null,
          b: ['a', 'b'],
          c: () => {}
        }
      };

      assert.notEqual(deepCloneObject(obj), obj);
    });
  });

  describe('updateAndGetCollisions', () => {
    it('should fully move object', () => {
      const sprite = Sprite({ x: 0, y: 0, dx: 100, dy: 0, update() {} });
      updateAndGetCollisions(sprite);

      assert.closeTo(sprite.x, 100, 0.1);
      assert.closeTo(sprite.y, 0, 0.1);
    });

    it('should decrease ttl', () => {
      const sprite = Sprite({
        ttl: 10,
        x: 0,
        y: 0,
        dx: 100,
        dy: 0,
        update() {}
      });
      updateAndGetCollisions(sprite);

      assert.closeTo(sprite.ttl, 9, 0.1);
    });

    it('should move when less than fixed step', () => {
      const sprite = Sprite({ x: 0, y: 0, dx: 0, dy: 2, update() {} });
      updateAndGetCollisions(sprite);

      assert.closeTo(sprite.x, 0, 0.1);
      assert.closeTo(sprite.y, 2, 0.1);
    });

    it('should get objects that collide', () => {
      const obj = Sprite({ x: 10, y: 5, size: 2 });
      addToGrid(obj);
      const sprite = Sprite({ x: 0, y: 5, dx: 5, size: 3 });
      const collisions = updateAndGetCollisions(sprite);

      assert.deepEqual(collisions, [obj]);
    });

    it('should get all objects that collide', () => {
      const obj1 = Sprite({ x: 10, y: 5, size: 2 });
      const obj2 = Sprite({ x: 20, y: 5, size: 2 });
      const obj3 = Sprite({ x: 75, y: 5, size: 2 });
      addToGrid(obj1);
      addToGrid(obj2);
      addToGrid(obj3);
      const sprite = Sprite({ x: 0, y: 5, dx: 100, size: 3 });
      const collisions = updateAndGetCollisions(sprite);

      assert.lengthOf(collisions, 3);
      assert.include(collisions, obj1);
      assert.include(collisions, obj2);
      assert.include(collisions, obj3);
    });

    it('should not return object twice', () => {
      const obj1 = Sprite({ x: 10, y: 5, size: 1000 });
      addToGrid(obj1);
      const sprite = Sprite({ x: 0, y: 5, dx: 100, size: 3 });
      const collisions = updateAndGetCollisions(sprite);

      assert.lengthOf(collisions, 1);
    });

    it("should not return objects that don't collide", () => {
      const obj = Sprite({ x: 10, y: 5, size: 2 });
      addToGrid(obj);
      const sprite = Sprite({ x: 0, y: 5, dx: 3, size: 3 });
      const collisions = updateAndGetCollisions(sprite);

      assert.deepEqual(collisions, []);
    });

    it('should filter collisions by type', () => {
      const obj = Sprite({ x: 10, y: 5, size: 2, type: 1 });
      addToGrid(obj);
      const sprite = Sprite({ x: 0, y: 5, dx: 5, size: 3 });
      const collisions = updateAndGetCollisions(sprite, 0);

      assert.deepEqual(collisions, []);
    });
  });

  describe('removeDead', () => {
    it('should remove dead entities', () => {
      const entities = [
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
      ];

      assert.lengthOf(removeDead(entities), 1);
    });
  });
});
