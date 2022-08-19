import { init as initKontra, initKeys } from '../node_modules/kontra/kontra.mjs'

export default function init() {
  initKeys()
  return initKontra()
}
