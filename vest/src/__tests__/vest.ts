import { vestResolver } from '..';
import {
  invalidData,
  validationSuite,
  validData,
  fields,
} from './__fixtures__/data';

describe('vestResolver', () => {
  it('should return values from vestResolver when validation pass', async () => {
    expect(
      await vestResolver(validationSuite)(validData, undefined, { fields }),
    ).toEqual({
      values: validData,
      errors: {},
    });
  });

  it('should return values from vestResolver with `mode: sync` when validation pass', async () => {
    expect(
      await vestResolver(validationSuite, undefined, {
        mode: 'sync',
      })(validData, undefined, { fields }),
    ).toEqual({
      values: validData,
      errors: {},
    });
  });

  it('should return single error message from vestResolver when validation fails and validateAllFieldCriteria set to false', async () => {
    expect(
      await vestResolver(validationSuite)(invalidData, undefined, {
        fields,
      }),
    ).toMatchSnapshot();
  });

  it('should return single error message from vestResolver when validation fails and validateAllFieldCriteria set to false and `mode: sync`', async () => {
    expect(
      await vestResolver(validationSuite, undefined, {
        mode: 'sync',
      })(invalidData, undefined, { fields }),
    ).toMatchSnapshot();
  });

  it('should return all the error messages from vestResolver when validation fails and validateAllFieldCriteria set to true', async () => {
    expect(
      await vestResolver(validationSuite)(
        invalidData,
        {},
        { fields, criteriaMode: 'all' },
      ),
    ).toMatchSnapshot();
  });

  it('should return all the error messages from vestResolver when validation fails and validateAllFieldCriteria set to true and `mode: sync`', async () => {
    expect(
      await vestResolver(validationSuite, undefined, { mode: 'sync' })(
        invalidData,
        {},
        { fields, criteriaMode: 'all' },
      ),
    ).toMatchSnapshot();
  });
});
