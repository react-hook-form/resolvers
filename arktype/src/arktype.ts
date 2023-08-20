import { FieldError, FieldErrors } from 'react-hook-form';
import { toNestErrors, validateFieldsNatively } from '@hookform/resolvers';
import type { Resolver } from './types';
import { Problems } from 'arktype';

const parseErrorSchema = (e: Problems) => {
  const errors: Record<string, FieldError> = {};
  for (; e.length; ) {
    const error = e[0];
    const _path = error.path.join('.');

    if (!errors[_path]) {
      errors[_path] = { message: error.message, type: error.code };
    }

    // @ts-expect-error - false positive Property 'shift' does not exist on type 'Problems'.
    e.shift();
  }

  return errors;
};

export const arktypeResolver: Resolver =
  (schema, _schemaOptions, resolverOptions = {}) =>
  (values, _, options) => {
    const result = schema(values);

    if (result.problems) {
      return {
        values: {},
        errors: toNestErrors(parseErrorSchema(result.problems), options),
      };
    }

    options.shouldUseNativeValidation && validateFieldsNatively({}, options);

    return {
      errors: {} as FieldErrors,
      values: resolverOptions.raw ? values : result.data,
    };
  };
