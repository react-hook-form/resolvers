/* eslint-disable no-console, @typescript-eslint/ban-ts-comment */
import { valibotResolver } from '..';
import { schema, validData, fields, invalidData } from './__fixtures__/data';

const shouldUseNativeValidation = false;
describe('valibotResolver', () => {
  it('should return values from valibotResolver when validation pass', async () => {
    const result = await valibotResolver(schema)(validData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(result).toEqual({ errors: {}, values: validData });
  });

  it('should return a single error from valibotResolver when validation fails', async () => {
    const result = await valibotResolver(schema)(invalidData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(result).toMatchSnapshot();
  });
});
