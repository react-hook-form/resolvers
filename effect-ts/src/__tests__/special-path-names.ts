import { Schema } from 'effect';
import { effectTsResolver } from '..';

const shouldUseNativeValidation = false;

describe('effectTsResolver special path names', () => {
  it.each(['hasOwnProperty', 'toString'])(
    'reports a validation error for a field named "%s"',
    async (name) => {
      const schema = Schema.Struct({
        [name]: Schema.String.pipe(Schema.minLength(1)),
      });

      const result = await effectTsResolver(schema as any)(
        { [name]: '' } as any,
        undefined,
        { fields: {}, shouldUseNativeValidation } as any,
      );

      expect(result.errors[name]).toBeDefined();
    },
  );
});
