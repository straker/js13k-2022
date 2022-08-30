import { getCanvas } from './libs/kontra.mjs'

export let gridSize = 100

let grid = [],
  canvas = getCanvas(),
  maxRow = (canvas.height / gridSize) | 0,
  maxCol = (canvas.width / gridSize) | 0
clearGrid()
window.grid = grid
window.getPos = getPos

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

  for (let r = row; r >= 0 && r <= endRow && r <= maxRow; r++) {
    for (let c = col; c >= 0 && c <= endCol && c <= maxCol; c++) {
      grid[r][c].push(obj)
    }
  }
}

export function getFromGrid(obj) {
  let [row, endRow, col, endCol] = getPos(obj),
    objects = []
  for (let r = row; r >= 0 && r <= endRow && r <= maxRow; r++) {
    for (let c = col; c >= 0 && c <= endCol && c <= maxCol; c++) {
      grid[r][c].map(item => {
        if (!objects.includes(item)) {
          objects.push(item)
        }
      })
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

// TODO: delete before submit
// export function renderGrid() {
//   let context = canvas.getContext('2d')
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
