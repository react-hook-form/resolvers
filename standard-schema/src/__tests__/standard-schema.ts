import { standardSchemaResolver } from '..';
import { fields, invalidData, schema, validData } from './__fixtures__/data';

const shouldUseNativeValidation = false;

describe('standardSchemaResolver', () => {
  it('should return values from standardSchemaResolver when validation pass & raw=true', async () => {
    const result = await standardSchemaResolver(schema)(validData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(result).toEqual({ errors: {}, values: validData });
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
});
