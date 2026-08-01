import { ataResolver } from '..';

const shouldUseNativeValidation = false;

// The native binding's error shape varies by which schema keywords are
// involved (a detail unrelated to this fix), so the underlying validator is
// mocked here to isolate the resolver's own path-tracking logic — the thing
// this regression test targets.
vi.mock('ata-validator', () => ({
  Validator: class {
    validate(values: any) {
      const errors = Object.keys(values).flatMap((name) =>
        values[name] === ''
          ? [
              {
                keyword: 'minLength',
                instancePath: `/${name}`,
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
              },
            ]
          : [],
      );

      return errors.length
        ? { valid: false, errors }
        : { valid: true, errors: [] };
    }
  },
}));

describe('ataResolver special path names', () => {
  it.each(['hasOwnProperty', 'toString'])(
    'reports a validation error for a field named "%s"',
    async (name) => {
      const result = await ataResolver({} as any)(
        { [name]: '' } as any,
        undefined,
        { fields: {}, shouldUseNativeValidation } as any,
      );

      expect(result.errors[name]).toBeDefined();
    },
  );
});
