import { appendErrors, transformToNestObject } from 'react-hook-form';
import Joi from '@hapi/joi';
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

const parseErrorSchema = (error: JoiError, validateAllFieldCriteria: boolean) =>
  Array.isArray(error.details)
    ? error.details.reduce(
        (previous: FieldValues, { path, message = '', type }: FieldError) => {
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

export const joiResolver = (
  validationSchema: Joi.Schema,
  config: any = {
    abortEarly: false,
  },
) => async (data: any, _: any = {}, validateAllFieldCriteria = false) => {
  try {
    const values = await validationSchema.validateAsync(data, {
      ...config,
    });

    return {
      values,
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
