import { Resolver, transformToNestObject } from 'react-hook-form';
import { FieldError, FieldErrors } from 'react-hook-form/dist/types/form';
import { DeepMap } from 'react-hook-form/dist/types/utils';
import Yup from 'yup';

const parseErrorSchema = <TFieldValues extends Record<string, any>>(
  error: Yup.ValidationError,
  validateAllFieldCriteria: boolean,
): DeepMap<TFieldValues, FieldError> =>
  Array.isArray(error.inner) && error.inner.length
    ? error.inner.reduce<FieldErrors<TFieldValues>>(
        (previous, { path, message, type }) => {
          const previousPath = previous[path] as FieldErrors | undefined;
          const previousTypes = validateAllFieldCriteria
            ? previousPath?.types || []
            : {};
          return {
            ...previous,
            [path]: {
              ...(previous[path] || {
                message,
                type,
                types: previousTypes,
              }),
              types: {
                ...previousTypes,
                [type]: validateAllFieldCriteria
                  ? [message, ...(previousTypes[type] || [])]
                  : message,
              },
            },
          };
        },
        {},
      )
    : ({
        [error.path]: {
          message: error.message,
          type: error.type,
        },
      } as DeepMap<TFieldValues, FieldError>);

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
