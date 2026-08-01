import { z as z3 } from 'zod/v3';
import { z as z4 } from 'zod/v4';
import { zodResolver } from '..';

const shouldUseNativeValidation = false;

describe.each([
  { version: 'v3', z: z3 as unknown as typeof z4 },
  { version: 'v4', z: z4 },
])('zodResolver special path names ($version)', ({ z }) => {
  // These names are inherited (truthy) members of `Object.prototype`, so a
  // resolver that tracks seen paths via a plain `{}` map and `!errors[path]`
  // would treat them as "already recorded" and drop the real error.
  it.each(['toString', 'hasOwnProperty'])(
    'reports a validation error for a field named "%s"',
    async (name) => {
      const schema = z.object({ [name]: z.string().min(1) });

      const direct = schema.safeParse({ [name]: '' });
      expect(direct.success).toBe(false);

      const result = await zodResolver(schema)(
        { [name]: '' } as any,
        undefined,
        { fields: {}, shouldUseNativeValidation } as any,
      );

      expect(result.errors[name]).toMatchObject({ type: 'too_small' });
    },
  );

  // `__proto__`, `constructor`, and `prototype` are also inherited/special
  // members, but even once the resolver stops mis-tracking them internally,
  // react-hook-form's own `set`/`get` helpers refuse to write those path
  // segments at all (they hard-code them as a protected-path list to guard
  // against prototype pollution). So these remain dropped end-to-end — that
  // part of the behavior lives in react-hook-form, not in this resolver.
  it.each(['__proto__', 'constructor', 'prototype'])(
    'still drops a field named "%s" (react-hook-form protected path)',
    async (name) => {
      const schema = z.object({ [name]: z.string().min(1) });

      const direct = schema.safeParse({ [name]: '' });
      expect(direct.success).toBe(false);

      const result = await zodResolver(schema)(
        { [name]: '' } as any,
        undefined,
        { fields: {}, shouldUseNativeValidation } as any,
      );

      expect(result.errors).toEqual({});
    },
  );
});
