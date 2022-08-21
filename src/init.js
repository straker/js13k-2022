import { init as initKontra, initKeys } from './libs/kontra.mjs'

export default function init() {
  initKeys()
  return initKontra()
}
