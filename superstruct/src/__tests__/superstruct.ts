import { superstructResolver } from '..';
import { invalidData, schema, validData, fields } from './__fixtures__/data';

const shouldUseNativeValidation = false;

describe('superstructResolver', () => {
  it('should return values from superstructResolver when validation pass', async () => {
    const result = await superstructResolver(schema)(validData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(result).toEqual({ errors: {}, values: validData });
  });

  it('should return a single error from superstructResolver when validation fails', async () => {
    const result = await superstructResolver(schema)(invalidData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(result).toMatchSnapshot();
  });

  it('should return values from superstructResolver when validation pass & raw=true', async () => {
    const result = await superstructResolver(schema, undefined, { raw: true })(
      validData,
      undefined,
      {
        fields,
        shouldUseNativeValidation,
      },
    );

    expect(result).toEqual({ errors: {}, values: validData });
  });
});
