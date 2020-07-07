import { appendErrors, transformToNestObject, Resolver } from 'react-hook-form';
import NopeObject from 'nope-validator/lib/umd/NopeObject';

const parseNopeSchema = (error: any, validateAllFieldCriteria: boolean) => {
  const errors = Object.keys(error);

  return Array.isArray(errors)
    ? errors.reduce((acc: Record<string, any>, fieldName) => {
        return {
          ...acc,
          ...(fieldName
            ? acc[fieldName] && validateAllFieldCriteria
              ? {
                  [fieldName]: appendErrors(
                    fieldName,
                    validateAllFieldCriteria,
                    acc,
                    '',
                    error[fieldName],
                  ),
                }
              : {
                  [fieldName]: acc[fieldName] || {
                    message: error[fieldName],
                    ...(validateAllFieldCriteria
                      ? {
                          types: {
                            '': error[fieldName] || true,
                          },
                        }
                      : {}),
                  },
                }
            : {}),
        };
      }, {})
    : [];
};

export const nopeResolver = <TFieldValues extends Record<string, any>>(
  schema: NopeObject,
): Resolver<TFieldValues> => async (
  values,
  _,
  validateAllFieldCriteria = false,
) => {
  const error = schema.validate(values);
  if (error) {
    return {
      values: {},
      errors: transformToNestObject(
        parseNopeSchema(error, validateAllFieldCriteria),
      ),
    };
  } else {
    return {
      values: values as any,
      errors: {},
    };
  }
};
