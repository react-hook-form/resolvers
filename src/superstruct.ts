import { appendErrors, transformToNestObject } from 'react-hook-form';
import convertArrayToPathName from './utils/convertArrayToPathName';

type SuperStructError = {
  failures: any;
};

type FieldValues = Record<string, any>;

const parseErrorSchema = (
  error: SuperStructError,
  validateAllFieldCriteria: boolean,
) =>
  Array.isArray(error.failures)
    ? error.failures.reduce(
        (previous: FieldValues, { path, message, type }: FieldValues) => {
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
      )
    : [];

export const superstructResolver = (validationSchema: any) => async (
  data: any,
  _: any = {},
  validateAllFieldCriteria = false,
) => {
  try {
    return {
      values: validationSchema(data),
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
