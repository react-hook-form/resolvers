import * as v from 'valibot';
import { valibotResolver } from '..';

const shouldUseNativeValidation = false;

describe('valibotResolver special path names', () => {
  it.each(['hasOwnProperty', 'toString'])(
    'reports a validation error for a field named "%s"',
    async (name) => {
      const schema = v.object({ [name]: v.pipe(v.string(), v.minLength(1)) });

      const result = await valibotResolver(schema as any)(
        { [name]: '' } as any,
        undefined,
        { fields: {}, shouldUseNativeValidation } as any,
      );

      expect(result.errors[name]).toBeDefined();
    },
  );
});
