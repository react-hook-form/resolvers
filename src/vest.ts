import { FieldValues, Resolver, transformToNestObject } from 'react-hook-form';
import * as vest from 'vest';

type VestErrors = Record<string, string[]>;

type ICreateResult = ReturnType<typeof vest.create>;

const parseErrorSchema = (
  values,
  result,
  validateAllFieldCriteria: boolean,
) => {
  return Object.keys(values).reduce((prev, fieldName) => {
	const fieldErrors = result.getErrors(fieldName);
	// future: const fieldWarnings = result.getWarnings(fieldName);
    return {
      ...prev,
      [fieldName]: {
        type: '',
        message: fieldErrors[0],
        ...(validateAllFieldCriteria
          ? {
              types: fieldErrors.reduce((prev, message, index) => {
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

  if (!result.hasErrors()) {
    return { values: values as any, errors: {} };
  }

  return {
    values: {},
    errors: transformToNestObject(
      parseErrorSchema(errors, validateAllFieldCriteria),
    ),
  };
};
