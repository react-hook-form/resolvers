import { ajvResolver } from '..';
import * as fixture from './__fixtures__/data-errors';

const shouldUseNativeValidation = false;

describe('ajvResolver with errorMessage', () => {
  it('should return values when validation pass', async () => {
    expect(
      await ajvResolver(fixture.schemaA)(fixture.validDataA, undefined, {
        fields: fixture.fieldsA,
        criteriaMode: 'all',
        shouldUseNativeValidation,
      }),
    ).toEqual({
      values: fixture.validDataA,
      errors: {},
    });
  });

  it('should return customized error messages when validation fails', async () => {
    expect(
      await ajvResolver(fixture.schemaA)(
        fixture.invalidDataA,
        {},
        {
          fields: fixture.fieldsA,
          criteriaMode: 'all',
          shouldUseNativeValidation,
        },
      ),
    ).toMatchSnapshot();
  });

  it('should return customized error messages when requirement fails', async () => {
    expect(
      await ajvResolver(fixture.schemaA)({}, undefined, {
        fields: fixture.fieldsA,
        criteriaMode: 'all',
        shouldUseNativeValidation,
      }),
    ).toMatchSnapshot();
  });

  it('should return customized error messages when some properties are undefined', async () => {
    expect(
      await ajvResolver(fixture.schemaA, undefined, { mode: 'sync' })(
        fixture.undefinedDataA,
        undefined,
        {
          fields: fixture.fieldsA,
          criteriaMode: 'all',
          shouldUseNativeValidation,
        },
      ),
    ).toMatchSnapshot();
  });

  it('should return the same customized message for all validation failures', async () => {
    expect(
      await ajvResolver(fixture.schemaB)(
        fixture.invalidDataB,
        {},
        {
          fields: fixture.fieldsRest,
          criteriaMode: 'all',
          shouldUseNativeValidation,
        },
      ),
    ).toMatchSnapshot();
  });

  it('should return the same customized error message when requirement fails', async () => {
    expect(
      await ajvResolver(fixture.schemaB)({}, undefined, {
        fields: fixture.fieldsRest,
        criteriaMode: 'all',
        shouldUseNativeValidation,
      }),
    ).toMatchSnapshot();
  });

  it('should return the same customized message when some properties are undefined', async () => {
    expect(
      await ajvResolver(fixture.schemaB)(fixture.undefinedDataB, undefined, {
        fields: fixture.fieldsRest,
        criteriaMode: 'all',
        shouldUseNativeValidation,
      }),
    ).toMatchSnapshot();
  });

  it('should return customized error messages for certain keywords when walidation fails', async () => {
    expect(
      await ajvResolver(fixture.schemaC)(
        fixture.invalidDataC,
        {},
        {
          fields: fixture.fieldsRest,
          criteriaMode: 'all',
          shouldUseNativeValidation,
        },
      ),
    ).toMatchSnapshot();
  });

  it('should return customized error messages for certain keywords when requirement fails', async () => {
    expect(
      await ajvResolver(fixture.schemaC)({}, undefined, {
        fields: fixture.fieldsRest,
        criteriaMode: 'all',
        shouldUseNativeValidation,
      }),
    ).toMatchSnapshot();
  });

  it('should return customized error messages for certain keywords when some properties are undefined', async () => {
    expect(
      await ajvResolver(fixture.schemaC)(fixture.undefinedDataC, undefined, {
        fields: fixture.fieldsRest,
        criteriaMode: 'all',
        shouldUseNativeValidation,
      }),
    ).toMatchSnapshot();
  });

  it('should return different messages for different properties when walidation fails', async () => {
    expect(
      await ajvResolver(fixture.schemaD)(
        fixture.invalidDataD,
        {},
        {
          fields: fixture.fieldsRest,
          criteriaMode: 'all',
          shouldUseNativeValidation,
        },
      ),
    ).toMatchSnapshot();
  });

  it('should return different messages for different properties when requirement fails', async () => {
    expect(
      await ajvResolver(fixture.schemaD)({}, undefined, {
        fields: fixture.fieldsRest,
        criteriaMode: 'all',
        shouldUseNativeValidation,
      }),
    ).toMatchSnapshot();
  });

  it('should return different messages for different properties when some properties are undefined', async () => {
    expect(
      await ajvResolver(fixture.schemaD)(fixture.undefinedDataD, undefined, {
        fields: fixture.fieldsRest,
        criteriaMode: 'all',
        shouldUseNativeValidation,
      }),
    ).toMatchSnapshot();
  });

  it('should return customized errors for properties/items when walidation fails', async () => {
    expect(
      await ajvResolver(fixture.schemaE)(
        fixture.invalidDataE,
        {},
        {
          fields: fixture.fieldsRest,
          criteriaMode: 'all',
          shouldUseNativeValidation,
        },
      ),
    ).toMatchSnapshot();
  });

  it('should return customized errors for properties/items when requirement fails', async () => {
    expect(
      await ajvResolver(fixture.schemaE)({}, undefined, {
        fields: fixture.fieldsRest,
        criteriaMode: 'all',
        shouldUseNativeValidation,
      }),
    ).toMatchSnapshot();
  });

  it('should return customized errors for properties/items when some properties are undefined', async () => {
    expect(
      await ajvResolver(fixture.schemaE)(fixture.undefinedDataE, undefined, {
        fields: fixture.fieldsRest,
        criteriaMode: 'all',
        shouldUseNativeValidation,
      }),
    ).toMatchSnapshot();
  });

  it('should return a default message if there is no specific message for the error when walidation fails', async () => {
    expect(
      await ajvResolver(fixture.schemaF)(
        fixture.invalidDataF,
        {},
        {
          fields: fixture.fieldsRest,
          criteriaMode: 'all',
          shouldUseNativeValidation,
        },
      ),
    ).toMatchSnapshot();
  });

  it('should return a default message if there is no specific message for the error when requirement fails', async () => {
    expect(
      await ajvResolver(fixture.schemaF)({}, undefined, {
        fields: fixture.fieldsRest,
        criteriaMode: 'all',
        shouldUseNativeValidation,
      }),
    ).toMatchSnapshot();
  });

  it('should return a default message if there is no specific message for the error when some properties are undefined', async () => {
    expect(
      await ajvResolver(fixture.schemaF)(fixture.undefinedDataF, undefined, {
        fields: fixture.fieldsRest,
        criteriaMode: 'all',
        shouldUseNativeValidation,
      }),
    ).toMatchSnapshot();
  });
});
