import { ajvResolver } from '..';

const shouldUseNativeValidation = false;

describe('ajvResolver special path names', () => {
  it.each(['hasOwnProperty', 'toString'])(
    'reports a validation error for a field named "%s"',
    async (name) => {
      const schema = {
        type: 'object',
        properties: { [name]: { type: 'string', minLength: 1 } },
        required: [name],
      } as any;

      const result = await ajvResolver(schema)(
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
