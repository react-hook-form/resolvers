import { Type } from '@sinclair/typebox';
import { typeboxResolver } from '..';

const shouldUseNativeValidation = false;

describe('typeboxResolver special path names', () => {
  it.each(['hasOwnProperty', 'toString'])(
    'reports a validation error for a field named "%s"',
    async (name) => {
      const schema = Type.Object({ [name]: Type.String({ minLength: 1 }) });

      const result = await typeboxResolver(schema as any)(
        { [name]: '' } as any,
        undefined,
        { fields: {}, shouldUseNativeValidation } as any,
      );

      expect(result.errors[name]).toBeDefined();
    },
  );
});
