/* eslint-disable no-console, @typescript-eslint/ban-ts-comment */
import { valitaResolver } from '..';
import {
  fields,
  invalidData,
  invalidSchemaErrorData,
  schema,
  schemaError,
  validData,
  validSchemaErrorData,
} from './__fixtures__/data';

const shouldUseNativeValidation = false;
describe('valitaResolver', () => {
  it('should return values from valitaResolver when validation pass', async () => {
    const result = await valitaResolver(schema)(validData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(result).toEqual({ errors: {}, values: validData });
  });

  it('should return a single error from valitaResolver when validation fails', async () => {
    const result = await valitaResolver(schema)(invalidData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(result).toMatchSnapshot();
  });

  it('should return all the errors from valitaResolver when validation fails with `validateAllFieldCriteria` set to true', async () => {
    const result = await valitaResolver(schema)(invalidData, undefined, {
      fields,
      criteriaMode: 'all',
      shouldUseNativeValidation,
    });

    expect(result).toMatchSnapshot();
  });

  it('should be able to validate variants without errors', async () => {
    const result = await valitaResolver(schemaError)(
      validSchemaErrorData,
      undefined,
      {
        fields,
        shouldUseNativeValidation,
      },
    );

    expect(result).toEqual({
      errors: {},
      values: {
        type: 'a',
      },
    });
  });

  it('should be able to validate invalid schema with errors', async () => {
    const result = await valitaResolver(schemaError)(
      invalidSchemaErrorData,
      undefined,
      {
        fields,
        shouldUseNativeValidation,
      },
    );

    expect(result).toEqual({
      errors: {
        type: {
          message: 'invalid_literal',
          ref: undefined,
          type: 'invalid_literal',
        },
      },
      values: {},
    });
  });
});
