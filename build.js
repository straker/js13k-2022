const esbuild = require('esbuild')
// const kontra = require('esbuild-plugin-kontra');

esbuild.build({
  entryPoints: ['src/index.js'],
  bundle: true,
  outdir: 'dist',
  plugins: [
    // kontra({
    //   gameObject: {
    //     acceleration: true,
    //     rotation: true,
    //     ttl: true,
    //     velocity: true
    //   },
    //   vector: {
    //     length: true
    //   }
    // })
  ]
})
