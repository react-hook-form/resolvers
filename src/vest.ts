import { FieldValues, Resolver, transformToNestObject } from 'react-hook-form';
import * as vest from 'vest';

type VestErrors = Record<string, string[]>;

type ICreateResult = ReturnType<typeof vest.create>;

const parseErrorSchema = (
  vestError: VestErrors,
  validateAllFieldCriteria: boolean,
) => {
  return Object.entries(vestError).reduce((prev, [key, value]) => {
    return {
      ...prev,
      [key]: {
        type: '',
        message: value[0],
        ...(validateAllFieldCriteria
          ? {
              types: value.reduce((prev, message, index) => {
                return {
                  ...prev,
                  [index]: message,
                };
              }, {}),
            }
          : {}),
      },
    };
  }, {});
};

export const vestResolver = <TFieldValues extends FieldValues>(
  schema: ICreateResult,
  _: any = {},
  validateAllFieldCriteria = false,
): Resolver<TFieldValues> => async (values) => {
  const result = schema(values);
  const errors = result.getErrors();

  if (!Object.keys(errors).length) {
    return { values: values as any, errors: {} };
  }

  return {
    values: {},
    errors: transformToNestObject(
      parseErrorSchema(errors, validateAllFieldCriteria),
    ),
  };
};
