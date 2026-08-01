import { z } from 'zod/v3';
import { typeschemaResolver } from '..';

const shouldUseNativeValidation = false;

describe('typeschemaResolver special path names', () => {
  it.each(['hasOwnProperty', 'toString'])(
    'reports a validation error for a field named "%s"',
    async (name) => {
      const schema = z.object({ [name]: z.string().min(1) });

      const result = await typeschemaResolver(schema as any)(
        { [name]: '' } as any,
        undefined,
        { fields: {}, shouldUseNativeValidation } as any,
      );

      expect(result.errors[name]).toBeDefined();
    },
  );
});
