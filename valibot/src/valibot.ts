import { toNestErrors } from '@hookform/resolvers';
import type { Resolver } from './types';
import {
  BaseSchema,
  BaseSchemaAsync,
  ValiError,
  parse,
  parseAsync,
} from 'valibot';
import { FieldErrors, FieldError, appendErrors } from 'react-hook-form';
const parseErrors = (
  valiErrors: ValiError,
  validateAllFieldCriteria: boolean,
): FieldErrors => {
  const errors: Record<string, FieldError> = {};

  for (const error of valiErrors.issues) {
    if (!error.path) {
      continue;
    }
    const _path = error.path.map(({ key }) => key).join('.');

    if (!errors[_path]) {
      errors[_path] = { message: error.message, type: error.validation };
    }

    if (validateAllFieldCriteria) {
      const types = errors[_path].types;
      const messages = types && types[error.validation];

      errors[_path] = appendErrors(
        _path,
        validateAllFieldCriteria,
        errors,
        error.validation,
        messages
          ? ([] as string[]).concat(messages as string[], error.message)
          : error.message,
      ) as FieldError;
    }
  }

  return errors;
};

export const valibotResolver: Resolver =
  (schema, schemaOptions, resolverOptions = {}) =>
  async (values, _, options) => {
    try {
      const schemaOpts = Object.assign(
        {},
        {
          abortEarly: false,
          abortPipeEarly: false,
        },
        schemaOptions,
      );

      const parsed =
        resolverOptions.mode === 'sync'
          ? parse(schema as BaseSchema, values, schemaOpts)
          : await parseAsync(
              schema as BaseSchema | BaseSchemaAsync,
              values,
              schemaOpts,
            );

      return {
        values: resolverOptions.raw ? values : parsed,
        errors: {} as FieldErrors,
      };
    } catch (error) {
      if (error instanceof ValiError) {
        return {
          values: {},
          errors: toNestErrors(
            parseErrors(
              error,
              !options.shouldUseNativeValidation &&
                options.criteriaMode === 'all',
            ),
            options,
          ),
        };
      }

      throw error;
    }
  };
