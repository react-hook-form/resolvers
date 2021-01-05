import {
  appendErrors,
  transformToNestObject,
  Resolver,
  ResolverSuccess,
  ResolverError,
} from 'react-hook-form';
import { StructError, validate, Struct, Infer } from 'superstruct';
// @ts-expect-error maybe fixed after the first publish ?
import { convertArrayToPathName } from '@hookform/resolvers';

const parseErrorSchema = (
  error: StructError,
  validateAllFieldCriteria: boolean,
) =>
  error
    .failures()
    .reduce((previous: Record<string, any>, { path, message = '', type }) => {
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
                  type || '',
                  message,
                ),
              }
            : {
                [currentPath]: previous[currentPath] || {
                  message,
                  type,
                  ...(validateAllFieldCriteria
                    ? {
                        types: { [type || '']: message || true },
                      }
                    : {}),
                },
              }
          : {}),
      };
    }, {});

type Options = Parameters<typeof validate>[2];

export const superstructResolver = <T extends Struct<any, any>>(
  schema: T,
  options?: Options,
): Resolver<Infer<T>> => (values, _, validateAllFieldCriteria = false) => {
  const [errors, result] = validate(values, schema, options);

  if (errors != null) {
    return {
      values: {},
      errors: transformToNestObject(
        parseErrorSchema(errors, validateAllFieldCriteria),
      ),
    } as ResolverError<Infer<T>>;
  }

  return {
    values: result,
    errors: {},
  } as ResolverSuccess<Infer<T>>;
};
