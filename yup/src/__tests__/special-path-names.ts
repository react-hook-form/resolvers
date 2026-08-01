import * as yup from 'yup';
import { yupResolver } from '..';

const shouldUseNativeValidation = false;

describe('yupResolver special path names', () => {
  it.each(['hasOwnProperty', 'toString'])(
    'reports a validation error for a field named "%s"',
    async (name) => {
      const schema = yup.object({ [name]: yup.string().min(1).required() });

      const result = await yupResolver(schema as any)(
        { [name]: '' } as any,
        undefined,
        { fields: {}, shouldUseNativeValidation } as any,
      );

      expect(result.errors[name]).toBeDefined();
    },
  );
});
