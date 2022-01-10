import { computedTypesResolver } from '..';
import { schema, validData, invalidData, fields } from './__fixtures__/data';

const shouldUseNativeValidation = false;

describe('computedTypesResolver', () => {
  it('should return values from computedTypesResolver when validation pass', async () => {
    const result = await computedTypesResolver(schema)(validData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(result).toEqual({ errors: {}, values: validData });
  });

  it('should return a single error from computedTypesResolver when validation fails', async () => {
    const result = await computedTypesResolver(schema)(invalidData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(result).toMatchSnapshot();
  });
});
