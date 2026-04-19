import { ataResolver } from '..';
import {
  fields,
  invalidData,
  invalidDataWithUndefined,
  schema,
  validData,
} from './__fixtures__/data';

const shouldUseNativeValidation = false;

describe('ataResolver', () => {
  it('should return values from ataResolver when validation pass', async () => {
    expect(
      await ataResolver(schema)(validData, undefined, {
        fields,
        shouldUseNativeValidation,
      }),
    ).toEqual({
      values: validData,
      errors: {},
    });
  });

  it('should return values from ataResolver when validation pass & raw=true', async () => {
    const result = await ataResolver(schema, undefined, { raw: true })(
      validData,
      undefined,
      {
        fields,
        shouldUseNativeValidation,
      },
    );

    expect(result).toEqual({ errors: {}, values: validData });
  });

  it('should return single error message from ataResolver when validation fails and validateAllFieldCriteria set to false', async () => {
    expect(
      await ataResolver(schema)(invalidData, undefined, {
        fields,
        shouldUseNativeValidation,
      }),
    ).toMatchSnapshot();
  });

  it('should return all the error messages from ataResolver when validation fails and validateAllFieldCriteria set to true', async () => {
    expect(
      await ataResolver(schema)(
        invalidData,
        {},
        { fields, criteriaMode: 'all', shouldUseNativeValidation },
      ),
    ).toMatchSnapshot();
  });

  it('should return all the error messages from ataResolver when requirement fails', async () => {
    expect(
      await ataResolver(schema)({}, undefined, {
        fields,
        shouldUseNativeValidation,
      }),
    ).toMatchSnapshot();
  });

  it('should return all the error messages from ataResolver when some property is undefined', async () => {
    expect(
      await ataResolver(schema)(invalidDataWithUndefined, undefined, {
        fields,
        shouldUseNativeValidation,
      }),
    ).toMatchSnapshot();
  });

  it('should support coerceTypes option', async () => {
    const coerceSchema = {
      type: 'object',
      properties: {
        age: { type: 'integer' },
        active: { type: 'boolean' },
      },
      required: ['age', 'active'],
    };

    const result = await ataResolver(coerceSchema, { coerceTypes: true })(
      { age: '25', active: 'true' },
      undefined,
      { fields, shouldUseNativeValidation },
    );

    expect(result.errors).toEqual({});
  });

  it('should support removeAdditional option', async () => {
    const strictSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
      required: ['name'],
      additionalProperties: false,
    };

    const result = await ataResolver(strictSchema, {
      removeAdditional: true,
    })({ name: 'test', extra: 'field' }, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(result.errors).toEqual({});
  });
});
