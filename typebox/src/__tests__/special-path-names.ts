import { Type } from '@sinclair/typebox';
import { TypeCompiler } from '@sinclair/typebox/compiler';
import { ValueErrorType } from '@sinclair/typebox/errors';
import { createFormControl } from 'react-hook-form';
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
      const type = String(ValueErrorType.StringMinLength);
      const message = 'Expected string length greater or equal to 1';
      const result = await typeboxResolver(
        compiled ? TypeCompiler.Compile(schema) : schema,
      )({ [name]: '' }, undefined, {
        fields: { [name]: { name, ref } },
        criteriaMode,
        shouldUseNativeValidation,
      });

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
    const type = String(ValueErrorType.StringMinLength);
    const message = 'Expected string length greater or equal to 1';
    const result = await typeboxResolver(
      compiled ? TypeCompiler.Compile(schema) : schema,
    )({ 'parent/~1': [{ 'a~1/b': '' }] }, undefined, {
      names: [name],
      fields: { [name]: { name, ref } },
      criteriaMode: 'all',
      shouldUseNativeValidation,
    });

    expect(result.errors).toEqual({
      'parent/~1': [
        {
          'a~1/b': {
            type,
            message,
            types: {
              [type]: message,
              [ValueErrorType.StringPattern]: "Expected string to match '^a'",
            },
            ref,
          },
        },
      ],
    });
    expect(result.errors['parent/~1']?.[0]?.['a~1/b']?.ref).toBe(ref);
  });

  it('fails field validation for a registered escaped name', async () => {
    const schema = Type.Object({
      'profile/name': Type.String({ minLength: 1 }),
    });
    const form = createFormControl({
      defaultValues: { 'profile/name': '' },
      resolver: typeboxResolver(
        compiled ? TypeCompiler.Compile(schema) : schema,
      ),
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

      const result = await typeboxResolver(schema as any)(
        { [name]: '' } as any,
        undefined,
        { fields: {}, shouldUseNativeValidation } as any,
      );

      expect(result.errors[name]).toBeDefined();
    },
  );
});
