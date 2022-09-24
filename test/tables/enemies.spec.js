import enemiesTable from '../../src/tables/enemies.js';
import { EnemySchema } from '../schemas.js';

describe('tables/enemies', () => {
  it('should follow schema', () => {
    Object.values(enemiesTable).forEach(value => {
      EnemySchema.parse(value);
    });
  });
});
