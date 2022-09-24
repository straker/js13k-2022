import behaviorsTable from '../../src/tables/behaviors.js';
import { BehaviorSchema } from '../schemas.js';

describe('tables/behaviors', () => {
  it('should follow schema', () => {
    Object.values(behaviorsTable).forEach(value => {
      BehaviorSchema.parse(value);
    });
  });
});
