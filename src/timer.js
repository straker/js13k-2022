let id = 99; // high so we can use lower for global ids

// expose for testing
export let _timers = [];

// add a timer that runs a function after _time_ frames
export function addTimer(time, fn) {
  _timers.push({
    id: id++,
    curTime: 0,
    endTime: time,
    fn
  });
}

// add a timer that continuously runs a function every _time_
// frames
export function addContinuousTimer(id, time, fn) {
  if (!_timers.find(timer => timer.id === id)) {
    _timers.push({
      id,
      curTime: 0,
      endTime: time,
      fn,
      keepAlive: 1
    });
  }
}

export function updateTimers() {
  _timers = _timers.filter(timer => {
    timer.curTime++;
    if (timer.curTime >= timer.endTime) {
      timer.curTime = 0;
      timer.fn();
      return !!timer.keepAlive;
    }

    return true;
  });
}

// expose for testing
export function _clear() {
  id = 99;
  _timers = [];
}
