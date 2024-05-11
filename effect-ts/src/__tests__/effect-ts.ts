import { effectTsResolver } from '..';
import { schema, validData, fields, invalidData } from './__fixtures__/data';

const shouldUseNativeValidation = false;

describe('effectTsResolver', () => {
  it('should return values from effectTsResolver when validation pass', async () => {
    const result = await effectTsResolver(schema)(validData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(result).toEqual({ errors: {}, values: validData });
  });

  it('should return a single error from effectTsResolver when validation fails', async () => {
    const result = await effectTsResolver(schema)(invalidData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(result).toMatchSnapshot();
  });
});
