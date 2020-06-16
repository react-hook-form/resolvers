import { appendErrors, transformToNestObject, Resolver } from 'react-hook-form';
import Superstruct from 'superstruct';
import convertArrayToPathName from './utils/convertArrayToPathName';

const parseErrorSchema = (
  error: Superstruct.StructError,
  validateAllFieldCriteria: boolean,
) =>
  Array.isArray(error.failures)
    ? error.failures.reduce(
        (previous: Record<string, any>, { path, message = '', type }) => {
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
        },
        {},
      )
    : [];

export const superstructResolver = <TFieldValues extends Record<string, any>>(
  schema: Superstruct.Struct,
): Resolver<TFieldValues> => async (
  values,
  _,
  validateAllFieldCriteria = false,
) => {
  try {
    return {
      values: schema(values),
      errors: {},
    };
  } catch (e) {
    return {
      values: {},
      errors: transformToNestObject(
        parseErrorSchema(e, validateAllFieldCriteria),
      ),
    };
  }
};
