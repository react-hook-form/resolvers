import vine from '@vinejs/vine';
import { vineResolver } from '..';

const shouldUseNativeValidation = false;

describe('vineResolver special path names', () => {
  it.each(['hasOwnProperty', 'toString'])(
    'reports a validation error for a field named "%s"',
    async (name) => {
      const schema = vine.compile(
        vine.object({ [name]: vine.string().minLength(1) } as any),
      );

      const result = await vineResolver(schema as any)(
        { [name]: '' } as any,
        undefined,
        { fields: {}, shouldUseNativeValidation } as any,
      );

      expect(result.errors[name]).toBeDefined();
    },
  );
});
