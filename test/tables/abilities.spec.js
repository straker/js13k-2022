import abilities from '../../src/tables/abilities.js';
import { AbilitySchema } from '../schemas.js';

describe('tables/abilities', () => {
  it('should follow schema', () => {
    abilities.forEach(value => {
      AbilitySchema.parse(value);
    });
  });

  // TODO: test each ability to see if it changes the expected
  // properties (but not so much the exact values due to
  // balancing). should only do this once the initial balancing
  // is completed so we have regression tests in place
});
