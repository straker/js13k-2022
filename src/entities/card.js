import { Button } from '../libs/kontra.mjs';

export function spawnCard(x, y, ability, cb) {
  const { rarity, text } = ability;

  return Button({
    x,
    y,
    ability,
    width: 187,
    height: 250,
    color: rarity == 0 ? 'lightgrey' : rarity == 1 ? 'lightblue' : 'gold',
    text: {
      y: 8,
      text,
      color: '#333',
      width: 150,
      font: '13px Arial',
      lineHeight: 1.25,
      anchor: { x: 0.5, y: 0 }
    },
    anchor: { x: 0.5, y: 0.5 },
    onUp() {
      cb && cb(ability);
    },
    render() {
      const { context } = this;

      this.draw();

      context.fillStyle = 'white';
      context.fillRect(
        10,
        this.height / 2,
        this.width - 20,
        this.height / 2 - 10
      );

      context.fillStyle = '#333';
      context.strokeStyle = '#333';
      context.fillRect(10, 10, this.width - 20, this.height / 2 - 25);
      context.strokeRect(
        10,
        this.height / 2,
        this.width - 20,
        this.height / 2 - 10
      );

      if (cb && (this.focused || this.hovered)) {
        context.lineWidth = 3;
        context.strokeStyle = 'orange';
        context.strokeRect(-5, -5, this.width + 10, this.height + 10);
      }
    }
  });
}
