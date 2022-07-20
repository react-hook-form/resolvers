import { ajvFormatsResolver } from '..';
import {
  fields,
  invalidData,
  invalidEmail,
  schema,
  schemaFormat,
  validData,
  validEmail,
} from './__fixtures__/data';

const shouldUseNativeValidation = false;

describe('ajvFormatsResolver', () => {
  it('should return values from ajvFormatsResolver when validation pass', async () => {
    expect(
      await ajvFormatsResolver(schema)(validData, undefined, {
        fields,
        shouldUseNativeValidation,
      }),
    ).toEqual({
      values: validData,
      errors: {},
    });
  });

  it('should return values from ajvFormatsResolver with `mode: sync` when validation pass', async () => {
    expect(
      await ajvFormatsResolver(schema, undefined, {
        mode: 'sync',
      })(validData, undefined, { fields, shouldUseNativeValidation }),
    ).toEqual({
      values: validData,
      errors: {},
    });
  });

  it('should return single error message from ajvFormatsResolver when validation fails and validateAllFieldCriteria set to false', async () => {
    expect(
      await ajvFormatsResolver(schema)(invalidData, undefined, {
        fields,
        shouldUseNativeValidation,
      }),
    ).toMatchSnapshot();
  });

  it('should return single error message from ajvFormatsResolver when validation fails and validateAllFieldCriteria set to false and `mode: sync`', async () => {
    expect(
      await ajvFormatsResolver(schema, undefined, {
        mode: 'sync',
      })(invalidData, undefined, { fields, shouldUseNativeValidation }),
    ).toMatchSnapshot();
  });

  it('should return all the error messages from ajvFormatsResolver when validation fails and validateAllFieldCriteria set to true', async () => {
    expect(
      await ajvFormatsResolver(schema)(
        invalidData,
        {},
        { fields, criteriaMode: 'all', shouldUseNativeValidation },
      ),
    ).toMatchSnapshot();
  });

  it('should return all the error messages from ajvFormatsResolver when validation fails and validateAllFieldCriteria set to true and `mode: sync`', async () => {
    expect(
      await ajvFormatsResolver(schema, undefined, { mode: 'sync' })(
        invalidData,
        {},
        { fields, criteriaMode: 'all', shouldUseNativeValidation },
      ),
    ).toMatchSnapshot();
  });

  it('should return all the error messages from ajvFormatsResolver when requirement fails and validateAllFieldCriteria set to true', async () => {
    expect(
      await ajvFormatsResolver(schema)({}, undefined, {
        fields,
        shouldUseNativeValidation,
      }),
    ).toMatchSnapshot();
  });

  it('should return all the error messages from ajvFormatsResolver when requirement fails and validateAllFieldCriteria set to true and `mode: sync`', async () => {
    expect(
      await ajvFormatsResolver(schema, undefined, { mode: 'sync' })(
        {},
        undefined,
        {
          fields,
          shouldUseNativeValidation,
        },
      ),
    ).toMatchSnapshot();
  });

  it('should return values from ajvFormatsResolver when format validation pass', async () => {
    expect(
      await ajvFormatsResolver(schemaFormat)(validEmail, undefined, {
        fields,
        shouldUseNativeValidation,
      }),
    ).toEqual({
      values: validEmail,
      errors: {},
    });
  });

  it('should return error messages from ajvFormatsResolver when format validation fails', async () => {
    expect(
      await ajvFormatsResolver(schemaFormat)(invalidEmail, undefined, {
        fields,
        shouldUseNativeValidation,
      }),
    ).toMatchSnapshot();
  });
});
