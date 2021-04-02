import { appendErrors, FieldError } from 'react-hook-form';
import { toNestError } from '@hookform/resolvers';
import type { ValidationError } from 'joi';
import { Resolver } from './types';

const parseErrorSchema = (
  error: ValidationError,
  validateAllFieldCriteria: boolean,
) =>
  error.details.length
    ? error.details.reduce<Record<string, FieldError>>((previous, error) => {
        const _path = error.path.join('.');

        if (!previous[_path]) {
          previous[_path] = { message: error.message, type: error.type };
        }

        if (validateAllFieldCriteria) {
          previous[_path] = appendErrors(
            _path,
            validateAllFieldCriteria,
            previous,
            error.type,
            error.message,
          ) as FieldError;
        }

        return previous;
      }, {})
    : {};

export const joiResolver: Resolver = (
  schema,
  schemaOptions = {
    abortEarly: false,
  },
  resolverOptions = {},
) => async (values, context, options) => {
  const _schemaOptions = Object.assign({}, schemaOptions, {
    context,
  });

  let result: Record<string, any> = {};
  if (resolverOptions.mode === 'sync') {
    result = schema.validate(values, _schemaOptions);
  } else {
    try {
      result.value = await schema.validateAsync(values, _schemaOptions);
    } catch (e) {
      result.error = e;
    }
  }

  return {
    values: result.error ? {} : result.value,
    errors: result.error
      ? toNestError(
          parseErrorSchema(result.error, options.criteriaMode === 'all'),
          options.fields,
        )
      : {},
  };
};
