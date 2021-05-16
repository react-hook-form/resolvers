import { appendErrors, FieldError } from 'react-hook-form';
import * as z from 'zod';
import { toNestError } from '@hookform/resolvers';
import type { Resolver } from './types';

const parseErrorSchema = (
  zodErrors: z.ZodSuberror[],
  validateAllFieldCriteria: boolean,
) => {
  const errors: Record<string, FieldError> = {};
  for (; zodErrors.length; ) {
    const error = zodErrors[0];
    const { code, message, path } = error;
    const _path = path.join('.');

    if (!errors[_path]) {
      if ('unionErrors' in error) {
        const unionError = error.unionErrors[0].errors[0];

        errors[_path] = {
          message: unionError.message,
          type: unionError.code,
        };
      } else {
        errors[_path] = { message, type: code };
      }
    }

    if ('unionErrors' in error) {
      error.unionErrors.forEach((unionError) =>
        unionError.errors.forEach((e) => zodErrors.push(e)),
      );
    }

    if (validateAllFieldCriteria) {
      const types = errors[_path].types;
      const messages = types && types[error.code];

      errors[_path] = appendErrors(
        _path,
        validateAllFieldCriteria,
        errors,
        code,
        messages
          ? ([] as string[]).concat(messages as string[], error.message)
          : error.message,
      ) as FieldError;
    }

    zodErrors.shift();
  }

  return errors;
};

export const zodResolver: Resolver =
  (schema, schemaOptions, resolverOptions = {}) =>
  async (values, _, options) => {
    try {
      return {
        errors: {},
        values: await schema[
          resolverOptions.mode === 'sync' ? 'parse' : 'parseAsync'
        ](values, schemaOptions),
      };
    } catch (error) {
      return {
        values: {},
        errors: error.isEmpty
          ? {}
          : toNestError(
              parseErrorSchema(error.errors, options.criteriaMode === 'all'),
              options.fields,
            ),
      };
    }
  };
