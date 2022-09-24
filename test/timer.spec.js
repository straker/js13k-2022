import {
  _timers,
  addTimer,
  addContinuousTimer,
  updateTimers,
  _clear
} from '../src/timer.js';

beforeEach(() => {
  _clear();
});

describe('timer', () => {
  describe('addTimer', () => {
    it('should add timer', () => {
      const fn = () => {};
      addTimer(10, fn);

      assert.deepEqual(_timers[0], {
        id: 99,
        curTime: 0,
        endTime: 10,
        fn
      });
    });

    it('should increment id', () => {
      const fn = () => {};
      addTimer(10, fn);
      addTimer(20, fn);

      assert.equal(_timers[0].id, 99);
      assert.equal(_timers[1].id, 100);
    });
  });

  describe('addContinuousTimer', () => {
    it('should add timer', () => {
      const fn = () => {};
      addContinuousTimer(1, 10, fn);

      assert.deepEqual(_timers[0], {
        id: 1,
        curTime: 0,
        endTime: 10,
        fn,
        keepAlive: 1
      });
    });

    it('should not add same timer twice', () => {
      const fn = () => {};
      addContinuousTimer(1, 10, fn);
      addContinuousTimer(1, 20, fn);

      assert.lengthOf(_timers, 1);
    });
  });

  describe('updateTimers', () => {
    it('should increment curTime', () => {
      const fn = () => {};
      addTimer(10, fn);
      updateTimers();

      assert.equal(_timers[0].curTime, 1);
    });

    it('should call the function when timer expires', () => {
      const spy = sinon.spy();
      addTimer(1, spy);
      updateTimers();

      assert.isTrue(spy.called);
    });

    it('should not call the function when active', () => {
      const spy = sinon.spy();
      addTimer(10, spy);
      updateTimers();

      assert.isFalse(spy.called);
    });

    it('should remove timer when it expires', () => {
      const fn = () => {};
      addTimer(1, fn);
      updateTimers();

      assert.lengthOf(_timers, 0);
    });

    it('keeps and resets continuous timer', () => {
      const spy = sinon.spy();
      addContinuousTimer(1, 1, spy);

      updateTimers();
      assert.isTrue(spy.called);
      assert.lengthOf(_timers, 1);
      assert.equal(_timers[0].curTime, 0);
    });
  });
});
