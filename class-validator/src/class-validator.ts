import { toNestErrors, validateFieldsNatively } from '@hookform/resolvers';
import {
  ClassConstructor,
  ClassTransformOptions,
  plainToClass,
} from 'class-transformer';
import {
  ValidationError,
  ValidatorOptions,
  validate,
  validateSync,
} from 'class-validator';
import { FieldErrors, Resolver } from 'react-hook-form';

function parseErrorSchema(
  errors: ValidationError[],
  validateAllFieldCriteria: boolean,
  parsedErrors: FieldErrors = {},
  path = '',
) {
  return errors.reduce((acc, error) => {
    const _path = path ? `${path}.${error.property}` : error.property;

    if (error.constraints) {
      const key = Object.keys(error.constraints)[0];
      acc[_path] = {
        type: key,
        message: error.constraints[key],
      };

      const _e = acc[_path];
      if (validateAllFieldCriteria && _e) {
        Object.assign(_e, { types: error.constraints });
      }
    }

    if (error.children && error.children.length) {
      parseErrorSchema(error.children, validateAllFieldCriteria, acc, _path);
    }

    return acc;
  }, parsedErrors);
}

export function classValidatorResolver<Schema extends Record<string, any>>(
  schema: ClassConstructor<Schema>,
  schemaOptions: {
    validator?: ValidatorOptions;
    transformer?: ClassTransformOptions;
  } = {},
  resolverOptions: { mode?: 'async' | 'sync'; raw?: boolean } = {},
): Resolver<Schema> {
  return async (values, _, options) => {
    const { transformer, validator } = schemaOptions;
    const data = plainToClass(schema, values, transformer);

    const rawErrors = await (resolverOptions.mode === 'sync'
      ? validateSync
      : validate)(data, validator);

    if (rawErrors.length) {
      return {
        values: {},
        errors: toNestErrors(
          parseErrorSchema(
            rawErrors,
            !options.shouldUseNativeValidation &&
              options.criteriaMode === 'all',
          ),
          options,
        ),
      };
    }

    options.shouldUseNativeValidation && validateFieldsNatively({}, options);

    return {
      values: resolverOptions.raw ? Object.assign({}, values) : data,
      errors: {},
    };
  };
}
