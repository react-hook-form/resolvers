import * as Joi from '@hapi/joi';
import { joiResolver } from './joi';

const schema = Joi.object({
  username: Joi.string().required(),
  name: Joi.array().items(Joi.string()).required(),
});

describe('Joi', () => {
  it('should generate the errors', async () => {
    expect(await joiResolver(schema)({ test: '1232', name: ['test', 12] })).toEqual({
      values: {},
      errors: {},
    });
  });
});
