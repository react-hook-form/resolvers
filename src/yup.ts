import { appendErrors, transformToNestObject, Resolver } from 'react-hook-form';
import Yup from 'yup';

const parseErrorSchema = (
  error: Yup.ValidationError,
  validateAllFieldCriteria: boolean,
) =>
  Array.isArray(error.inner)
    ? error.inner.reduce(
        (previous: Record<string, any>, { path, message, type }) => ({
          ...previous,
          ...(path
            ? previous[path] && validateAllFieldCriteria
              ? {
                  [path]: appendErrors(
                    path,
                    validateAllFieldCriteria,
                    previous,
                    type,
                    message,
                  ),
                }
              : {
                  [path]: previous[path] || {
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
        }),
        {},
      )
    : {
        [error.path]: { message: error.message, type: error.type },
      };

export const yupResolver = <TFieldValues extends Record<string, any>>(
  schema: Yup.ObjectSchema | Yup.Lazy,
  options: Yup.ValidateOptions = {
    abortEarly: false,
  },
): Resolver<TFieldValues> => async (
  values,
  context,
  validateAllFieldCriteria = false,
) => {
  try {
    return {
      values: (await schema.validate(values, {
        context,
        ...options,
      })) as any,
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
