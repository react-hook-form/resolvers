import { vestResolver } from '..';

const shouldUseNativeValidation = false;

describe('vestResolver special path names', () => {
  it.each(['hasOwnProperty', 'toString'])(
    'reports a validation error for a field named "%s"',
    async (name) => {
      // The `vest` package itself throws when a field is named after an
      // Object.prototype member (`agg.failures.errors[fieldName].push is
      // not a function`) — a separate, pre-existing bug in that package,
      // unreachable through this resolver's public API regardless of this
      // fix. A fake schema function isolates the resolver's own
      // path-tracking logic instead.
      const schema = () => ({
        hasErrors: () => true,
        getErrors: () => ({ [name]: [`${name} is required`] }),
      });

      const result = await vestResolver(schema as any, undefined, {
        mode: 'sync',
      })({ [name]: '' } as any, undefined, {
        fields: {},
        shouldUseNativeValidation,
      } as any);

      expect(result.errors[name]).toBeDefined();
    },
  );
});
