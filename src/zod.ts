import {
  appendErrors,
  Resolver,
  ResolverError,
  ResolverSuccess,
  transformToNestObject,
} from 'react-hook-form';
import { ZodSchema, ZodError, TypeOf } from 'zod';
import { ParseParams } from 'zod/lib/src/parser';
import convertArrayToPathName from './utils/convertArrayToPathName';

const parseErrorSchema = (
  zodError: ZodError,
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

export const zodResolver = <T extends ZodSchema<any, any>>(
  schema: T,
  options?: ParseParams,
): Resolver<TypeOf<T>> => async (
  values,
  _,
  validateAllFieldCriteria = false,
) => {
  const result = schema.safeParse(values, options);

  if (result.success) {
    return { values: result.data, errors: {} } as ResolverSuccess<TypeOf<T>>;
  }

  return {
    values: {},
    errors: transformToNestObject(
      parseErrorSchema(result.error, validateAllFieldCriteria),
    ),
  } as ResolverError<TypeOf<T>>;
};
