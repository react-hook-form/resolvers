import { appendErrors, FieldError, FieldErrors } from 'react-hook-form';
import { toNestErrors, validateFieldsNatively } from '@hookform/resolvers';
import type { Resolver } from './types';
import type { ValidationIssue } from '@typeschema/core';
import { validate } from '@typeschema/main';

const parseErrorSchema = (
  typeschemaErrors: ValidationIssue[],
  validateAllFieldCriteria: boolean,
): FieldErrors => {
  const errors: Record<string, FieldError> = {};

  for (const error of typeschemaErrors) {
    if (!error.path) {
      continue;
    }
    const _path = error.path.join('.');

    if (!errors[_path]) {
      errors[_path] = { message: error.message, type: '' };
    }

    if (validateAllFieldCriteria) {
      const types = errors[_path].types;
      const messages = types && types[''];

      errors[_path] = appendErrors(
        _path,
        validateAllFieldCriteria,
        errors,
        '',
        messages
          ? ([] as string[]).concat(messages as string[], error.message)
          : error.message,
      ) as FieldError;
    }
  }

  return errors;
};

export const typeschemaResolver: Resolver =
  (schema, _, resolverOptions = {}) =>
  async (values, _, options) => {
    const result = await validate(schema, values);

    options.shouldUseNativeValidation && validateFieldsNatively({}, options);

    if (result.success) {
      return {
        errors: {} as FieldErrors,
        values: resolverOptions.raw ? values : (result.data as any),
      };
    }

    return {
      values: {},
      errors: toNestErrors(
        parseErrorSchema(
          result.issues,
          !options.shouldUseNativeValidation && options.criteriaMode === 'all',
        ),
        options,
      ),
    };
  };
