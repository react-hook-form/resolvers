import { appendErrors, transformToNestObject } from 'react-hook-form';
import convertArrayToPathName from './utils/convertArrayToPathName';

type JoiError = {
  details: any;
};

type FieldValues = Record<string, any>;

type FieldError = {
  path: (string | number)[];
  message: string;
  type: string;
};

const parseErrorSchema = (
  error: JoiError,
  validateAllFieldCriteria: boolean,
) => {
  console.log(error.details[0].path);
  return Array.isArray(error.details)
    ? error.details.reduce(
        (previous: FieldValues, { path, message = '', type }: FieldError) => {
          const currentPath = convertArrayToPathName(path);

          return {
            ...previous,
            ...(currentPath
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
      )
    : [];
};

export const joiResolver = (
  validationSchema: any,
  config: any = {
    abortEarly: false,
  },
) => async (data: any, _: any = {}, validateAllFieldCriteria = false) => {
  const { error: errors, value: values } = validationSchema.validate(data, {
    ...config,
  });

  return {
    values,
    errors: parseErrorSchema(errors, validateAllFieldCriteria),
  };

  try {
    return {
      values: validationSchema.validate(data, {
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
