import * as Joi from 'joi';
import { joiResolver } from '..';

const shouldUseNativeValidation = false;

describe('joiResolver special path names', () => {
  it.each(['hasOwnProperty', 'toString'])(
    'reports a validation error for a field named "%s"',
    async (name) => {
      const schema = Joi.object({ [name]: Joi.string().min(1).required() });

      const result = await joiResolver(schema)(
        { [name]: '' } as any,
        undefined,
        {
          fields: {},
          shouldUseNativeValidation,
        } as any,
      );

      expect(result.errors[name]).toBeDefined();
    },
  );
});
