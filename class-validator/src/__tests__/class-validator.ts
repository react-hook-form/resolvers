/* eslint-disable no-console, @typescript-eslint/ban-ts-comment */
import { classValidatorResolver } from '..';
import { Schema, validData, fields, invalidData } from './__fixtures__/data';
import * as classValidator from 'class-validator';

const shouldUseNativeValidation = false;

describe('classValidatorResolver', () => {
  it('should return values from classValidatorResolver when validation pass', async () => {
    const schemaSpy = jest.spyOn(classValidator, 'validate');
    const schemaSyncSpy = jest.spyOn(classValidator, 'validateSync');

    const result = await classValidatorResolver(Schema)(validData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(schemaSpy).toHaveBeenCalledTimes(1);
    expect(schemaSyncSpy).not.toHaveBeenCalled();
    expect(result).toEqual({ errors: {}, values: validData });
  });

  it('should return values from classValidatorResolver with `mode: sync` when validation pass', async () => {
    const validateSyncSpy = jest.spyOn(classValidator, 'validateSync');
    const validateSpy = jest.spyOn(classValidator, 'validate');

    const result = await classValidatorResolver(Schema, undefined, {
      mode: 'sync',
    })(validData, undefined, { fields, shouldUseNativeValidation });

    expect(validateSyncSpy).toHaveBeenCalledTimes(1);
    expect(validateSpy).not.toHaveBeenCalled();
    expect(result).toEqual({ errors: {}, values: validData });
  });

  it('should return a single error from classValidatorResolver when validation fails', async () => {
    const result = await classValidatorResolver(Schema)(
      invalidData,
      undefined,
      {
        fields,
        shouldUseNativeValidation,
      },
    );

    expect(result).toMatchSnapshot();
  });

  it('should return a single error from classValidatorResolver with `mode: sync` when validation fails', async () => {
    const validateSyncSpy = jest.spyOn(classValidator, 'validateSync');
    const validateSpy = jest.spyOn(classValidator, 'validate');

    const result = await classValidatorResolver(Schema, undefined, {
      mode: 'sync',
    })(invalidData, undefined, { fields, shouldUseNativeValidation });

    expect(validateSyncSpy).toHaveBeenCalledTimes(1);
    expect(validateSpy).not.toHaveBeenCalled();
    expect(result).toMatchSnapshot();
  });

  it('should return all the errors from classValidatorResolver when validation fails with `validateAllFieldCriteria` set to true', async () => {
    const result = await classValidatorResolver(Schema)(
      invalidData,
      undefined,
      {
        fields,
        criteriaMode: 'all',
        shouldUseNativeValidation,
      },
    );

    expect(result).toMatchSnapshot();
  });

  it('should return all the errors from classValidatorResolver when validation fails with `validateAllFieldCriteria` set to true and `mode: sync`', async () => {
    const result = await classValidatorResolver(Schema, undefined, {
      mode: 'sync',
    })(invalidData, undefined, {
      fields,
      criteriaMode: 'all',
      shouldUseNativeValidation,
    });

    expect(result).toMatchSnapshot();
  });
});
