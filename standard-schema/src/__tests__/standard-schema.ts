import { standardSchemaResolver } from '..';
import {
  customSchema,
  fields,
  invalidData,
  schema,
  validData,
} from './__fixtures__/data';

const shouldUseNativeValidation = false;

describe('standardSchemaResolver', () => {
  it('should return values from standardSchemaResolver when validation pass', async () => {
    const result = await standardSchemaResolver(schema)(validData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(result).toMatchSnapshot();
  });

  it('should return a single error from standardSchemaResolver when validation fails', async () => {
    const result = await standardSchemaResolver(schema)(
      invalidData,
      undefined,
      {
        fields,
        shouldUseNativeValidation,
      },
    );

    expect(result).toMatchSnapshot();
  });

  it('should return all the errors from standardSchemaResolver when validation fails with `validateAllFieldCriteria` set to true', async () => {
    const result = await standardSchemaResolver(schema)(
      invalidData,
      undefined,
      {
        fields,
        criteriaMode: 'all',
        shouldUseNativeValidation,
      },
    );

    expect(result).toMatchSnapshot();
  });

  it('should return values from standardSchemaResolver when validation pass & raw=true', async () => {
    const validateSpy = vi.spyOn(schema['~standard'], 'validate');

    const result = await standardSchemaResolver(schema, {
      raw: true,
    })(validData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(validateSpy).toHaveBeenCalledTimes(1);
    expect(result).toMatchSnapshot();
  });
  it('should correctly handle path segments that are objects', async () => {
    const result = await standardSchemaResolver(customSchema)(
      validData,
      undefined,
      {
        fields,
        shouldUseNativeValidation,
      },
    );

    expect(result).toMatchSnapshot();
  });
});
