import { FieldErrors } from 'react-hook-form';
import { toNestError, validateFieldsNatively } from '@hookform/resolvers';
import { plainToClass } from 'class-transformer';
import { validate, validateSync, ValidationError } from 'class-validator';
import type { Resolver } from './types';

const parseErrors = (
  errors: ValidationError[],
  validateAllFieldCriteria: boolean,
  parsedErrors: FieldErrors = {},
  path = '',
) => {
  return errors.reduce((acc, error) => {
    const _path = path ? `${path}.${error.property}` : error.property;

    if (error.constraints) {
      const key = Object.keys(error.constraints)[0];
      acc[_path] = {
        type: key,
        message: error.constraints[key],
      };

      if (validateAllFieldCriteria && acc[_path]) {
        Object.assign(acc[_path], { types: error.constraints });
      }
    }

    if (error.children && error.children.length) {
      parseErrors(error.children, validateAllFieldCriteria, acc, _path);
    }

    return acc;
  }, parsedErrors);
};

export const classValidatorResolver: Resolver =
  (schema, schemaOptions = {}, resolverOptions = {}) =>
  async (values, _, options) => {
    const user = plainToClass(schema, values);

    const rawErrors = await (resolverOptions.mode === 'sync'
      ? validateSync
      : validate)(user, schemaOptions);

    if (rawErrors.length) {
      return {
        values: {},
        errors: toNestError(
          parseErrors(
            rawErrors,
            !options.shouldUseNativeValidation &&
              options.criteriaMode === 'all',
          ),
          options,
        ),
      };
    }

    options.shouldUseNativeValidation && validateFieldsNatively({}, options);

    return { values, errors: {} };
  };
