import {
  appendErrors,
  Resolver,
  ResolverError,
  ResolverSuccess,
  transformToNestObject,
} from 'react-hook-form';
import * as z from 'zod';
import { ParseParams } from 'zod/lib/src/parser';
// @ts-expect-error maybe fixed after the first publish ?
import { convertArrayToPathName } from '@hookform/resolvers';

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

export const zodResolver = <T extends z.ZodSchema<any, any>>(
  schema: T,
  options?: ParseParams,
): Resolver<z.infer<T>> => async (
  values,
  _,
  validateAllFieldCriteria = false,
) => {
  const result = schema.safeParse(values, options);

  if (result.success) {
    return { values: result.data, errors: {} } as ResolverSuccess<z.infer<T>>;
  }

  return {
    values: {},
    errors: transformToNestObject(
      parseErrorSchema(result.error, validateAllFieldCriteria),
    ),
  } as ResolverError<z.infer<T>>;
};
