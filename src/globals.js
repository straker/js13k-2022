import { getCanvas, getContext } from './libs/kontra.mjs';

/*
  assign high use sub-properties to window to avoid using the main property name over and over again
*/
let { PI, sin, cos, atan2, random, min, max, round, abs } = Math;
Object.assign(window, {
  PI,
  sin,
  cos,
  atan2,
  random,
  min,
  max,
  round,
  abs,
  canvas: getCanvas(),
  context: getContext()
});
