import { SpriteClass, getCanvas, keyMap } from '../../src/libs/kontra.mjs';
import { spawnPlayer, resetPlayer } from '../../src/entities/player.js';
import { projectiles, _clear } from '../../src/entities/projectiles.js';
import { getWeaponMock, getProjectileMock } from '../mocks.js';
import { simulateEvent } from '../utils.js';

let player;
let canvas;

beforeEach(() => {
  player = spawnPlayer();
  resetPlayer();
  canvas = getCanvas();
  _clear();
  simulateEvent('blur');
});

describe('entities/player', () => {
  describe('spawnPlayer', () => {
    it('should spawn player', () => {
      assert.isTrue(player instanceof SpriteClass);
    });

    it('should clamp position to screen size', () => {
      player.x = -100;
      assert.isAbove(player.x, 0);
      player.x = 10000;
      assert.isBelow(player.x, canvas.width);
      player.y = -100;
      assert.isAbove(player.y, 0);
      player.y = 10000;
      assert.isBelow(player.y, canvas.height);
    });
  });

  describe('fire', () => {
    it('should reset player fire dt', () => {
      player.dt = 100;
      player.fire(getWeaponMock(), getProjectileMock());

      assert.equal(player.dt, 0);
    });

    it('should add weapon numProjectiles', () => {
      assert.lengthOf(projectiles, 0);
      player.fire(getWeaponMock(), getProjectileMock());

      assert.lengthOf(projectiles, 3);
    });

    it('should call weapon onAttackEffects', () => {
      const spy = sinon.spy();
      const weapon = getWeaponMock();
      weapon.onAttackEffects.push(spy);
      player.fire(weapon, getProjectileMock());

      assert.isTrue(spy.calledWith(player));
    });
  });

  describe('update', () => {
    describe('movement', () => {
      function getKeyCode(key) {
        const entry = Object.entries(keyMap).find(([, value]) => value === key);

        return entry[0];
      }

      ['arrowleft', 'a', 'q'].forEach(key => {
        it(`should move left with ${key}`, () => {
          simulateEvent('keydown', { code: getKeyCode(key) });
          player.update();

          assert.isBelow(player.dx, 0);
        });
      });

      ['arrowright', 'd'].forEach(key => {
        it(`should move right with ${key}`, () => {
          simulateEvent('keydown', { code: getKeyCode(key) });
          player.update();

          assert.isAbove(player.dx, 0);
        });
      });

      ['arrowup', 'w', 'z'].forEach(key => {
        it(`should move up with ${key}`, () => {
          simulateEvent('keydown', { code: getKeyCode(key) });
          player.update();

          assert.isBelow(player.dy, 0);
        });
      });

      ['arrowdown', 's'].forEach(key => {
        it(`should move right with ${key}`, () => {
          simulateEvent('keydown', { code: getKeyCode(key) });
          player.update();

          assert.isAbove(player.dy, 0);
        });
      });
    });

    describe('shields', () => {
      it('should not recover shields if player has no max shields', () => {
        player.shields.current = 0;
        player.shieldDt = 1e5;
        player.update();

        assert.equal(player.shields.current, 0);
      });

      it('should not recover shields if not currently recovering', () => {
        player.shields.current = 0;
        player.shieldDt = 10;
        player.shields.max = 100;
        player.update();

        assert.equal(player.shields.current, 0);
      });

      it('should recover shields if player has max shields and is recovering', () => {
        player.shields.current = 0;
        player.shieldDt = 1e5;
        player.shields.max = 100;
        player.update();

        assert.notEqual(player.shields.current, 0);
      });

      it('should recover based on recoverySpeed', () => {
        player.shields.current = 0;
        player.shieldDt = 1e5;
        player.shields.max = 100;
        player.update();

        const shields = player.shields.current;

        player.shields.current = 0;
        player.shields.recoverySpeed = 2;
        player.update();

        assert.closeTo(player.shields.current, shields * 2, 0.1);
      });

      it('should start recover based on recoveryDelay', () => {
        player.shields.current = 0;
        player.shieldDt = 0;
        player.shields.max = 100;
        let timer = 0;
        while (player.shields === 0) {
          timer++;
          player.update();
        }

        player.shieldDt = 0;
        player.shields.recoveryDelay = 2;
        let delayTimer = 0;
        while (player.shields === 0) {
          delayTimer++;
          player.update();
        }

        assert.equal(timer, delayTimer * 2);
      });

      it('should not recover more than max shields', () => {
        player.shields.current = 99;
        player.shieldDt = 1e5;
        player.shields.max = 100;
        player.shields.recoverySpeed = 100;
        player.update();

        assert.equal(player.shields.current, player.shields.max);
      });
    });
  });

  describe('takeDamage', () => {
    it('should reset shield timer', () => {
      player.shieldDt = 100;
      player.shields.max = 100;
      player.takeDamage(0);

      assert.equal(player.shieldDt, 0);
    });

    it('should not reset shield timer if player has no max shields', () => {
      player.shieldDt = 100;
      player.takeDamage(0);

      assert.equal(player.shieldDt, 100);
    });

    it('should reduce hp by damage', () => {
      player.hp = 20;
      player.takeDamage(5);

      assert.equal(player.hp, 15);
    });

    it('should not reduce hp below 0', () => {
      player.takeDamage(100);

      assert.equal(player.hp, 0);
    });

    it('should take from shields before hp', () => {
      player.hp = 20;
      player.shields.current = 10;
      player.takeDamage(5);

      assert.equal(player.hp, 20);
      assert.equal(player.shields.current, 5);
    });

    it('should take from shields first then hp', () => {
      player.hp = 20;
      player.shields.current = 10;
      player.takeDamage(15);

      assert.equal(player.hp, 15);
      assert.equal(player.shields.current, 0);
    });

    it('should round the damage', () => {
      player.hp = 20;
      player.takeDamage(5.4);

      assert.equal(player.hp, 15);

      player.takeDamage(5.7);
      assert.equal(player.hp, 9);
    });

    it('should deal damage to the attacker if player has spikes', () => {
      const spy = sinon.spy();
      player.shields.current = 10;
      player.shields.spikeDamagePercent = 2;
      player.takeDamage(10, null, { takeDamage: spy }, getProjectileMock());

      assert.isTrue(spy.calledWith(6, 0));
    });
  });

  describe('resetPlayer', () => {
    it('should reset properties', () => {
      player.size = -10;
      player.speed = -10;
      player.maxHp = -10;
      player.shields.current = 100; // should carry over

      resetPlayer();

      assert.notEqual(player.size, -10);
      assert.notEqual(player.speed, -10);
      assert.notEqual(player.maxHp, -10);
      assert.deepEqual(player.shields, {
        current: 100,
        max: 0,
        recoveryDelay: 1,
        recoverySpeed: 1,
        spikeDamagePercent: 0,
        numShieldsPerMinute: 0
      });
    });
  });
});
