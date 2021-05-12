import { computedTypesResolver } from '..';
import { schema, validData, invalidData, fields } from './__fixtures__/data';

describe('computedTypesResolver', () => {
  it('should return values from computedTypesResolver when validation pass', async () => {
    const result = await computedTypesResolver(schema)(validData, undefined, {
      fields,
    });

    expect(result).toEqual({ errors: {}, values: validData });
  });

  it.only('should return a single error from computedTypesResolver when validation fails', async () => {
    const result = await computedTypesResolver(schema)(invalidData, undefined, {
      fields,
    });

    expect(result).toMatchSnapshot();
  });
});
