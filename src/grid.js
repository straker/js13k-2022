import { getCanvas } from './libs/kontra.mjs'

export let gridSize = 100

let grid = [],
  canvas = getCanvas(),
  maxRow = (canvas.height / gridSize) | 0,
  maxCol = (canvas.width / gridSize) | 0
clearGrid()

function getPos(obj) {
  let { x, y, size } = obj

  // row, endRow, col, endCol
  return [
    ((y - size) / gridSize) | 0,
    ((y + size) / gridSize) | 0,
    ((x - size) / gridSize) | 0,
    ((x + size) / gridSize) | 0
  ]
}

export function addToGrid(obj) {
  let [row, endRow, col, endCol] = getPos(obj)

  for (; row >= 0 && row <= endRow && row <= maxRow; row++) {
    for (; col >= 0 && col <= endCol && col <= maxCol; col++) {
      grid[row][col].push(obj)
    }
  }
}

export function getFromGrid(obj) {
  let [row, endRow, col, endCol] = getPos(obj),
    objects = []
  for (; row >= 0 && row <= endRow && row <= maxRow; row++) {
    for (; col >= 0 && col <= endCol && col <= maxCol; col++) {
      objects.push(...grid[row][col])
    }
  }

  return objects
}

export function clearGrid() {
  for (let r = 0; r <= maxRow; r++) {
    grid[r] = []
    for (let c = 0; c <= maxCol; c++) {
      grid[r][c] = []
    }
  }
}
