/* eslint-disable @typescript-eslint/ban-ts-comment */
import { FieldValues, Resolver, transformToNestObject } from 'react-hook-form';
import Yup from 'yup';

/**
 * From 0.32.0, Yup add TypeScript support and `path` typing is optional that's why we have `@ts-expect-error`
 * FYI: `path`: a string, indicating where there error was thrown. `path` is empty at the root level.
 * react-hook-form's values are object so path is defined
 * https://github.com/jquense/yup#validationerrorerrors-string--arraystring-value-any-path-string
 */
const parseErrorSchema = (
  error: Yup.ValidationError,
  validateAllFieldCriteria: boolean,
) => {
  return Array.isArray(error.inner) && error.inner.length
    ? error.inner.reduce(
        (previous: Record<string, any>, { path, message, type }) => {
          // @ts-expect-error
          const previousTypes = (previous[path] && previous[path].types) || {};
          const key = path || type;

          return {
            ...previous,
            ...(key
              ? {
                  [key]: {
                    ...(previous[key] || {
                      message,
                      type,
                    }),
                    ...(validateAllFieldCriteria
                      ? {
                          types: {
                            ...previousTypes,
                            // @ts-expect-error
                            [type]: previousTypes[type]
                              ? // @ts-expect-error
                                [...[].concat(previousTypes[type]), message]
                              : message,
                          },
                        }
                      : {}),
                  },
                }
              : {}),
          };
        },
        {},
      )
    : {
        // @ts-expect-error
        [error.path]: { message: error.message, type: error.type },
      };
};

type ValidateOptions<T extends Yup.AnyObjectSchema> = Parameters<
  T['validate']
>[1];

export const yupResolver = <TFieldValues extends FieldValues>(
  schema: Yup.AnyObjectSchema,
  options: ValidateOptions<Yup.AnyObjectSchema> = {
    abortEarly: false,
  },
): Resolver<TFieldValues> => async (
  values,
  context,
  validateAllFieldCriteria = false,
) => {
  try {
    if (options.context && process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn(
        "You should not used the yup options context. Please, use the 'useForm' context object instead",
      );
    }
    return {
      values: await schema.validate(values, {
        ...options,
        context,
      }),
      errors: {},
    };
  } catch (e) {
    const parsedErrors = parseErrorSchema(e, validateAllFieldCriteria);
    return {
      values: {},
      errors: transformToNestObject(parsedErrors),
    };
  }
};
