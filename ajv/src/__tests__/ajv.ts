import { ajvResolver } from '..';
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

describe('ajvResolver', () => {
  it('should return values from ajvResolver when validation pass', async () => {
    expect(
      await ajvResolver(schema)(validData, undefined, {
        fields,
        shouldUseNativeValidation,
      }),
    ).toEqual({
      values: validData,
      errors: {},
    });
  });

  it('should return values from ajvResolver with `mode: sync` when validation pass', async () => {
    expect(
      await ajvResolver(schema, undefined, {
        mode: 'sync',
      })(validData, undefined, { fields, shouldUseNativeValidation }),
    ).toEqual({
      values: validData,
      errors: {},
    });
  });

  it('should return single error message from ajvResolver when validation fails and validateAllFieldCriteria set to false', async () => {
    expect(
      await ajvResolver(schema)(invalidData, undefined, {
        fields,
        shouldUseNativeValidation,
      }),
    ).toMatchSnapshot();
  });

  it('should return single error message from ajvResolver when validation fails and validateAllFieldCriteria set to false and `mode: sync`', async () => {
    expect(
      await ajvResolver(schema, undefined, {
        mode: 'sync',
      })(invalidData, undefined, { fields, shouldUseNativeValidation }),
    ).toMatchSnapshot();
  });

  it('should return all the error messages from ajvResolver when validation fails and validateAllFieldCriteria set to true', async () => {
    expect(
      await ajvResolver(schema)(
        invalidData,
        {},
        { fields, criteriaMode: 'all', shouldUseNativeValidation },
      ),
    ).toMatchSnapshot();
  });

  it('should return all the error messages from ajvResolver when validation fails and validateAllFieldCriteria set to true and `mode: sync`', async () => {
    expect(
      await ajvResolver(schema, undefined, { mode: 'sync' })(
        invalidData,
        {},
        { fields, criteriaMode: 'all', shouldUseNativeValidation },
      ),
    ).toMatchSnapshot();
  });

  it('should return all the error messages from ajvResolver when requirement fails and validateAllFieldCriteria set to true', async () => {
    expect(
      await ajvResolver(schema)({}, undefined, {
        fields,
        shouldUseNativeValidation,
      }),
    ).toMatchSnapshot();
  });

  it('should return all the error messages from ajvResolver when requirement fails and validateAllFieldCriteria set to true and `mode: sync`', async () => {
    expect(
      await ajvResolver(schema, undefined, { mode: 'sync' })({}, undefined, {
        fields,
        shouldUseNativeValidation,
      }),
    ).toMatchSnapshot();
  });

  it('should return values from ajvResolver when format validation pass', async () => {
    expect(
      await ajvResolver(schemaFormat, undefined, { addFormats: true })(
        validEmail,
        undefined,
        {
          fields,
          shouldUseNativeValidation,
        },
      ),
    ).toEqual({
      values: validEmail,
      errors: {},
    });
  });

  it('should return error messages from ajvResolver when format validation fails', async () => {
    expect(
      await ajvResolver(schemaFormat, undefined, { addFormats: true })(
        invalidEmail,
        undefined,
        {
          fields,
          shouldUseNativeValidation,
        },
      ),
    ).toMatchSnapshot();
  });
});
