import { toNestErrors, validateFieldsNatively } from '@hookform/resolvers';
import { ValidationError, Validator } from 'ata-validator';
import { FieldError, appendErrors } from 'react-hook-form';
import { Resolver } from './types';

const parseErrorSchema = (
  ataErrors: ValidationError[],
  validateAllFieldCriteria: boolean,
) => {
  const parsedErrors: Record<string, FieldError> = {};

  for (let index = 0; index < ataErrors.length; index += 1) {
    const error = ataErrors[index];

    const instancePath =
      error.keyword === 'required'
        ? `${error.instancePath}/${error.params.missingProperty}`
        : error.instancePath;

    const path = instancePath.substring(1).replace(/\//g, '.');

    if (!parsedErrors[path]) {
      parsedErrors[path] = {
        message: error.message,
        type: error.keyword,
      };
    }

    if (validateAllFieldCriteria) {
      const types = parsedErrors[path].types;
      const messages = types && types[error.keyword];

      parsedErrors[path] = appendErrors(
        path,
        validateAllFieldCriteria,
        parsedErrors,
        error.keyword,
        messages
          ? ([] as string[]).concat(messages as string[], error.message || '')
          : error.message,
      ) as FieldError;
    }
  }

  return parsedErrors;
};

export const ataResolver: Resolver = (
  schema,
  schemaOptions,
  resolverOptions = {},
) => {
  const validator = new Validator(schema, schemaOptions);
  return async (values, _, options) => {
    const result = validator.validate(values);

    options.shouldUseNativeValidation && validateFieldsNatively({}, options);

    return result.valid
      ? {
          values: resolverOptions.raw ? Object.assign({}, values) : values,
          errors: {},
        }
      : {
          values: {},
          errors: toNestErrors(
            parseErrorSchema(
              result.errors,
              !options.shouldUseNativeValidation &&
                options.criteriaMode === 'all',
            ),
            options,
          ),
        };
  };
};
