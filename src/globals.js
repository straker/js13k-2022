/*
  assign high use sub-properties to window to avoid using the main property name over and over again
*/
export default function globals() {
  let { PI, sin, cos, atan2, random } = Math
  Object.assign(window, { PI, sin, cos, atan2, random })
}
globals()
