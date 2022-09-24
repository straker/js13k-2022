/**
 * Simulate a keyboard event.
 * @param {string} type - Type of keyboard event.
 * @param {object} [config] - Additional settings for the event.
 * @param {HTMLElement} [node=window] - Node to dispatch the event on.
 */
export function simulateEvent(type, config = {}, node = window) {
  let evt = new Event(type);

  for (let prop in config) {
    evt[prop] = config[prop];
  }

  if (config.async) {
    window.setTimeout(() => node.dispatchEvent(evt), 100);
  } else {
    node.dispatchEvent(evt);
  }

  return evt;
}
