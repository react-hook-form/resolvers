import {
  appendErrors,
  Resolver,
  ResolverError,
  ResolverSuccess,
  transformToNestObject,
} from 'react-hook-form';
import * as z from 'zod';
import { ParseParams } from 'zod/lib/src/parser';
import { convertArrayToPathName } from '@hookform/resolvers';

const parseErrorSchema = (
  zodError: z.ZodError,
  validateAllFieldCriteria: boolean,
) => {
  if (zodError.isEmpty) {
    return {};
  }

  const errors = [...zodError.errors];
  let previous: Record<string, any> = {};

  for (const error of errors) {
    const { path, message, code: type } = error;
    const currentPath = convertArrayToPathName(path);

    if ('unionErrors' in error) {
      for (const subErrors of error.unionErrors.map((e) => e.errors)) {
        errors.push(...subErrors);
      }
    }

    previous = {
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
  }

  return previous;
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
