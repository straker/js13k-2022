const esbuild = require('esbuild')
const kontra = require('esbuild-plugin-kontra')

esbuild.build({
  entryPoints: ['src/index.js'],
  bundle: true,
  outdir: 'build',
  plugins: [
    kontra({
      gameObject: {
        ttl: true,
        velocity: true,
        opacity: true,
        rotation: true,
        anchor: true,
        group: true
      },
      text: {
        autoNewline: true,
        newline: true
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
