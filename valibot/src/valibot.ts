import { toNestError } from '@hookform/resolvers';
import type { Resolver } from './types';
import {
  BaseSchema,
  BaseSchemaAsync,
  ValiError,
  parse,
  parseAsync,
} from 'valibot';
import { FieldErrors, FieldError } from 'react-hook-form';

type FlatErrors = Record<string, [FieldError, ...FieldError[]]>;

const parseErrors = (error: ValiError): FieldErrors => {
  const errors = error.issues.reduce<FlatErrors>((flatErrors, issue) => {
    if (issue.path) {
      const path = issue.path.map(({ key }) => key).join('.');
      flatErrors[path] = [
        ...(flatErrors[path] || []),
        {
          message: issue.message,
          type: issue.validation,
        },
      ];
    }

    return flatErrors;
  }, {});

  return Object.entries(errors).reduce<FieldErrors>((acc, [path, errors]) => {
    const [firstError] = errors;
    acc[path] = {
      message: firstError.message,
      type: firstError.type,
    };

    return acc;
  }, {});
};

export const valibotResolver: Resolver =
  (
    schema,
    schemaOptions = {
      abortEarly: false,
      abortPipeEarly: false,
    },
    resolverOptions = {
      mode: 'async',
      raw: false,
    },
  ) =>
  async (values, _, options) => {
    try {
      const { mode, raw } = resolverOptions;
      const parsed =
        mode === 'sync'
          ? parse(schema as BaseSchema, values, schemaOptions)
          : await parseAsync(
              schema as BaseSchema | BaseSchemaAsync,
              values,
              schemaOptions,
            );

      return { values: raw ? values : parsed, errors: {} as FieldErrors };
    } catch (error) {
      if (error instanceof ValiError) {
        return {
          values: {},
          errors: toNestError(parseErrors(error), options),
        };
      }

      throw error;
    }
  };
