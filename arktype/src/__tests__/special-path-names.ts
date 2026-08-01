import { type } from 'arktype';
import { arktypeResolver } from '..';

const shouldUseNativeValidation = false;

describe('arktypeResolver special path names', () => {
  it.each(['hasOwnProperty', 'toString'])(
    'reports a validation error for a field named "%s"',
    async (name) => {
      const schema = type({ [name]: 'string>0' } as any);

      const result = await arktypeResolver(schema as any)(
        { [name]: '' } as any,
        undefined,
        { fields: {}, shouldUseNativeValidation } as any,
      );

      expect(result.errors[name]).toBeDefined();
    },
  );
});
