import { getCanvas } from './libs/kontra.mjs';

export const gridSize = 100;

const grid = [];

function getMaxSize() {
  const canvas = getCanvas();

  // maxRow, maxCol
  return [(canvas.height / gridSize) | 0, (canvas.width / gridSize) | 0];
}

function getPos(obj) {
  const { x, y, size } = obj;

  // row, endRow, col, endCol
  return [
    ((y - size) / gridSize) | 0,
    ((y + size) / gridSize) | 0,
    ((x - size) / gridSize) | 0,
    ((x + size) / gridSize) | 0
  ];
}

export function addToGrid(obj) {
  const [maxRow, maxCol] = getMaxSize();
  const [row, endRow, col, endCol] = getPos(obj);

  // only add objects that are on screen
  for (let r = row; r >= 0 && r <= endRow && r <= maxRow; r++) {
    for (let c = col; c >= 0 && c <= endCol && c <= maxCol; c++) {
      grid[r][c].push(obj);
    }
  }
}

export function getFromGrid(obj, types) {
  types = Array.isArray(types) ? types : [types];

  const [maxRow, maxCol] = getMaxSize();
  const [row, endRow, col, endCol] = getPos(obj);
  const objects = [];

  for (let r = row; r >= 0 && r <= endRow && r <= maxRow; r++) {
    for (let c = col; c >= 0 && c <= endCol && c <= maxCol; c++) {
      grid[r][c].map(item => {
        if (!objects.includes(item) && types.includes(item.type)) {
          objects.push(item);
        }
      });
    }
  }

  return objects;
}

export function clearGrid() {
  const [maxRow, maxCol] = getMaxSize();

  for (let r = 0; r <= maxRow; r++) {
    grid[r] = [];
    for (let c = 0; c <= maxCol; c++) {
      grid[r][c] = [];
    }
  }
}

// TODO: delete before submit
// export function renderGrid() {
//   context.strokeStyle = 'yellow'
//   context.lineWidth = 3
//   for (let r = 0; r < canvas.height; r+= gridSize) {
//     context.beginPath()
//     context.moveTo(0, r)
//     context.lineTo(canvas.width, r)
//     context.stroke()
//   }
//   for (let c = 0; c < canvas.width; c+= gridSize) {
//     context.beginPath()
//     context.moveTo(c, 0)
//     context.lineTo(c, canvas.height)
//     context.stroke()
//   }
// }
