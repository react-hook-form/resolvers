import { ajvResolver } from '..';
import { fields, invalidData, invalidDataWithUndefined, schema, validData, emptyData, Data } from './__fixtures__/data';

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
      await ajvResolver(schema)(emptyData, undefined, {
        fields,
        shouldUseNativeValidation,
      }),
    ).toMatchSnapshot();
  });

  it('should return all the error messages from ajvResolver when requirement fails and validateAllFieldCriteria set to true and `mode: sync`', async () => {
    expect(
      await ajvResolver(schema, undefined, { mode: 'sync' })(emptyData, undefined, {
        fields,
        shouldUseNativeValidation,
      }),
    ).toMatchSnapshot();
  });

  it('should return all the error messages from ajvResolver when some property is undefined and result will keep the input data structure', async () => {
    expect(
      await ajvResolver(schema, undefined, { mode: 'sync' })(
        invalidDataWithUndefined,
        undefined,
        {
          fields,
          shouldUseNativeValidation,
        },
      ),
    ).toMatchSnapshot();
  });

  it('should run given transform function before validating values', async function() {
    const validWithEmail = { ...validData, optionalEmail: '' };
    const transform = (data: Data) => {
      const fieldsToValidate = { ...data };
      delete fieldsToValidate.optionalEmail;

      return fieldsToValidate;
    }

    // ensure validation error exists without transform
    const withoutTransform = await ajvResolver(schema, undefined)(validWithEmail, undefined, { fields, shouldUseNativeValidation });
    expect(Object.keys(withoutTransform.errors).length).toBeGreaterThan(0);

    const withTransform = await ajvResolver(schema, undefined, { transform })(validWithEmail, undefined, { fields, shouldUseNativeValidation });
    expect(Object.keys(withTransform.errors).length).toEqual(0);
  });

  it('should not modify form values when transform function is provided', async function() {
    const validWithEmail = { ...validData, optionalEmail: '' };
    const transform = (data: Data) => {
      const fieldsToValidate = { ...data };
      delete fieldsToValidate.optionalEmail;

      return fieldsToValidate;
    }

    const result = await ajvResolver(schema, undefined, { transform })(validWithEmail, undefined, { fields, shouldUseNativeValidation });
    expect(result.values).toEqual(validWithEmail);
  });
});
