const esbuild = require('esbuild')
const kontra = require('esbuild-plugin-kontra')

esbuild.build({
  entryPoints: ['src/index.js'],
  bundle: true,
  outdir: 'dist',
  plugins: [
    kontra({
      gameObject: {
        ttl: true,
        velocity: true,
        opacity: true,
        rotation: true,
        anchor: true
      },
      vector: {
        angle: true,
        normalize: true,
        distance: true,
        length: true,
        scale: true,
        subtract: true
      }
    })
  ]
})
