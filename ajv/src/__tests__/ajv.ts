import { JSONSchemaType } from 'ajv';
import { ajvResolver } from '..';
import {
  fields,
  invalidData,
  invalidDataWithUndefined,
  schema,
  validData,
} from './__fixtures__/data';

const shouldUseNativeValidation = false;

describe('ajvResolver', () => {
  it('should return values from ajvResolver when validation pass', async () => {
    expect(
      await ajvResolver(schema)(validData, undefined, {
        fields,
        shouldUseNativeValidation,
      }),
    ).toEqual({
      values: validData,
      errors: {},
    });
  });

  it('should return values from ajvResolver with `mode: sync` when validation pass', async () => {
    expect(
      await ajvResolver(schema, undefined, {
        mode: 'sync',
      })(validData, undefined, { fields, shouldUseNativeValidation }),
    ).toEqual({
      values: validData,
      errors: {},
    });
  });

  it('should return single error message from ajvResolver when validation fails and validateAllFieldCriteria set to false', async () => {
    expect(
      await ajvResolver(schema)(invalidData, undefined, {
        fields,
        shouldUseNativeValidation,
      }),
    ).toMatchSnapshot();
  });

  it('should return single error message from ajvResolver when validation fails and validateAllFieldCriteria set to false and `mode: sync`', async () => {
    expect(
      await ajvResolver(schema, undefined, {
        mode: 'sync',
      })(invalidData, undefined, { fields, shouldUseNativeValidation }),
    ).toMatchSnapshot();
  });

  it('should return all the error messages from ajvResolver when validation fails and validateAllFieldCriteria set to true', async () => {
    expect(
      await ajvResolver(schema)(
        invalidData,
        {},
        { fields, criteriaMode: 'all', shouldUseNativeValidation },
      ),
    ).toMatchSnapshot();
  });

  it('should return all the error messages from ajvResolver when validation fails and validateAllFieldCriteria set to true and `mode: sync`', async () => {
    expect(
      await ajvResolver(schema, undefined, { mode: 'sync' })(
        invalidData,
        {},
        { fields, criteriaMode: 'all', shouldUseNativeValidation },
      ),
    ).toMatchSnapshot();
  });

  it('should return all the error messages from ajvResolver when requirement fails and validateAllFieldCriteria set to true', async () => {
    expect(
      await ajvResolver(schema)({}, undefined, {
        fields,
        shouldUseNativeValidation,
      }),
    ).toMatchSnapshot();
  });

  it('should return all the error messages from ajvResolver when requirement fails and validateAllFieldCriteria set to true and `mode: sync`', async () => {
    expect(
      await ajvResolver(schema, undefined, { mode: 'sync' })({}, undefined, {
        fields,
        shouldUseNativeValidation,
      }),
    ).toMatchSnapshot();
  });

  it('should return all the error messages from ajvResolver when some property is undefined and result will keep the input data structure', async () => {
    expect(
      await ajvResolver(schema, undefined, { mode: 'sync' })(
        invalidDataWithUndefined,
        undefined,
        {
          fields,
          shouldUseNativeValidation,
        },
      ),
    ).toMatchSnapshot();
  });

  it.each(
    ['a/b', 'a~b', 'a~1b'].flatMap((name) =>
      [false, true].map((required) => ({ name, required })),
    ),
  )(
    'should preserve $name with required=$required',
    async ({ name, required }) => {
      const result = await ajvResolver<Record<string, string>>({
        type: 'object',
        properties: { [name]: { type: 'string' } },
        required: [name],
      })(required ? {} : { [name]: 1 }, undefined, {
        fields: {},
        shouldUseNativeValidation,
      });

      expect(Object.keys(result.errors)).toEqual([name]);
      expect(result.errors[name]?.type).toBe(required ? 'required' : 'type');
    },
  );

  it.each([false, true])(
    'should preserve nested paths, messages and refs with required=%s',
    async (required) => {
      const name = 'parent/~1.a~1/b';
      const ref = { name };
      const type = required ? 'required' : 'type';
      const result = await ajvResolver<{ 'parent/~1': { 'a~1/b': string } }>({
        type: 'object',
        properties: {
          'parent/~1': {
            type: 'object',
            properties: { 'a~1/b': { type: 'string' } },
            required: ['a~1/b'],
          },
        },
        required: ['parent/~1'],
        errorMessage: 'Invalid value',
      })({ 'parent/~1': required ? {} : { 'a~1/b': 1 } }, undefined, {
        fields: { [name]: { name, ref } },
        criteriaMode: 'all',
        shouldUseNativeValidation,
      });

      expect(result.errors).toEqual({
        'parent/~1': {
          'a~1/b': {
            type,
            message: 'Invalid value',
            types: { [type]: 'Invalid value' },
            ref,
          },
        },
      });
      expect(result.errors['parent/~1']?.['a~1/b']?.ref).toBe(ref);
    },
  );

  it('should not mutate the input values object when `useDefaults` fills in missing properties (#647)', async () => {
    interface DataWithDefaults {
      user: { name: string; lastName: string };
    }

    const schemaWithDefaults: JSONSchemaType<DataWithDefaults> = {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            name: { type: 'string', default: 'Camilo' },
            lastName: { type: 'string', default: 'A random lastName' },
          },
          required: ['name', 'lastName'],
        },
      },
      required: ['user'],
    };

    // Simulates react-hook-form's internal form values, which are passed
    // into the resolver by reference and must not be mutated as a side
    // effect of validation.
    const formValues: Partial<DataWithDefaults> = { user: {} as any };

    const result = await ajvResolver(schemaWithDefaults, {
      useDefaults: true,
    })(formValues as DataWithDefaults, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(formValues).toEqual({ user: {} });
    expect(result).toEqual({
      values: { user: { name: 'Camilo', lastName: 'A random lastName' } },
      errors: {},
    });
  });
});

describe('ajvResolver async validation', () => {
  const schema: JSONSchemaType<{ title: string }> = {
    type: 'object',
    properties: { title: { type: 'string', minLength: 3, pattern: '^[A-Z]' } },
    required: ['title'],
  };
  const options = { fields: {}, shouldUseNativeValidation: false };

  it('returns field errors for invalid values', async () => {
    expect(
      await ajvResolver(schema, undefined, { mode: 'async' })(
        { title: 'x' },
        undefined,
        options,
      ),
    ).toEqual({
      values: {},
      errors: {
        title: {
          type: 'minLength',
          message: 'must NOT have fewer than 3 characters',
          ref: undefined,
        },
      },
    });
  });

  it('returns all criteria errors from the validation rejection', async () => {
    expect(
      await ajvResolver(schema, undefined, { mode: 'async' })(
        { title: 'x' },
        undefined,
        { ...options, criteriaMode: 'all' },
      ),
    ).toEqual({
      values: {},
      errors: {
        title: {
          type: 'minLength',
          message: 'must NOT have fewer than 3 characters',
          ref: undefined,
          types: {
            minLength: 'must NOT have fewer than 3 characters',
            pattern: 'must match pattern "^[A-Z]"',
          },
        },
      },
    });
  });

  it('preserves required paths and custom error messages', async () => {
    expect(
      await ajvResolver(
        {
          ...schema,
          errorMessage: { required: { title: 'Title is required' } },
        },
        undefined,
        { mode: 'async' },
      )({}, undefined, options),
    ).toEqual({
      values: {},
      errors: {
        title: {
          type: 'required',
          message: 'Title is required',
          ref: undefined,
        },
      },
    });
  });

  it('returns valid parsed values without mutating the input', async () => {
    const values = {};
    expect(
      await ajvResolver(
        {
          ...schema,
          properties: { title: { type: 'string', default: 'Title' } },
        },
        { useDefaults: true },
        { mode: 'async' },
      )(values, undefined, options),
    ).toEqual({ values: { title: 'Title' }, errors: {} });
    expect(values).toEqual({});
  });

  it('waits for an async format validation result', async () => {
    expect(
      await ajvResolver(
        {
          ...schema,
          properties: { title: { type: 'string', format: 'delayed' } },
        },
        {
          formats: {
            delayed: {
              type: 'string',
              async: true,
              validate: async () => false,
            },
          },
        },
        { mode: 'async' },
      )({ title: 'Title' }, undefined, options),
    ).toEqual({
      values: {},
      errors: {
        title: {
          type: 'format',
          message: 'must match format "delayed"',
          ref: undefined,
        },
      },
    });
  });

  it('sets and clears native validation errors', async () => {
    const ref = document.createElement('input');
    const resolver = ajvResolver(schema, undefined, { mode: 'async' });
    const nativeOptions = {
      fields: { title: { name: 'title', ref } },
      shouldUseNativeValidation: true,
      criteriaMode: 'all' as const,
    };
    const invalid = await resolver({ title: 'x' }, undefined, nativeOptions);
    expect(invalid.values).toEqual({});
    expect(invalid.errors.title).toEqual({
      type: 'minLength',
      message: 'must NOT have fewer than 3 characters',
      ref,
    });
    expect(ref.validationMessage).toBe('must NOT have fewer than 3 characters');
    expect(
      await resolver({ title: 'Title' }, undefined, nativeOptions),
    ).toEqual({ values: { title: 'Title' }, errors: {} });
    expect(ref.validationMessage).toBe('');
  });

  it('propagates non-validation errors from async formats', async () => {
    const error = new Error('Format failed');
    await expect(
      ajvResolver(
        {
          ...schema,
          properties: { title: { type: 'string', format: 'delayed' } },
        },
        {
          formats: {
            delayed: {
              type: 'string',
              async: true,
              validate: async () => {
                throw error;
              },
            },
          },
        },
        { mode: 'async' },
      )({ title: 'Title' }, undefined, options),
    ).rejects.toBe(error);
  });
});
