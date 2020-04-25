import { appendErrors, transformToNestObject } from 'react-hook-form';

type YupValidationError = {
  inner: { path: string; message: string; type: string }[];
  path: string;
  message: string;
  type: string;
};

type FieldValues = Record<string, any>;

export const parseErrorSchema = (
  error: YupValidationError,
  validateAllFieldCriteria: boolean,
) =>
  Array.isArray(error.inner)
    ? error.inner.reduce(
        (previous: FieldValues, { path, message, type }: FieldValues) => ({
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

export const yupResolver = (
  validationSchema: any,
  config: any = {
    abortEarly: false,
  },
) => async (data: any, _: any = {}, validateAllFieldCriteria = false) => {
  try {
    return {
      values: await validationSchema.validate(data, {
        ...config,
      }),
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
