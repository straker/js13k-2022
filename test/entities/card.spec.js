import { ButtonClass } from '../../src/libs/kontra.mjs';
import { types } from '../../src/constants.js';
import { spawnCard } from '../../src/entities/card.js';

describe('entities/card', () => {
  describe('spawnCard', () => {
    it('should spawn card', () => {
      const card = spawnCard(10, 5, {
        rarity: types.common,
        text: 'Do damage'
      });

      assert.isTrue(card instanceof ButtonClass);
    });

    it('should spawn card at position', () => {
      const card = spawnCard(10, 5, {
        rarity: types.uncommon,
        text: 'Do damage'
      });

      assert.equal(card.x, 10);
      assert.equal(card.y, 5);
    });

    it('should set rarity', () => {
      const card = spawnCard(10, 5, {
        rarity: types.uncommon,
        text: 'Do damage'
      });

      assert.equal(card.rarity, types.uncommon);
    });

    it('should set text', () => {
      const card = spawnCard(10, 5, {
        rarity: types.uncommon,
        text: 'Do damage'
      });

      assert.equal(card.textNode.text, 'Do damage');
    });

    it('should call the callback when clicked', () => {
      const spy = sinon.spy();
      const card = spawnCard(
        10,
        5,
        { rarity: types.uncommon, text: 'Do damage' },
        spy
      );
      card.onUp();

      assert.isTrue(spy.called);
    });
  });
});
