import { appendErrors, transformToNestObject } from 'react-hook-form';
import * as z from 'zod';
// @ts-expect-error maybe fixed after the first publish ?
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

export const zodResolver: Resolver = (schema, options) => async (
  values,
  _,
  validateAllFieldCriteria = false,
) => {
  const result = schema.safeParse(values, options);

  if (result.success) {
    return { values: result.data, errors: {} };
  }

  return {
    values: {},
    errors: transformToNestObject(
      parseErrorSchema(result.error, validateAllFieldCriteria),
    ),
  };
};
