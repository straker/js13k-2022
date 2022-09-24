import {
  _grid,
  gridSize,
  addToGrid,
  getFromGrid,
  clearGrid
} from '../src/grid.js';

beforeEach(() => {
  clearGrid();
});

describe('grid', () => {
  describe('addToGrid', () => {
    it('should add object', () => {
      const obj = { x: gridSize * 1.5, y: gridSize * 3.1, size: 2 };
      addToGrid(obj);

      assert.deepEqual(_grid[3][1], [obj]);
    });

    it('should add object to all cells', () => {
      const obj = { x: gridSize, y: gridSize, size: 4 };
      addToGrid(obj);

      assert.deepEqual(_grid[0][0], [obj]);
      assert.deepEqual(_grid[1][0], [obj]);
      assert.deepEqual(_grid[0][1], [obj]);
      assert.deepEqual(_grid[1][1], [obj]);
    });

    it('should add object to all visible cells', () => {
      const obj = { x: -gridSize, y: -gridSize, size: 100 };
      addToGrid(obj);

      assert.deepEqual(_grid[0][0], [obj]);
    });

    it('should not error for object outside grid', () => {
      assert.doesNotThrow(() => {
        addToGrid({ x: -10, y: -10, size: 2 });
        addToGrid({ x: 1000, y: 0, size: 2 });
        addToGrid({ x: 0, y: 1000, size: 2 });
      });
    });
  });

  describe('getFromGrid', () => {
    it('should get object from grid', () => {
      const obj = { x: gridSize * 1.5, y: gridSize * 3.1, size: 2 };
      addToGrid(obj);
      const objs = getFromGrid({ x: obj.x - 10, y: obj.y, size: 8 });

      assert.deepEqual(objs, [obj]);
    });

    it('should get all objects from grid', () => {
      const obj1 = { x: 10, y: 5, size: 2 };
      const obj2 = { x: 20, y: 5, size: 2 };
      const obj3 = { x: 75, y: 5, size: 2 };
      addToGrid(obj1);
      addToGrid(obj2);
      addToGrid(obj3);
      const objs = getFromGrid({ x: 0, y: 5, dx: 100, size: 3 });

      assert.lengthOf(objs, 3);
      assert.include(objs, obj1);
      assert.include(objs, obj2);
      assert.include(objs, obj3);
    });

    it('should not return object twice', () => {
      const obj1 = { x: 10, y: 5, size: 1000 };
      addToGrid(obj1);
      const objs = getFromGrid({ x: 0, y: 5, dx: 100, size: 3 });

      assert.lengthOf(objs, 1);
    });

    it('should not return objects in different cells', () => {
      const obj = { x: 10, y: 5, size: 2 };
      addToGrid(obj);
      const objs = getFromGrid({ x: gridSize * 2, y: 5, size: 3 });

      assert.deepEqual(objs, []);
    });

    it('should filter objects by type', () => {
      const obj = { x: 10, y: 5, size: 2, type: 1 };
      addToGrid(obj);
      const objs = getFromGrid({ x: 0, y: 5, dx: 5, size: 3 }, 0);

      assert.deepEqual(objs, []);
    });
  });

  describe('clearGrid', () => {
    it('should remove all entities', () => {
      _grid[5][4] = [1];
      _grid[0][2] = [1];
      _grid[2][1] = [1];

      clearGrid();

      assert.deepEqual(_grid[5][4], []);
      assert.deepEqual(_grid[0][2], []);
      assert.deepEqual(_grid[2][1], []);
    });
  });
});
