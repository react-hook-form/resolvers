import { toNestErrors, validateFieldsNatively } from '@hookform/resolvers';
import { ArkErrors } from 'arktype';
import { FieldError, FieldErrors } from 'react-hook-form';
import type { Resolver } from './types';

const parseErrorSchema = (arkErrors: ArkErrors): Record<string, FieldError> => {
  const errors = [...arkErrors];
  const fieldsErrors: Record<string, FieldError> = {};

  for (; errors.length; ) {
    const error = errors[0];
    const _path = error.path.join('.');

    if (!fieldsErrors[_path]) {
      fieldsErrors[_path] = { message: error.message, type: error.code };
    }

    errors.shift();
  }

  return fieldsErrors;
};

export const arktypeResolver: Resolver =
  (schema, _schemaOptions, resolverOptions = {}) =>
  (values, _, options) => {
    const out = schema(values);

    if (out instanceof ArkErrors) {
      return {
        values: {},
        errors: toNestErrors(parseErrorSchema(out), options),
      };
    }

    options.shouldUseNativeValidation && validateFieldsNatively({}, options);

    return {
      errors: {} as FieldErrors,
      values: resolverOptions.raw ? Object.assign({}, values) : out,
    };
  };
