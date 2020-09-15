import {
  appendErrors,
  FieldValues,
  Resolver,
  ResolverError,
  ResolverSuccess,
  transformToNestObject,
} from 'react-hook-form';
import { Schema, ZodError } from 'zod';
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

export const zodResolver = <TFieldValues extends FieldValues>(
  schema: Schema<TFieldValues>,
  options?: ParseParams,
): Resolver<TFieldValues> => async (
  values,
  _,
  validateAllFieldCriteria = false,
) => {
  const result = schema.safeParse(values, options);

  if (result.success) {
    return { values: result.data, errors: {} } as ResolverSuccess<TFieldValues>;
  }

  return {
    values: {},
    errors: transformToNestObject(
      parseErrorSchema(result.error, validateAllFieldCriteria),
    ),
  } as ResolverError<TFieldValues>;
};
