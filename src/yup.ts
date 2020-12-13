import { Resolver, transformToNestObject } from 'react-hook-form';
import Yup from 'yup';

const parseErrorSchema = (
  error: Yup.ValidationError,
  validateAllFieldCriteria: boolean,
) =>
  Array.isArray(error.inner) && error.inner.length
    ? error.inner.reduce(
        (previous: Record<string, any>, { path, message, type }) => {
          // eslint-disable-next-line
          // @ts-ignore
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
                            // eslint-disable-next-line
                            // @ts-ignore
                            [type]: previousTypes[type]
                              ? // eslint-disable-next-line
          // @ts-ignore
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
        // eslint-disable-next-line
      // @ts-ignore
        [error.path]: { message: error.message, type: error.type },
      };

type ValidateOptions<T extends Yup.ObjectSchema<any>> = Parameters<
  T['validate']
>[1];

export const yupResolver = <T extends Yup.ObjectSchema<any>>(
  schema: T,
  options: ValidateOptions<T> = {
    abortEarly: false,
  },
): Resolver<Yup.InferType<T>> => async (
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
      values: (await schema.validate(values, {
        ...options,
        context,
      })) as any,
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
