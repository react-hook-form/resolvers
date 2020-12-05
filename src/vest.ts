import { FieldValues, Resolver, transformToNestObject } from 'react-hook-form';
import * as Vest from 'vest';

type VestErrors = Record<string, string[]>;

type ICreateResult = ReturnType<typeof Vest.create>;

type Promisify = <T extends ICreateResult, K>(
  fn: T,
) => (args: K) => Promise<Vest.IVestResult>;

const promisify: Promisify = (validatorFn) => (...args) =>
  new Promise((resolve) => validatorFn(...args).done(resolve as Vest.DoneCB));

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
  const validateSchema = promisify(schema);
  const result = await validateSchema(values);
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
