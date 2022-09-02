let timers = []
let id = 99 // high so we can use lower for global ids

// add a timer that runs a function after _time_ frames
export function addTimer(time, fn) {
  timers.push([id++, 0, time, fn])
}

// add a timer that continuously runs a function every _time_
// frames
export function addContinuousTimer(id, time, fn) {
  if (!timers.find(timer => timer[0] === id)) {
    timers.push([id, 0, time, fn, 1])
  }
}

export function updateTimers() {
  timers = timers.filter(timer => {
    timer[1]++
    if (timer[1] >= timer[2]) {
      timer[1] = 0
      timer[3]()
      return !!timer[4]
    }

    return true
  })
}
