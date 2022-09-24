// ensure canvas exists before each test
before(async () => {
  let canvas = document.createElement('canvas');
  canvas.id = 'mainCanvas';
  canvas.width = canvas.height = 600;
  document.body.appendChild(canvas);

  await import('../src/init.js');
});

after(() => {
  document.querySelectorAll('canvas').forEach(canvas => canvas.remove());
  document.querySelectorAll('[data-kontra]').forEach(node => node.remove());
});
