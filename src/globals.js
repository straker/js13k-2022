/*
  assign high use sub-properties to window to avoid using the main property name over and over again
*/
let { PI, sin, cos, atan2 } = Math
Object.assign(window, { PI, sin, cos, atan2 })