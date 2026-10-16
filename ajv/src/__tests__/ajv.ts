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
