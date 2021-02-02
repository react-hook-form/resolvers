import { appendErrors, transformToNestObject } from 'react-hook-form';
import * as z from 'zod';
import { convertArrayToPathName } from '@hookform/resolvers';
import type { Resolver } from './types';

const parseErrorSchema = (
  zodError: z.ZodError,
  validateAllFieldCriteria: boolean,
) => {
  if (zodError.isEmpty) {
    return {};
  }

  return zodError.errors.reduce<Record<string, any>>(
    (previous, { path, message, code: type }) => {
      const currentPath = convertArrayToPathName(path);

      return {
        ...previous,
        ...(path
          ? previous[currentPath] && validateAllFieldCriteria
            ? {
                [currentPath]: appendErrors(
                  currentPath,
                  validateAllFieldCriteria,
                  previous,
                  type,
                  message,
                ),
              }
            : {
                [currentPath]: previous[currentPath] || {
                  message,
                  type,
                  ...(validateAllFieldCriteria
                    ? {
                        types: { [type]: message || true },
                      }
                    : {}),
                },
              }
          : {}),
      };
    },
    {},
  );
};

export const zodResolver: Resolver = (
  schema,
  schemaOptions,
  { mode } = { mode: 'async' },
) => async (values, _, { criteriaMode }) => {
  try {
    const result =
      mode === 'async'
        ? await schema.parseAsync(values, schemaOptions)
        : schema.parse(values, schemaOptions);

    return { values: result, errors: {} };
  } catch (error) {
    return {
      values: {},
      errors: transformToNestObject(
        parseErrorSchema(error, criteriaMode === 'all'),
      ),
    };
  }
};
