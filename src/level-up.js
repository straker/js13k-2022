import { randInt, GameLoop, Button, Text } from './libs/kontra.mjs';
import abilityTable from './tables/abilities.js';
import { spawnCard } from './entities/card.js';

// taking drop rate algorithm from slay the spire
// @see https://docs.google.com/spreadsheets/d/1ZsxNXebbELpcCi8N7FVOTNGdX_K9-BRC_LMgx4TORo4/edit#gid=113279270
let statCommonPercent = 60;
let startUncommonPercent = 37;
let commonPercent = statCommonPercent;
let uncommonPercent = startUncommonPercent;
let abilities = [];
let texts = [];

const loop = GameLoop({
  clearCanvas: false,
  render() {
    context.save();
    context.globalAlpha = 0.75;
    context.fillStyle = '#333';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.restore();

    abilities.map(ability => ability.render());
    texts.map(text => text.render());
  }
});

export function levelUp(cb) {
  abilities = [];
  texts = [];
  getAbilities(ability => {
    loop.stop();
    abilities.map(ability => ability.destroy());
    abilities = [];
    cb(ability);
  });
  texts.push(
    Text({
      x: canvas.width / 2,
      y: 100,
      text: 'Choose a Card',
      font: '26px Arial',
      color: 'white',
      anchor: { x: 0.5, y: 0.5 }
    })
  );
  loop.start();
}

function getAbilities(cb) {
  for (let i = 0; i < 3; i++) {
    const rand = random() * 100;
    const x = canvas.width / 2 - 215 + 215 * i;
    const y = canvas.height / 2;
    let rarity, availableAbilities, ability;

    if (rand <= commonPercent) {
      rarity = 0;
      if (commonPercent) {
        commonPercent--;
      } else {
        uncommonPercent--;
      }
    } else if (rand <= commonPercent + uncommonPercent) {
      rarity = 1;
    } else {
      rarity = 2;
      commonPercent = statCommonPercent;
      uncommonPercent = startUncommonPercent;
    }

    availableAbilities = abilityTable.filter(
      ability => ability.rarity == rarity
    );
    do {
      ability = availableAbilities[randInt(0, availableAbilities.length - 1)];
      // don't let the same ability appear twice for selection
    } while (abilities.find(ab => ab.ability == ability));

    abilities.push(spawnCard(x, y, ability, cb));
  }

  abilities.push(
    Button({
      x: canvas.width / 2,
      y: canvas.height - 100,
      padX: 20,
      padY: 10,
      anchor: { x: 0.5, y: 0.5 },
      color: 'white',
      text: {
        text: 'Skip',
        color: '#333',
        font: '18px Arial',
        anchor: { x: 0.5, y: 0.5 }
      },
      onUp() {
        cb();
      },
      render() {
        this.draw();

        if (this.focused || this.hovered) {
          context.lineWidth = 3;
          context.strokeStyle = 'orange';
          context.strokeRect(-5, -5, this.width + 10, this.height + 10);
        }
      }
    })
  );
}
