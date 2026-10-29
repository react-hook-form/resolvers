import { createFormControl } from 'react-hook-form';
import { Type } from 'typebox';
import { Compile } from 'typebox/compile';
import { typeboxResolver } from '..';

const shouldUseNativeValidation = false;

describe.each([false, true])('typeboxResolver with compiler=%s', (compiled) => {
  it.each(
    ['a/b', 'a~b', 'a~1b'].flatMap((name) =>
      (['firstError', 'all'] as const).map((criteriaMode) => ({
        name,
        criteriaMode,
      })),
    ),
  )(
    'preserves $name with criteriaMode=$criteriaMode',
    async ({ name, criteriaMode }) => {
      const schema = Type.Object({ [name]: Type.String({ minLength: 1 }) });
      const ref = { name };
      const type = 'minLength';
      const message = 'must not have fewer than 1 characters';
      const result = await typeboxResolver(compiled ? Compile(schema) : schema)(
        { [name]: '' },
        undefined,
        {
          fields: { [name]: { name, ref } },
          criteriaMode,
          shouldUseNativeValidation,
        },
      );

      expect(result).toEqual({
        values: {},
        errors: {
          [name]: {
            type,
            message,
            ref,
            ...(criteriaMode === 'all' ? { types: { [type]: message } } : {}),
          },
        },
      });
      expect(result.errors[name]?.ref).toBe(ref);
    },
  );

  it('preserves escaped array paths and all error messages', async () => {
    const schema = Type.Object({
      'parent/~1': Type.Array(
        Type.Object({
          'a~1/b': Type.String({ minLength: 1, pattern: '^a' }),
        }),
      ),
    });
    const name = 'parent/~1.0.a~1/b';
    const ref = { name };
    const type = 'minLength';
    const message = 'must not have fewer than 1 characters';
    const result = await typeboxResolver(compiled ? Compile(schema) : schema)(
      { 'parent/~1': [{ 'a~1/b': '' }] },
      undefined,
      {
        names: [name],
        fields: { [name]: { name, ref } },
        criteriaMode: 'all',
        shouldUseNativeValidation,
      },
    );

    expect(result.errors).toEqual({
      'parent/~1': [
        {
          'a~1/b': {
            type,
            message,
            types: {
              [type]: message,
              pattern: 'must match pattern "^a"',
            },
            ref,
          },
        },
      ],
    });
    expect(result.errors['parent/~1']?.[0]?.['a~1/b']?.ref).toBe(ref);
  });

  it('reports each missing required property at its own escaped path', async () => {
    const schema = Type.Object({
      nested: Type.Object({
        'a/b': Type.String(),
        'c~d': Type.String(),
      }),
    });
    const result = await typeboxResolver(compiled ? Compile(schema) : schema)(
      { nested: {} } as any,
      undefined,
      { fields: {}, shouldUseNativeValidation },
    );

    expect(result.errors).toEqual({
      nested: {
        'a/b': {
          type: 'required',
          message: 'must have required properties a/b',
          ref: undefined,
        },
        'c~d': {
          type: 'required',
          message: 'must have required properties c~d',
          ref: undefined,
        },
      },
    });
  });

  it('fails field validation for a registered escaped name', async () => {
    const schema = Type.Object({
      'profile/name': Type.String({ minLength: 1 }),
    });
    const form = createFormControl({
      defaultValues: { 'profile/name': '' },
      resolver: typeboxResolver(compiled ? Compile(schema) : schema),
    });
    form.register('profile/name');

    expect(await form.trigger('profile/name')).toBe(false);
    expect(form.getFieldState('profile/name').invalid).toBe(true);

    form.setValue('profile/name', 'Alice');

    expect(await form.trigger('profile/name')).toBe(true);
    expect(form.getFieldState('profile/name').invalid).toBe(false);
  });
});

describe('typeboxResolver special path names', () => {
  it.each(['hasOwnProperty', 'toString'])(
    'reports a validation error for a field named "%s"',
    async (name) => {
      const schema = Type.Object({ [name]: Type.String({ minLength: 1 }) });

      const result = await typeboxResolver(schema)({ [name]: '' }, undefined, {
        fields: {},
        shouldUseNativeValidation,
      });

      expect(result.errors[name]).toBeDefined();
    },
  );
});
